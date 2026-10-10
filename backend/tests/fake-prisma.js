// ─────────────────────────────────────────────────────────────────────────────
// In-memory заглушка Prisma Client для автотестов API.
//
// Зачем: тесты должны проверять маршруты, валидацию, JWT и бизнес-логику
// без запущенного SQL Server. Заглушка реализует те же методы, что использует
// код приложения (findMany, findUnique, findFirst, create, update, delete,
// count, $queryRaw) и хранит данные в обычных массивах в памяти.
//
// ВАЖНО: в реальном приложении этот файл не используется — там работает
// настоящий Prisma Client с базой MSSQL (src/prisma/client.ts).
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

// ── связи между таблицами (для include и фильтров по связанным записям) ─────
const RELATIONS = {
  user: {
    builds: { model: "build", many: true, foreignKey: "userId" },
    orders: { model: "order", many: true, foreignKey: "userId" },
    favorites: { model: "favorite", many: true, foreignKey: "userId" },
  },
  category: { products: { model: "product", many: true, foreignKey: "categoryId" } },
  material: {
    products: { model: "product", many: true, foreignKey: "materialId" },
    components: { model: "component", many: true, foreignKey: "materialId" },
  },
  product: {
    category: { model: "category", many: false, foreignKey: "categoryId" },
    material: { model: "material", many: false, foreignKey: "materialId" },
    orderItems: { model: "orderItem", many: true, foreignKey: "productId" },
  },
  component: {
    material: { model: "material", many: false, foreignKey: "materialId" },
    buildItems: { model: "buildItem", many: true, foreignKey: "componentId" },
  },
  build: {
    user: { model: "user", many: false, foreignKey: "userId" },
    items: { model: "buildItem", many: true, foreignKey: "buildId" },
    favorites: { model: "favorite", many: true, foreignKey: "buildId" },
  },
  buildItem: {
    build: { model: "build", many: false, foreignKey: "buildId" },
    component: { model: "component", many: false, foreignKey: "componentId" },
  },
  order: {
    user: { model: "user", many: false, foreignKey: "userId" },
    items: { model: "orderItem", many: true, foreignKey: "orderId" },
  },
  orderItem: {
    order: { model: "order", many: false, foreignKey: "orderId" },
    product: { model: "product", many: false, foreignKey: "productId" },
    build: { model: "build", many: false, foreignKey: "buildId" },
  },
  favorite: {
    user: { model: "user", many: false, foreignKey: "userId" },
    build: { model: "build", many: false, foreignKey: "buildId" },
  },
  pickupPoint: {},
  chatMessage: {},
};

// значения по умолчанию, которые в настоящей базе заданы в schema.prisma
const DEFAULTS = {
  user: { role: "client", phone: null, avatarUrl: null },
  product: { isActive: true, description: null },
  component: { isActive: true, materialId: null, layerZ: 1 },
  build: { userId: null },
  buildItem: { layerZ: 1 },
  order: { userId: null, status: "new", email: null, address: null, comment: null, pickupPointId: null },
  favorite: {},
  category: {},
  material: {},
  pickupPoint: { phone: null, workHours: null },
  chatMessage: {},
};

const TABLES = Object.keys(RELATIONS);

// ── сравнение записи с условием where ───────────────────────────────────────
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function matchScalar(actual, condition) {
  if (condition === null) return actual === null || actual === undefined;
  if (typeof condition !== "object" || condition instanceof Date) return actual === condition;

  return Object.entries(condition).every(([operator, expected]) => {
    switch (operator) {
      case "equals":
        return matchScalar(actual, expected);
      case "not":
        return !matchScalar(actual, expected);
      case "in":
        return toArray(expected).some((value) => value === actual);
      case "notIn":
        return !toArray(expected).some((value) => value === actual);
      case "lt":
        return Number(actual) < Number(expected);
      case "lte":
        return Number(actual) <= Number(expected);
      case "gt":
        return Number(actual) > Number(expected);
      case "gte":
        return Number(actual) >= Number(expected);
      case "contains":
        // в MSSQL с сортировкой по умолчанию поиск без учёта регистра
        return String(actual ?? "").toLowerCase().includes(String(expected).toLowerCase());
      case "startsWith":
        return String(actual ?? "").toLowerCase().startsWith(String(expected).toLowerCase());
      case "endsWith":
        return String(actual ?? "").toLowerCase().endsWith(String(expected).toLowerCase());
      case "mode":
        return true;
      default:
        return true;
    }
  });
}

