import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkX, Sparkles, BookOpen } from "lucide-react";
import { useDataStore, useProgressStore } from "@/store/useAppStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Question } from "@/types/question";
import { motion } from "framer-motion";

const OPTION_LABELS = ["A", "B", "C", "D"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

const Bookmarks = () => {
  const { questionsBySubjectTopic } = useDataStore();
  const { bookmarkedIds, toggleBookmark } = useProgressStore();

  const bookmarkedQuestions = useMemo(() => {
    const all: Question[] = [];
    for (const topics of Object.values(questionsBySubjectTopic)) {
      for (const questions of Object.values(topics)) all.push(...questions);
    }
    return all.filter((q) => bookmarkedIds.includes(q.id));
  }, [questionsBySubjectTopic, bookmarkedIds]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen"
    >
      {/* Breadcrumbs */}
      <motion.div variants={itemVariants} className="mb-6">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Bookmarks" }]} />
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Bookmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bookmarks</h1>
            <p className="text-sm text-muted-foreground">{bookmarkedQuestions.length} saved questions</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {bookmarkedQuestions.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Bookmark size={36} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No bookmarks yet</p>
            <p className="text-sm text-muted-foreground mb-6">Save questions while practicing to review them later</p>
            <Link 
              to="/subjects" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-glow transition-all"
            >
              <BookOpen size={18} /> Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedQuestions.map((q, index) => (
              <motion.div 
                key={q.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {q.subjectName}
                        </span>
                        <span className="text-xs text-muted-foreground">{q.topicName}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
                    </div>
                    <button 
                      onClick={() => toggleBookmark(q.id)} 
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                      title="Remove bookmark"
                    >
                      <BookmarkX size={18} />
                    </button>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Correct Answer</p>
                    <p className="text-sm font-medium text-foreground">{OPTION_LABELS[q.answerIndex]}. {q.options[q.answerIndex]}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Bookmarks;
