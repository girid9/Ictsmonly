import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, Target, TrendingUp, Search, Clock, Timer } from "lucide-react";
import { useDataStore, useProgressStore } from "@/store/useAppStore";
import { search } from "@/services/questionBank";

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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto bg-background min-h-screen">
      {/* Header with Gradient */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full"></div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-16">Track your progress and continue learning</p>
      </div>

      {/* Stats Grid - Modern Cards with Gradient Borders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        {[
          { label: "Accuracy", value: `${stats.accuracy}%`, icon: TrendingUp, gradient: "from-violet-500 to-purple-500" },
          { label: "Answered", value: stats.answered, icon: Target, gradient: "from-green-500 to-emerald-500" },
          { label: "Streak", value: `${stats.streak}d`, icon: Clock, gradient: "from-orange-500 to-amber-500" },
          { label: "Bookmarks", value: stats.bookmarks, icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
        ].map((stat, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search Bar - Enhanced Design */}
      <div className="relative mb-10">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search subjects or topics..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-5 py-4 bg-card border-2 border-border rounded-2xl text-sm 
                     focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 
                     transition-all duration-200 shadow-sm hover:shadow-md" 
        />
      </div>

      {/* Quick Actions - Large Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="compact-card p-8 flex flex-col justify-between group hover:border-primary/30 transition-all animate-slide-up">
          <div>
            <div className="inline-block p-3 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Start Practice</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Select a subject and begin your simulation session
            </p>
          </div>
          <button 
            onClick={() => navigate('/subjects')} 
            className="gradient-btn w-full flex items-center justify-center gap-2"
          >
            Browse Subjects
            <ArrowRight size={18} />
          </button>
        </div>

        {lastVisited ? (
          <Link to={`/practice/${lastVisited.subjectId}/${lastVisited.topicId}`}
            className="compact-card p-8 flex flex-col justify-between hover:border-accent/30 transition-all group animate-slide-up"
            style={{ animationDelay: '100ms' }}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full mb-4 text-xs font-semibold">
                <Clock size={14} />
                Continue Session
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-accent transition-colors">
                {lastVisited.topicName}
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                {lastVisited.subjectName}
              </p>
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">Resume where you left off</span>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent group-hover:to-accent/90 transition-all">
                <ArrowRight size={20} className="text-accent group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ) : (
          <div className="compact-card p-8 flex flex-col items-center justify-center border-dashed text-center animate-slide-up"
               style={{ animationDelay: '100ms' }}>
            <Timer size={32} className="text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No recent sessions found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start practicing to see your progress here</p>
          </div>
        )}
      </div>

      {/* Quick Links - Compact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { to: "/subjects", icon: BookOpen, label: "Subjects", gradient: "from-violet-500 to-purple-500" },
          { to: "/time-based", icon: Timer, label: "Time Based", gradient: "from-blue-500 to-cyan-500" },
          { to: "/bookmarks", icon: Target, label: "Bookmarks", gradient: "from-amber-500 to-orange-500" }
        ].map((link, i) => (
          <Link 
            key={i}
            to={link.to} 
            className="compact-card p-5 flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group animate-slide-up"
            style={{ animationDelay: `${150 + (i * 50)}ms` }}
          >
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${link.gradient} shadow-md group-hover:shadow-lg transition-shadow`}>
              <link.icon size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