function createQueryEngine(tables) {
  function match(record, where, model) {
    if (!where) return true;

    return Object.entries(where).every(([key, condition]) => {
      if (key === "AND") return toArray(condition).every((part) => match(record, part, model));
      if (key === "OR") return toArray(condition).some((part) => match(record, part, model));
      if (key === "NOT") return !toArray(condition).every((part) => match(record, part, model));

      const relation = RELATIONS[model]?.[key];

      if (relation) {
        // условие вида { category: { slug: "necklace" } } или { items: { some: {...} } }
        const nested = condition?.is ?? condition?.some ?? condition;

        if (relation.many) {
          const children = tables[relation.model].filter((child) => child[relation.foreignKey] === record.id);
          return children.some((child) => match(child, nested, relation.model));
        }

        const parent = tables[relation.model].find((row) => row.id === record[relation.foreignKey]);
        return parent ? match(parent, nested, relation.model) : false;
      }

      return matchScalar(record[key], condition);
    });
  }

  function sort(rows, orderBy) {
    if (!orderBy) return rows;

    const clauses = toArray(orderBy);
    return [...rows].sort((a, b) => {
      for (const clause of clauses) {
        const [field, direction] = Object.entries(clause)[0];
        const left = a[field];
        const right = b[field];
        if (left === right) continue;

        const factor = String(direction).toLowerCase() === "desc" ? -1 : 1;
        const compare =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left ?? "").localeCompare(String(right ?? ""));
        return compare * factor;
      }
      return 0;
    });
  }

  function includeRelations(record, include, model) {
    if (!include || !record) return record;

    const result = { ...record };

    for (const [key, value] of Object.entries(include)) {
      const relation = RELATIONS[model]?.[key];
      if (!relation) continue;

      if (relation.many) {
        const children = tables[relation.model].filter((child) => child[relation.foreignKey] === record.id);
        result[key] = children.map((child) =>
          includeRelations(child, value && typeof value === "object" ? value.include : null, relation.model),
        );
      } else {
        const parent = tables[relation.model].find((row) => row.id === record[relation.foreignKey]) ?? null;
        result[key] = parent
          ? includeRelations(parent, value && typeof value === "object" ? value.include : null, relation.model)
          : null;
      }
    }

    return result;
  }

  return { match, sort, includeRelations };
}

