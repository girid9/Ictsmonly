import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Play, ArrowRight, FolderOpen, CheckCircle2, Target } from "lucide-react";
import { useDataStore, useProgressStore } from "@/store/useAppStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { motion } from "framer-motion";

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

const Topics = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { subjects, topicsBySubject, questionsBySubjectTopic } = useDataStore();
  const { answers } = useProgressStore();
  const subject = subjects.find((s) => s.id === subjectId);
  const topics = topicsBySubject[subjectId || ""] || [];

  const topicsWithProgress = useMemo(() => {
    if (!subjectId) return [];
    return topics.map((t) => {
      const qs = questionsBySubjectTopic[subjectId]?.[t.id] || [];
      const answered = qs.filter((q) => answers[q.id]).length;
      const correct = qs.filter((q) => answers[q.id]?.correct).length;
      const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      const completionPct = t.questionCount > 0 ? Math.round((answered / t.questionCount) * 100) : 0;
      return { ...t, answered, correct, pct, completionPct };
    });
  }, [topics, questionsBySubjectTopic, answers, subjectId]);

  if (!subject) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Subject not found.</p>
        <Link to="/subjects" className="text-primary hover:underline mt-2 inline-block">Back to subjects</Link>
      </div>
    );
  }

  const totalAnswered = topicsWithProgress.reduce((acc, t) => acc + t.answered, 0);
  const totalQuestions = subject.questionCount;
  const overallProgress = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen"
    >
      {/* Breadcrumbs */}
      <motion.div variants={itemVariants} className="mb-6">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Subjects", to: "/subjects" }, { label: subject.name }]} />
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">{topics.length} topics · {subject.questionCount} questions</p>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">{overallProgress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent" 
            />
          </div>
        </div>
      </motion.div>

      {/* Topics List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {topicsWithProgress.map((topic, index) => (
          <motion.div
            key={topic.id}
            variants={itemVariants}
            whileHover={{ x: 4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
          >
            <Link 
              to={`/practice/${subjectId}/${topic.id}`} 
              className="block bg-card border border-border rounded-2xl p-5 
                         hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                {/* Play Icon */}
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 
                                group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
                  <Play size={20} className="text-primary group-hover:text-white ml-0.5 transition-colors" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {topic.questionCount} Qs
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.completionPct}%` }}
                        transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent" 
                      />
                    </div>
                    {topic.answered > 0 && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        topic.pct >= 70 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : topic.pct >= 50 
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-red-500/10 text-red-600'
                      }`}>
                        {topic.pct}%
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center 
                                group-hover:bg-primary/10 transition-all duration-300">
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Topics;
