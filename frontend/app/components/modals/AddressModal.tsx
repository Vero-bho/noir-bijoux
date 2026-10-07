import { useForm } from "react-hook-form";
import Modal from "~/components/ui/Modal";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import type { AddressFormValues } from "~/types";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  initialAddress?: string;
}

export default function AddressModal({ isOpen, onClose, onSave, initialAddress }: AddressModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    defaultValues: { city: "Новосибирск", street: initialAddress ?? "", house: "", flat: "", index: "" },
  });

  const submit = (values: AddressFormValues) => {
    const flat = values.flat ? `, кв. ${values.flat}` : "";
    const index = values.index ? `, индекс ${values.index}` : "";
    onSave(`г. ${values.city}, ул. ${values.street}, д. ${values.house}${flat}${index}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Адрес доставки курьером">
      <form className="space-y-5" onSubmit={handleSubmit(submit)}>
        <Input
          label="Город"
          placeholder="г. Новосибирск"
          error={errors.city?.message}
          {...register("city", { required: "Укажите город" })}
        />

        <Input
          label="Улица"
          placeholder="Название улицы"
          error={errors.street?.message}
          {...register("street", { required: "Укажите улицу" })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Дом"
            placeholder="№"
            error={errors.house?.message}
            {...register("house", { required: "Укажите дом" })}
          />
          <Input label="Квартира" placeholder="№" {...register("flat")} />
        </div>

        <Input
          label="Индекс"
          placeholder="Код"
          inputMode="numeric"
          error={errors.index?.message}
          {...register("index", {
            pattern: { value: /^\d{0,6}$/, message: "Индекс состоит из цифр" },
          })}
        />

        <Button type="submit" fullWidth>
          Сохранить адрес
        </Button>
      </form>
    </Modal>
  );
}