function createFakePrisma() {
  const tables = {};
  for (const name of TABLES) tables[name] = [];

  const nextId = {};
  for (const name of TABLES) nextId[name] = 1;

  const query = createQueryEngine(tables);

  /** выдаёт следующий свободный идентификатор (учитывает записи, добавленные seed-ом) */
  function allocateId(model, requested) {
    if (requested !== undefined) return requested;

    let candidate = nextId[model];
    while (tables[model].some((row) => row.id === candidate)) candidate += 1;
    nextId[model] = candidate + 1;
    return candidate;
  }

  function createRecord(model, data) {
    const defaults = DEFAULTS[model] ?? {};
    const record = { ...defaults, ...data, id: allocateId(model, data.id) };

    if (model !== "category" && model !== "material" && model !== "pickupPoint" && model !== "chatMessage") {
      record.createdAt = data.createdAt ?? new Date();
    }

    // отделяем вложенные create (например items: { create: [...] })
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === "object" && !Array.isArray(value) && value.create) {
        delete record[key];
      }
    }

    tables[model].push(record);

    for (const [key, value] of Object.entries(data)) {
      if (!value || typeof value !== "object" || !value.create) continue;

      const relation = RELATIONS[model]?.[key];
      if (!relation) continue;

      for (const childData of toArray(value.create)) {
        createRecord(relation.model, { ...childData, [relation.foreignKey]: record.id });
      }
    }

    return record;
  }

  function findManyRows(model, args) {
    const rows = tables[model].filter((row) => query.match(row, args.where, model));
    const sorted = query.sort(rows, args.orderBy ?? { id: "asc" });
    const skipped = args.skip ? sorted.slice(args.skip) : sorted;
    const limited = args.take ? skipped.slice(0, args.take) : skipped;
    return limited.map((row) => query.includeRelations(row, args.include, model));
  }

  function makeModel(model) {
    const uniqueKeys = ["id", "email", "slug", "orderNumber", "article"];

    return {
      findMany: async (args = {}) => findManyRows(model, args),

      findFirst: async (args = {}) => {
        const rows = findManyRows(model, { ...args, take: 1 });
        return rows[0] ?? null;
      },

      findUnique: async (args = {}) => {
        const where = args.where ?? {};
        const row = tables[model].find((candidate) =>
          uniqueKeys.some((key) => where[key] !== undefined && candidate[key] === where[key]),
        );
        if (!row) return null;
        return query.includeRelations(row, args.include, model);
      },

      count: async (args = {}) => tables[model].filter((row) => query.match(row, args.where, model)).length,

      deleteMany: async (args = {}) => {
        const keep = tables[model].filter((row) => !query.match(row, args.where, model));
        const removed = tables[model].length - keep.length;
        tables[model] = keep;
        return { count: removed };
      },

      createMany: async (args = {}) => {
        for (const row of toArray(args.data ?? [])) createRecord(model, row);
        return { count: toArray(args.data ?? []).length };
      },

      create: async (args = {}) => {
        const record = createRecord(model, args.data ?? {});
        return query.includeRelations(record, args.include, model);
      },

      update: async (args = {}) => {
        const where = args.where ?? {};
        const row = tables[model].find((candidate) =>
          uniqueKeys.some((key) => where[key] !== undefined && candidate[key] === where[key]),
        );
        if (!row) {
          const error = new Error(`Запись ${model} не найдена (тестовая заглушка Prisma)`);
          error.code = "P2025";
          throw error;
        }

        Object.assign(row, args.data ?? {});
        return query.includeRelations(row, args.include, model);
      },

      delete: async (args = {}) => {
        const where = args.where ?? {};
        const index = tables[model].findIndex((candidate) =>
          uniqueKeys.some((key) => where[key] !== undefined && candidate[key] === where[key]),
        );
        if (index === -1) {
          const error = new Error(`Запись ${model} не найдена (тестовая заглушка Prisma)`);
          error.code = "P2025";
          throw error;
        }

        const [removed] = tables[model].splice(index, 1);

        // каскадное удаление дочерних записей (как onDelete: Cascade в схеме)
        for (const [name, relations] of Object.entries(RELATIONS)) {
          for (const [key, relation] of Object.entries(relations)) {
            if (relation.model === model && relation.many) {
              tables[name] = tables[name].filter((child) => child[relation.foreignKey] !== removed.id);
            }
          }
        }

        return removed;
      },
    };
  }

  const prisma = {};

  for (const model of TABLES) {
    prisma[model] = makeModel(model);
  }

  // тег-шаблон $queryRaw (используется в /api/health)
  prisma.$queryRaw = async () => [{ ok: 1 }];
  prisma.$connect = async () => undefined;
  prisma.$disconnect = async () => undefined;

  // прямой доступ к данным — нужен только тестам (например, чтобы выдать роль admin)
  prisma.__db = tables;

  return prisma;
}

