import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Search, 
  Clock, 
  Timer, 
  Bookmark, 
  Zap,
  BarChart3,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useDataStore, useProgressStore } from "@/store/useAppStore";
import { search } from "@/services/questionBank";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const Home = () => {
  const { subjects, questionsBySubjectTopic } = useDataStore();
  const { answers, bookmarkedIds, lastVisited, streak } = useProgressStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const total = Object.values(questionsBySubjectTopic).reduce(
      (acc, topics) => acc + Object.values(topics).reduce((a, qs) => a + qs.length, 0), 0
    );
    const answered = Object.keys(answers).length;
    const correct = Object.values(answers).filter((a) => a.correct).length;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return { total, answered, correct, accuracy, bookmarks: bookmarkedIds.length, streak };
  }, [questionsBySubjectTopic, answers, bookmarkedIds, streak]);

  const statCards = [
    { 
      label: "Accuracy", 
      value: `${stats.accuracy}%`, 
      icon: TrendingUp, 
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600"
    },
    { 
      label: "Answered", 
      value: stats.answered, 
      icon: Target, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600"
    },
    { 
      label: "Streak", 
      value: `${stats.streak}d`, 
      icon: Zap, 
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-600"
    },
    { 
      label: "Bookmarks", 
      value: stats.bookmarks, 
      icon: Bookmark, 
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-600"
    },
  ];

  const quickActions = [
    { to: "/subjects", icon: BookOpen, label: "Browse Subjects", desc: "Explore all topics" },
    { to: "/time-based", icon: Timer, label: "Time Based", desc: "Practice with timer" },
    { to: "/bookmarks", icon: Bookmark, label: "Bookmarks", desc: "Saved questions" },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your progress and practice</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.textColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search subjects or topics..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 
                     transition-all duration-200 shadow-sm" 
        />
      </motion.div>

      {/* Main Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Start Practice Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/subjects')}
          className="lg:col-span-2 bg-gradient-to-br from-primary to-accent rounded-2xl p-8 text-white cursor-pointer 
                     shadow-glow hover:shadow-glow-lg transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <BookOpen size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Start Practice</h2>
            <p className="text-white/80 mb-6 text-sm">Select a subject and begin your learning session. Track your progress as you go.</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Browse Subjects</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>

        {/* Resume Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {lastVisited ? (
            <Link to={`/practice/${lastVisited.subjectId}/${lastVisited.topicId}`}
              className="block h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock size={18} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Resume</span>
              </div>
              <p className="font-semibold text-foreground mb-1 line-clamp-1">{lastVisited.topicName}</p>
              <p className="text-sm text-muted-foreground mb-4">{lastVisited.subjectName}</p>
              <div className="mt-auto flex items-center gap-2 text-sm font-medium text-primary">
                <span>Continue</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Clock size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No recent sessions</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to={action.to} 
                className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl 
                           hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
                  <action.icon size20="" className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
