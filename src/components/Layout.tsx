import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Menu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataStore } from "@/store/useAppStore";
import { loadAll } from "@/services/questionBank";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const setData = useDataStore((s) => s.setData);
  const loaded = useDataStore((s) => s.loaded);

  useEffect(() => {
    let cancelled = false;
    loadAll().then((data) => {
      if (!cancelled) setData(data);
    }).catch((e) => console.error("Failed to load data:", e));
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  useEffect(() => {
    window.scrollTo(0, 0);
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute inset-0 h-16 w-16 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
          </div>
          <p className="text-primary font-semibold tracking-widest text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background app-hero">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-40 transition-transform duration-300 ease-smooth ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <AppSidebar onClose={() => setSidebarOpen(false)} />
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full pb-safe">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 flex items-center px-4 md:px-6 glass">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="h-10 w-10 rounded-xl bg-secondary/60 hover:bg-secondary flex items-center justify-center md:hidden transition-all duration-200 active:scale-95"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
          
          <div className="ml-4 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Quest Ace</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={location.pathname} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
