import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Timer, Play, Info, Clock, ChevronDown } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useDataStore } from "@/store/useAppStore";
import { motion } from "framer-motion";

const PRESET_MINUTES = [5, 10, 15, 20, 30];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen"
    >
      {/* Breadcrumbs */}
      <motion.div variants={itemVariants} className="mb-6">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Time Based" }]} />
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <Timer className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Time Based Test</h1>
            </div>
            <p className="text-sm text-muted-foreground">Practice under pressure with a countdown timer</p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-lg">
        <div className="space-y-6">
          {/* Subject Select */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
              Subject
            </label>
            <div className="relative">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl bg-muted border border-border text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 
                           transition-all appearance-none cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </div>

          {/* Topic Select */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
              Topic
            </label>
            <div className="relative">
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl bg-muted border border-border text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 
                           transition-all appearance-none cursor-pointer"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </div>

          {/* Timer Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
              Timer Duration
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_MINUTES.map((m) => (
                <motion.button
                  key={m}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMinutes(m)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    minutes === m 
                      ? "bg-primary text-primary-foreground border-primary shadow-glow" 
                      : "bg-secondary/60 border-border hover:bg-secondary hover:border-primary/30"
                  }`}
                >
                  {m} min
                </motion.button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Custom:</span>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(1, Number(e.target.value || 1)))}
                  className="w-28 pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          {/* Info Tip */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              The quiz will auto-submit when time runs out. Your answers are saved as you go.
            </p>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: canStart ? 1.02 : 1 }}
            whileTap={{ scale: canStart ? 0.98 : 1 }}
            disabled={!canStart}
            onClick={() => {
              navigate(`/practice/${subjectId}/${topicId}`, { state: { timeLimitSec: minutes * 60 } });
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl 
                       bg-gradient-to-r from-primary to-accent text-white font-semibold
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       hover:shadow-glow hover:shadow-glow-lg transition-all duration-300"
          >
            <Play size={18} /> Start Timed Test
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
