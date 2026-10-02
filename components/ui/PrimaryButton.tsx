import type { ButtonHTMLAttributes } from "react";

// .btn-primary from components.html. Full width, sharp corners, 44px minimum
// touch target. Hover inverts to white with a dark border.
//
// `type` defaults to "button" so dropping one inside a form does not submit it
// by accident. Pass type="submit" deliberately.
export default function PrimaryButton({
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={className ? `btn-primary ${className}` : "btn-primary"}
      {...props}
    />
  );
}
