import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "neutral";
  className?: string;
}

export function Button({ children, onClick, variant = "primary", className }: ButtonProps) {
  const base =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 select-none";

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700",
    outline: "bg-white text-slate-900 border border-slate-900 hover:bg-slate-50",
    neutral: "bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className || ""}`}
    >
      {children}
    </button>
  );
}
