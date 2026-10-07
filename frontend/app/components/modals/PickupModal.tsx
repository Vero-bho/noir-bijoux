import { useState } from "react";
import Modal from "~/components/ui/Modal";
import Button from "~/components/ui/Button";
import { getDeliveryPoints } from "~/data/delivery";

interface PickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pointLabel: string) => void;
}

export default function PickupModal({ isOpen, onClose, onSelect }: PickupModalProps) {
  const points = getDeliveryPoints("pickup");
  const [selectedId, setSelectedId] = useState<number | null>(points[0]?.id ?? null);

  const handleConfirm = () => {
    const point = points.find((row) => row.id === selectedId);
    if (!point) return;
    onSelect(`${point.provider}, ${point.address}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор самовывоза">
      <div className="mb-5 flex h-36 items-center justify-center rounded-xl border border-dashed border-brand-plum bg-brand-bg text-xl text-brand-mauve">
        Карта: мастерская и шоурум в Новосибирске
      </div>

      <div className="mb-6 space-y-4">
        {points.map((point) => (
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
            {point.phone && <span className="block text-sm text-brand-mauve/80">{point.phone}</span>}
          </button>
        ))}
      </div>

      <Button fullWidth onClick={handleConfirm}>
        Подтвердить точку
      </Button>
    </Modal>
  );
}
