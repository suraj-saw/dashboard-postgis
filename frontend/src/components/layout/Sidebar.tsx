import { ShieldAlert, LayoutDashboard, Map, AlertTriangle, X } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Map, label: "Heatmap" },
  { icon: AlertTriangle, label: "Reports" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white flex flex-col
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-rose-500 to-orange-400 flex items-center justify-center">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest leading-none">
                SVNIT
              </p>
              <p className="text-sm font-bold leading-tight">Accident Intel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${active
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Road safety analytics platform
          </p>
        </div>
      </aside>
    </>
  );
}