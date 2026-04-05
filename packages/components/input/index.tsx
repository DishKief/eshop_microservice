import { forwardRef } from "react";

interface BaseProps {
  label?: string;
  type?: "text" | "email" | "password" | "number" | "textarea";
  className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold mb-1 text-gray-300">
            {label}
          </label>
        )}
        {type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`w-full p-2 border outline-none border-gray-700 bg-transparent rounded-md text-white ${className}`}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            className={`w-full p-2 border outline-none border-gray-700 bg-transparent rounded-md text-white ${className}`}
            {...(props as InputProps)}
          />
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
