import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  Bookmark,
  XCircle,
  X,
  Clock,
  Timer,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useProgressStore } from "@/store/useAppStore";
import { motion } from "framer-motion";

const links = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/time-based", icon: Timer, label: "Time Based" },
  { to: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { to: "/wrong", icon: XCircle, label: "Review" },
];

interface Props {
  onClose: () => void;
}

export function AppSidebar({ onClose }: Props) {
  const { streak } = useProgressStore();

  return (
    <div className="w-64 h-full bg-sidebar-background/95 backdrop-blur-xl flex flex-col border-r border-sidebar-border">
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">Quest Ace</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="p-4 border-b border-sidebar-border">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-4 rounded-xl border border-orange-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <TrendingUp size={12} className="text-orange-500" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{streak} <span className="text-sm font-medium text-muted-foreground">days</span></p>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map(({ to, icon: Icon, label }, index) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 w-full"
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive ? "bg-primary/20" : "bg-muted"
                }`}>
                  <Icon size={16} className={isActive ? "text-primary" : ""} />
                </div>
                {label}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-[10px] text-muted-foreground/60 text-center font-medium tracking-wider">
          Quest Ace v2.1.0
        </div>
      </div>
    </div>
  );
}
