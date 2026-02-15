import { Swords } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const Battle = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Battle Mode" }]} />

      <div className="glass-card p-12 text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-warning/10 flex items-center justify-center mb-6">
          <Swords size={32} className="text-warning" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Battle Mode</h1>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Challenge your friends to a real-time quiz battle! Share a room code
          and compete head-to-head.
        </p>
        <div className="glass-card p-6 max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground mb-4">
            Enter a room code or create a new room
          </p>
          <input
            type="text"
            placeholder="Enter room code..."
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3 text-center text-lg tracking-widest uppercase"
            maxLength={6}
          />
          <button className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all text-sm">
            Join Room
          </button>
          <div className="my-3 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <button className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-muted transition-colors text-sm">
            Create New Room
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          🚧 Battle mode is coming soon with real-time multiplayer support
        </p>
      </div>
    </div>
  );
};

export default Battle;
