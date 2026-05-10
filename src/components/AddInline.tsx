"use client";

import { useState } from "react";

type Props = {
  placeholder: string;
  onAdd: (value: string) => void;
};

export default function AddInline({ placeholder, onAdd }: Props) {
  const [value, setValue] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
    />
  );
}
