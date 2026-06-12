import { Menu, RefreshCw } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
  loading: boolean;
  onRefresh: () => void;
}

export function Navbar({ onMenuClick, loading, onRefresh }: NavbarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Road safety analytics
          </p>
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Accident command center
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing…" : "Live data"}
        </button>
      </div>
    </header>
  );
}