import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, GraduationCap, PenTool, Lightbulb, UserCheck, ChevronRight } from "lucide-react";
import { useDataStore, useProgressStore } from "@/store/useAppStore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { motion } from "framer-motion";

const SUBJECT_ICONS = [GraduationCap, PenTool, Lightbulb, UserCheck];
const SUBJECT_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600", 
  "from-violet-500 to-purple-600",
  "from-orange-500 to-red-600"
];

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

const Subjects = () => {
  const { subjects, questionsBySubjectTopic } = useDataStore();
  const { answers } = useProgressStore();

  const subjectsWithProgress = useMemo(() => {
    return subjects.map((s) => {
      const allQs = Object.values(questionsBySubjectTopic[s.id] || {}).flat();
      const answered = allQs.filter((q) => answers[q.id]).length;
      const correct = allQs.filter((q) => answers[q.id]?.correct).length;
      const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      const completionPct = s.questionCount > 0 ? Math.round((answered / s.questionCount) * 100) : 0;
      return { ...s, answered, correct, pct, completionPct };
    });
  }, [subjects, answers, questionsBySubjectTopic]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen"
    >
      {/* Breadcrumbs */}
      <motion.div variants={itemVariants} className="mb-6">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Subjects" }]} />
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Subjects</h1>
            <p className="text-sm text-muted-foreground">Choose a subject to start practicing</p>
          </div>
        </div>
      </motion.div>

      {/* Subjects Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjectsWithProgress.map((subject, i) => {
          const Icon = SUBJECT_ICONS[i % SUBJECT_ICONS.length];
          const gradient = SUBJECT_GRADIENTS[i % SUBJECT_GRADIENTS.length];
          
          return (
            <motion.div
              key={subject.id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to={`/subjects/${subject.id}`} 
                className="block bg-card border border-border rounded-2xl overflow-hidden 
                           hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Top Gradient Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={26} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Completion</p>
                      <p className="text-2xl font-bold text-foreground">{subject.completionPct}%</p>
                    </div>
                  </div>
                  
                  <h2 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {subject.name}
                  </h2>
                  
                  <div className="flex items-center gap-2 mb-5">
                    <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                      {subject.topicCount} Topics
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                      {subject.questionCount} Questions
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.completionPct}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full bg-gradient-to-r ${gradient}`} 
                      />
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Start Practice
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
                      <ChevronRight size={16} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Subjects;
