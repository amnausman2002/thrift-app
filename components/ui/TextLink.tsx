import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";

// .btn-text-link from components.html. The quieter of two stacked choices on a
// bottom sheet: "Continue anyway" under "Retake photo".
//
// components.html only shows it as a <button>, but two of its real uses
// navigate ("View my listings", "List another item"), so passing `href` renders
// a real link instead. Same class either way, so they look identical.

type ButtonProps = { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkProps = { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export default function TextLink(props: ButtonProps | LinkProps) {
  if (props.href !== undefined) {
    const { href, className, ...rest } = props;
    return (
      <Link
        href={href}
        className={className ? `btn-text-link ${className}` : "btn-text-link"}
        {...rest}
      />
    );
  }

  const { type = "button", className, ...rest } = props;
  return (
    <button
      type={type}
      className={className ? `btn-text-link ${className}` : "btn-text-link"}
      {...rest}
    />
  );
}
