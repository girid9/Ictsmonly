import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Timer, Play, Info } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useDataStore } from "@/store/useAppStore";

const PRESET_MINUTES = [5, 10, 15, 20, 30];

export default function TimeBased() {
  const navigate = useNavigate();
  const { subjects, topicsBySubject } = useDataStore();

  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? "");
  const topics = useMemo(() => topicsBySubject[subjectId] ?? [], [subjectId, topicsBySubject]);
  const [topicId, setTopicId] = useState<string>(topics[0]?.id ?? "");
  const [minutes, setMinutes] = useState<number>(10);

  // Keep topic selection valid when subject changes
  useEffect(() => {
    const first = topicsBySubject[subjectId]?.[0]?.id;
    if (first && !topicsBySubject[subjectId]?.some((t) => t.id === topicId)) {
      setTopicId(first);
    }
  }, [subjectId, topicId, topicsBySubject]);

  const canStart = Boolean(subjectId && topicId && minutes > 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Time Based" }]} />

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Time Based Test</h1>
          <p className="text-muted-foreground text-sm">Pick a subject, a topic, and a timer. When the clock hits zero, the quiz auto-submits.</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Timer size={22} />
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-md bg-card border border-border text-sm focus:outline-none focus:border-primary/50"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Topic</label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-md bg-card border border-border text-sm focus:outline-none focus:border-primary/50"
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timer</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`px-3 py-2 rounded-md border text-xs font-bold uppercase tracking-wider transition-all ${minutes === m ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/40 border-border hover:bg-secondary"}`}
              >
                {m} min
              </button>
            ))}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom</span>
              <input
                type="number"
                min={1}
                max={180}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, Number(e.target.value || 1)))}
                className="w-20 px-3 py-2 rounded-md bg-card border border-border text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
          <Info size={14} className="mt-0.5" />
          <p>Tip: Auto-advance still works, but the timer always wins. If time runs out mid-question, we submit whatever you've answered so far.</p>
        </div>

        <button
          disabled={!canStart}
          onClick={() => {
            navigate(`/practice/${subjectId}/${topicId}`, { state: { timeLimitSec: minutes * 60 } });
          }}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          <Play size={16} /> Start Timed Test
        </button>
      </div>
    </div>
  );
}
