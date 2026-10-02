import type { ButtonHTMLAttributes } from "react";

// .btn-secondary from components.html. Transparent with a light border; hover
// darkens the border only. Used where two choices carry equal weight, like
// Retake and Keep it on the photo quality sheet.
export default function SecondaryButton({
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={className ? `btn-secondary ${className}` : "btn-secondary"}
      {...props}
    />
  );
}
