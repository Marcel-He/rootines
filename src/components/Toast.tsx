"use client";

import { useEffect, useState } from "react";

type Props = {
  message: string;
  onDone: () => void;
};

export default function Toast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => setVisible(false), 1800);
    const cleanup = setTimeout(onDone, 2100);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hide);
      clearTimeout(cleanup);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-gray-900 text-white text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {message}
    </div>
  );
}