// ── тестовые данные (те же, что в шаге 5 уйдут в базу MSSQL) ─────────────────
function seed(prisma) {
  const db = prisma.__db;

  db.category.push(
    { id: 1, name: "Колье", slug: "necklace" },
    { id: 2, name: "Браслет", slug: "bracelet" },
    { id: 3, name: "Серьги", slug: "earrings" },
    { id: 4, name: "Кольцо", slug: "ring" },
  );

  db.material.push(
    { id: 1, name: "Серебро 925" },
    { id: 2, name: "Ювелирный сплав" },
    { id: 3, name: "Чёрный родий" },
  );

  const products = [
    [1, "Колье «Ночная Роза»", "necklace-night-rose", 1, 1, 4500, "Серебро 925"],
    [2, "Колье «Оникс капля»", "necklace-onyx-drop", 1, 1, 5200, "Серебро 925"],
    [3, "Чокер «Оникс»", "choker-onyx", 1, 2, 3200, "Ювелирный сплав"],
    [4, "Браслет «Dark Star»", "bracelet-dark-star", 2, 2, 3200, "Ювелирный сплав"],
    [5, "Браслет «Лилит»", "bracelet-lilith", 2, 1, 3900, "Серебро 925"],
    [6, "Серьги «Абсолют»", "earrings-absolute", 3, 1, 2800, "Серебро 925"],
    [7, "Серьги «Чёрная роза»", "earrings-black-rose", 3, 3, 3400, "Чёрный родий"],
    [8, "Кольцо «Жемчужное»", "ring-pearl", 4, 1, 3900, "Серебро 925"],
  ];

  for (const [id, name, slug, categoryId, materialId, price, materialName] of products) {
    db.product.push({
      id,
      name,
      slug,
      categoryId,
      materialId,
      price,
      imageUrl: `/assets/catalog/${slug}.svg`,
      description: `${name} — изделие ручной работы, материал: ${materialName}.`,
      isActive: true,
      createdAt: new Date(),
    });
  }

  const components = [
    [1, "Панцирная цепочка", "necklace", "chain", 1500, 1],
    [2, "Бархатный чокер", "necklace", "chain", 900, 1],
    [3, "Подвеска «Чёрная Роза»", "necklace", "pendant", 1200, 5],
    [4, "Подвеска «Оникс капля»", "necklace", "pendant", 1500, 5],
    [5, "Подвеска «Крест»", "necklace", "pendant", 2000, 5],
    [6, "Карабин", "necklace", "clasp", 300, 8],
    [7, "40 см — чокер", "necklace", "length", 0, 0],
    [11, "Бусины из оникса", "bracelet", "beads", 1200, 1],
    [12, "Жемчужные бусины", "bracelet", "beads", 1400, 1],
    [13, "Шарм «Звезда»", "bracelet", "charm", 700, 6],
    [16, "Карабин для браслета", "bracelet", "clasp", 400, 8],
    [21, "Английский замок", "earrings", "clasp", 900, 8],
    [22, "Швензы-крючки", "earrings", "clasp", 500, 8],
    [24, "Оникс (капля)", "earrings", "stone", 1000, 5],
    [25, "Жемчуг", "earrings", "stone", 1100, 5],
    [29, "Основа — серебро 925", "ring", "material", 2000, 1],
    [30, "Основа — золото", "ring", "material", 2500, 1],
    [32, "Профиль «Классика»", "ring", "profile", 300, 4],
    [35, "Камень — оникс", "ring", "stone", 1200, 6],
    [36, "Камень — жемчуг", "ring", "stone", 1500, 6],
    [37, "Размер 16", "ring", "size", 0, 0],
  ];

  for (const [id, name, jewelryType, slot, price, layerZ] of components) {
    db.component.push({
      id,
      name,
      jewelryType,
      slot,
      materialId: null,
      price,
      imageUrl: `/assets/components/${jewelryType}/${slot}-${id}.svg`,
      layerZ,
      isActive: true,
    });
  }

  db.pickupPoint.push(
    { id: 1, kind: "pickup", provider: "Мастерская Noir Bijoux", city: "Новосибирск", address: "ул. Дуси Ковальчук, 250", workHours: "Пн–Пт 10:00–19:00", phone: "+7 (383) 000-00-01" },
    { id: 2, kind: "pickup", provider: "Шоурум «Aesthetics»", city: "Новосибирск", address: "Красный проспект, 100", workHours: "Ежедневно 10:00–20:00", phone: "+7 (383) 000-00-02" },
    { id: 3, kind: "pvz", provider: "ПВЗ СДЭК", city: "Новосибирск", address: "ул. Ленина, 12", workHours: "Пн–Сб 10:00–20:00", phone: null },
    { id: 4, kind: "pvz", provider: "ПВЗ Boxberry", city: "Новосибирск", address: "ул. Гоголя, 15", workHours: "Пн–Пт 09:00–19:00", phone: null },
  );

  // счётчики id подтягиваются автоматически при первой вставке (см. allocateId)
}

/**
 * Пользователи для демонстрационного режима (npm run demo).
 * Пароли хранятся в виде bcrypt-хешей — как в настоящей базе.
 */
function seedUsers(prisma) {
  const bcrypt = require("bcryptjs");

  prisma.__db.user.push(
    {
      id: 1,
      email: "olga@mail.ru",
      password: bcrypt.hashSync("noir1234", 10),
      fullName: "Ольга Иванова",
      phone: "+7 (999) 000-00-00",
      avatarUrl: null,
      role: "client",
      createdAt: new Date(),
    },
    {
      id: 2,
      email: "admin@noir.ru",
      password: bcrypt.hashSync("admin1234", 10),
      fullName: "Администратор Noir Bijoux",
      phone: "+7 (383) 000-00-01",
      avatarUrl: null,
      role: "admin",
      createdAt: new Date(),
    },
  );
}

module.exports = { createFakePrisma, seed, seedUsers };
