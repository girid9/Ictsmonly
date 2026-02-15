import { useMemo } from "react";
import { Link } from "react-router-dom";
import { XCircle, ArrowRight, BookOpen, Target, CheckCircle2 } from "lucide-react";
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

const WrongAnswers = () => {
  const { questionsBySubjectTopic } = useDataStore();
  const { answers } = useProgressStore();

  const wrongQuestions = useMemo(() => {
    const all: Question[] = [];
    for (const topics of Object.values(questionsBySubjectTopic)) {
      for (const questions of Object.values(topics)) all.push(...questions);
    }
    return all.filter((q) => answers[q.id] && !answers[q.id].correct);
  }, [questionsBySubjectTopic, answers]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen"
    >
      {/* Breadcrumbs */}
      <motion.div variants={itemVariants} className="mb-6">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Review" }]} />
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <XCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Mistakes</h1>
            <p className="text-sm text-muted-foreground">{wrongQuestions.length} questions to review</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {wrongQuestions.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Great job!</p>
            <p className="text-sm text-muted-foreground mb-6">No wrong answers yet. Keep up the good work!</p>
            <Link 
              to="/subjects" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-glow transition-all"
            >
              <BookOpen size={18} /> Continue Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wrongQuestions.map((q) => {
              const userAnswer = answers[q.id];
              return (
                <motion.div 
                  key={q.id}
                  whileHover={{ y: -2 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-red-300/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-xs font-semibold text-red-600">
                        {q.subjectName}
                      </span>
                      <span className="text-xs text-muted-foreground">{q.topicName}</span>
                    </div>
                    
                    {/* Question */}
                    <p className="text-sm font-medium text-foreground leading-relaxed mb-5">{q.question}</p>
                    
                    {/* Answers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Your Answer</p>
                        <p className="text-sm font-medium text-foreground">{OPTION_LABELS[userAnswer.selectedIndex]}. {q.options[userAnswer.selectedIndex]}</p>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Correct Answer</p>
                        <p className="text-sm font-medium text-foreground">{OPTION_LABELS[q.answerIndex]}. {q.options[q.answerIndex]}</p>
                      </div>
                    </div>
                    
                    {/* Action */}
                    <Link 
                      to={`/practice/${q.subjectId}/${q.topicId}`} 
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      Practice this topic <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WrongAnswers;
