import { useMemo, useState } from "react";
import Modal from "~/components/ui/Modal";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { getDeliveryPoints } from "~/data/delivery";

interface PvzModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pointLabel: string) => void;
}

export default function PvzModal({ isOpen, onClose, onSelect }: PvzModalProps) {
  const points = getDeliveryPoints("pvz");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const found = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return points;
    return points.filter((point) =>
      `${point.provider} ${point.city} ${point.address}`.toLowerCase().includes(needle),
    );
  }, [points, query]);

  const handleConfirm = () => {
    const point = points.find((row) => row.id === selectedId);
    if (!point) return;
    onSelect(`${point.provider}, ${point.city}, ${point.address}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор пункта выдачи" size="lg">
      <div className="mb-6">
        <Input
          name="pvz-search"
          placeholder="Город, улица, метро…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="mb-6 space-y-4">
        {found.length === 0 && (
          <p className="text-lg text-brand-mauve">По запросу «{query}» пунктов выдачи не найдено.</p>
        )}

        {found.map((point) => (
          <button
            key={point.id}
            type="button"
            onClick={() => setSelectedId(point.id)}
            className={[
              "w-full rounded-xl border p-4 text-left transition-colors",
              selectedId === point.id
                ? "border-brand-mauve bg-brand-plum/60"
                : "border-brand-plum bg-brand-bg/40 hover:border-brand-mauve",
            ].join(" ")}
          >
            <span className="block text-xl text-brand-white">{point.provider}</span>
            <span className="block text-brand-mauve">
              {point.city}, {point.address}
            </span>
            <span className="block text-sm text-brand-mauve/80">{point.workHours}</span>
          </button>
        ))}
      </div>

      <Button fullWidth onClick={handleConfirm} disabled={!selectedId}>
        Выбрать этот пункт
      </Button>
    </Modal>
  );
}
