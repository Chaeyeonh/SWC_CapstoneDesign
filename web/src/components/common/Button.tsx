import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "neutral";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  className
}: ButtonProps) {
  const base =
    "rounded-md font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm",
    outline:
      "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 shadow-sm",
    neutral:
      "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 active:bg-slate-300",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base}
        ${sizes[size]}
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className || ""}
      `}
    >
      {children}
    </button>
  );
}
