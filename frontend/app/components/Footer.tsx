import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-plum bg-brand-purple">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-brand-mauve md:grid-cols-3">
        <div>
          <p className="flex items-center gap-3 text-2xl text-brand-white">
            <span className="text-3xl text-brand-mauve">𝒩</span> Noir Bijoux
          </p>
          <p className="mt-2">Авторская бижутерия ручной работы</p>
          <p className="mt-1 text-sm">© 2026 Noir Bijoux</p>
        </div>

        <div className="text-lg">
          <p className="mb-3 text-brand-white">Разделы</p>
          <ul className="space-y-2">
            <li>
              <Link to="/catalog" className="hover:text-brand-white">
                Каталог изделий
              </Link>
            </li>
            <li>
              <Link to="/constructor" className="hover:text-brand-white">
                Конструктор украшений
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand-white">
                О мастере
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-brand-white">
                Оформление заказа
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-lg">
          <p className="mb-3 text-brand-white">Контакты</p>
          <p>Мастерская: ул. Дуси Ковальчук, 250</p>
          <p>Пн–Пт 10:00–19:00, Сб 11:00–16:00</p>
          <p>+7 (383) 000-00-01</p>
          <p>noir@bijoux.ru</p>
        </div>
      </div>
    </footer>
  );
}
