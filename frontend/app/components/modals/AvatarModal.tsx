import { useRef, useState } from "react";
import Modal from "~/components/ui/Modal";
import Button from "~/components/ui/Button";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export default function AvatarModal({ isOpen, onClose, onSave }: AvatarModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения (JPG или PNG)");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Файл больше 3 МБ — выберите изображение меньше");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!preview) {
      setError("Сначала выберите файл");
      return;
    }
    onSave(preview);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Фото профиля">
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-brand-mauve bg-brand-plum">
          {preview ? (
            <img src={preview} alt="Предпросмотр" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl text-brand-mauve">𝒩</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        <Button variant="outline" fullWidth onClick={() => inputRef.current?.click()}>
          Выбрать файл
        </Button>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button fullWidth onClick={handleSave} disabled={!preview}>
          Сохранить фото
        </Button>

        <p className="text-sm text-brand-mauve/70">
          JPG или PNG, до 3 МБ. После подключения бэкенда файл будет сохраняться на сервере (папка uploads).
        </p>
      </div>
    </Modal>
  );
}
