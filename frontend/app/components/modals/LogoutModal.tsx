import Modal from "~/components/ui/Modal";
import Button from "~/components/ui/Button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выйти из аккаунта?">
      <p className="mb-6 text-lg text-brand-mauve">
        Корзина и избранные сборки сохранятся на этом устройстве.
      </p>

      <div className="flex gap-4">
        <Button variant="outline" fullWidth onClick={onClose}>
          Остаться
        </Button>
        <Button
          fullWidth
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Выйти
        </Button>
      </div>
    </Modal>
  );
}
