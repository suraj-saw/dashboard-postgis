import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Panel({ title, icon, children, className = "", delay = 0 }: PanelProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1], delay }}
      whileHover={{ boxShadow: "0 6px 24px rgba(26,29,46,0.10)" }}
      className={`rounded-xl border border-[#E4E8F4] bg-white p-5 ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(26,29,46,0.06), 0 4px 12px rgba(26,29,46,0.04)" }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF3FF] text-[#2C6EF2]">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-[#1A1D2E]">{title}</h2>
      </div>
      {children}
    </motion.article>
  );
}
