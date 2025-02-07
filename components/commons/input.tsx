import { FieldErrors } from "react-hook-form";
import { Input as UiInput } from "../ui/input";
import { Label } from "../ui/label";

interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  register?: React.InputHTMLAttributes<HTMLInputElement>;
  formErrors?: FieldErrors;
}

const Input: React.FC<IInputProps> = ({
  id,
  type,
  label,
  placeholder,
  required,
  register,
  formErrors,
  ...rest
}) => {
  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <UiInput
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        {...register}
        {...rest}
      />
      {register && formErrors && formErrors.email && (
        <p className="text-red-500 text-sm">
          {formErrors[id]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;
