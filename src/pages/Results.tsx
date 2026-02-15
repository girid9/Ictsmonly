import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDataStore } from "@/store/useAppStore";
import { CheckCircle2, XCircle, Clock, RotateCcw, Home, Trophy, Target, Award, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OPTION_LABELS = ["A", "B", "C", "D"];

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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const Results = () => {
  const { sessionResult, setSessionResult } = useDataStore();
  const navigate = useNavigate();
  const [reviewCleared, setReviewCleared] = useState(false);

  if (!sessionResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-muted-foreground mb-4">No results available.</p>
        <Link to="/subjects" className="text-primary hover:underline">Go to subjects</Link>
      </div>
    );
  }

  const { subjectName, topicName, total, correct, timeTaken, questionResults, subjectId, topicId } = sessionResult;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  const getResultMessage = () => {
    if (pct >= 90) return { text: "Outstanding!", icon: Trophy, color: "from-amber-400 to-orange-500", bgColor: "bg-amber-500/10" };
    if (pct >= 70) return { text: "Great Job!", icon: Award, color: "from-emerald-400 to-emerald-600", bgColor: "bg-emerald-500/10" };
    if (pct >= 40) return { text: "Keep Practicing", icon: Target, color: "from-blue-400 to-blue-600", bgColor: "bg-blue-500/10" };
    return { text: "Needs Improvement", icon: Target, color: "from-red-400 to-red-600", bgColor: "bg-red-500/10" };
  };

  const result = getResultMessage();
  const ResultIcon = result.icon;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quiz Results</h1>
            <p className="text-sm text-muted-foreground">{subjectName} › {topicName}</p>
          </div>
        </div>
      </motion.div>

      {/* Score Card */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
          {/* Score Header */}
          <div className={`p-8 md:p-12 text-center bg-gradient-to-br ${result.bgColor}`}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className={`inline-flex items-center justify-center p-4 rounded-2xl bg-white shadow-lg mb-6`}
            >
              <ResultIcon size={40} className={`bg-gradient-to-br ${result.color} bg-clip-text`} style={{ color: 'transparent', filter: 'drop-shadow(0 0 0 hsl(var(--primary)))' }} />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`text-6xl md:text-7xl font-bold mb-3 bg-gradient-to-br ${result.color} bg-clip-text text-transparent`}>
                {pct}%
              </div>
              <p className="text-lg font-semibold text-foreground">{result.text}</p>
            </motion.div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 divide-x divide-border bg-muted/30">
            <div className="p-5 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Score</p>
              <p className="text-xl font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" /> 
                {correct}/{total}
              </p>
            </div>
            <div className="p-5 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Time</p>
              <p className="text-xl font-bold flex items-center justify-center gap-2">
                <Clock size={18} className="text-muted-foreground" /> 
                {minutes}m {seconds}s
              </p>
            </div>
            <div className="p-5 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Accuracy</p>
              <p className="text-xl font-bold flex items-center justify-center gap-2">
                <Target size={18} className="text-primary" /> 
                {pct}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex gap-4 mb-8">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setSessionResult(null); navigate(`/practice/${subjectId}/${topicId}`); }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl 
                     bg-gradient-to-r from-primary to-accent text-white font-semibold 
                     shadow-glow hover:shadow-glow-lg transition-all duration-300"
        >
          <RotateCcw size={18} /> Retry Quiz
        </motion.button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl 
                       bg-secondary text-secondary-foreground font-semibold 
                       hover:bg-muted transition-all duration-300"
          >
            <Home size={18} /> Go Home
          </Link>
        </motion.div>
      </motion.div>

      {/* Review Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Review Answers</h2>
          <button
            type="button"
            onClick={() => setReviewCleared(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border 
                       bg-secondary/60 hover:bg-secondary text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>

        <AnimatePresence>
          {reviewCleared ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-8 text-center"
            >
              <p className="text-muted-foreground">Review cleared. Your score summary is still saved above.</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-3">
              {questionResults.map((qr, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card border rounded-2xl p-5 overflow-hidden ${
                    qr.correct ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-red-500"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                      qr.correct ? "bg-emerald-500/10" : "bg-red-500/10"
                    }`}>
                      {qr.correct ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground flex-1">{i + 1}. {qr.question.question}</p>
                  </div>
                  <div className="ml-9 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Your answer: <span className={qr.correct ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                        {qr.selectedIndex >= 0 ? `${OPTION_LABELS[qr.selectedIndex]}. ${qr.question.options[qr.selectedIndex]}` : "Not answered"}
                      </span>
                    </p>
                    {!qr.correct && (
                      <p className="text-xs text-muted-foreground">
                        Correct: <span className="text-emerald-600 font-medium">
                          {OPTION_LABELS[qr.question.answerIndex]}. {qr.question.options[qr.question.answerIndex]}
                        </span>
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Results;
