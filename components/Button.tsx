import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export default function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-black",
        className
      )}
      {...props}
    />
  );
}
