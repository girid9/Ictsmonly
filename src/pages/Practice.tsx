import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Settings, Info, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useDataStore, useProgressStore } from "@/store/useAppStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { shuffle } from "@/utils/shuffle";
import { Question } from "@/types/question";
import { motion, AnimatePresence } from "framer-motion";

const OPTION_LABELS = ["A", "B", "C", "D"];

const Practice = () => {
  const { subjectId, topicId } = useParams<{ subjectId: string; topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { subjects, questionsBySubjectTopic } = useDataStore();
  const { bookmarkedIds, recordAnswer, toggleBookmark, setLastVisited, settings, updateSettings } = useProgressStore();
  const setSessionResult = useDataStore((s) => s.setSessionResult);

  const timeLimitSec: number | null = (location.state as any)?.timeLimitSec ?? null;

  const rawQuestions = useMemo(() => {
    if (!subjectId || !topicId) return [];
    return questionsBySubjectTopic[subjectId]?.[topicId] ?? [];
  }, [subjectId, topicId, questionsBySubjectTopic]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<Record<number, { selected: number; correct: boolean }>>({});
  const [startTime] = useState(Date.now());
  const [remainingSec, setRemainingSec] = useState<number | null>(timeLimitSec);

  useEffect(() => {
    setRemainingSec(timeLimitSec);
  }, [timeLimitSec]);

  useEffect(() => {
    if (rawQuestions.length > 0) setQuestions(shuffle(rawQuestions));
  }, [rawQuestions]);

  useEffect(() => {
    if (rawQuestions.length > 0 && subjectId && topicId) {
      const subject = subjects.find((s) => s.id === subjectId);
      setLastVisited({ subjectId, topicId, subjectName: subject?.name || subjectId, topicName: rawQuestions[0]?.topicName || topicId });
    }
  }, [rawQuestions, subjectId, topicId, subjects, setLastVisited]);

  const currentQuestion = questions[currentIndex];
  const isBookmarked = currentQuestion ? bookmarkedIds.includes(currentQuestion.id) : false;

  const handleSelect = useCallback((optionIndex: number) => {
    if (revealed || !currentQuestion) return;
    const correct = optionIndex === currentQuestion.answerIndex;
    setSelectedOption(optionIndex);
    setRevealed(true);
    setSessionAnswers((prev) => ({ ...prev, [currentIndex]: { selected: optionIndex, correct } }));
    recordAnswer(currentQuestion.id, optionIndex, correct);
  }, [revealed, currentQuestion, currentIndex, recordAnswer]);

  const finalizeQuiz = useCallback((answersOverride?: Record<number, { selected: number; correct: boolean }>) => {
    const allAnswers = answersOverride ? { ...answersOverride } : { ...sessionAnswers };
    if (selectedOption !== null && currentQuestion) {
      allAnswers[currentIndex] = { selected: selectedOption, correct: selectedOption === currentQuestion.answerIndex };
    }
    const correct = Object.values(allAnswers).filter((a) => a.correct).length;
    setSessionResult({
      subjectName: currentQuestion?.subjectName || "",
      topicName: currentQuestion?.topicName || "",
      subjectId: subjectId || "",
      topicId: topicId || "",
      total: questions.length,
      correct,
      timeTaken: Math.round((Date.now() - startTime) / 1000),
      questionResults: questions.map((q, i) => ({
        question: q,
        selectedIndex: allAnswers[i]?.selected ?? -1,
        correct: allAnswers[i]?.correct ?? false,
      })),
    });
    navigate("/results");
  }, [currentIndex, currentQuestion, navigate, questions, selectedOption, sessionAnswers, setSessionResult, startTime, subjectId, topicId]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const prev = sessionAnswers[nextIdx];
      if (prev) { setSelectedOption(prev.selected); setRevealed(true); } else { setSelectedOption(null); setRevealed(false); }
    } else {
      finalizeQuiz();
    }
  }, [currentIndex, questions.length, sessionAnswers, finalizeQuiz]);

  // Timed mode countdown
  useEffect(() => {
    if (!remainingSec || remainingSec <= 0) return;
    const t = window.setInterval(() => {
      setRemainingSec((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => window.clearInterval(t);
  }, [remainingSec]);

  useEffect(() => {
    if (remainingSec === 0) {
      finalizeQuiz(sessionAnswers);
    }
  }, [finalizeQuiz, remainingSec, sessionAnswers]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prev = sessionAnswers[prevIdx];
      if (prev) { setSelectedOption(prev.selected); setRevealed(true); } else { setSelectedOption(null); setRevealed(false); }
    }
  }, [currentIndex, sessionAnswers]);

  useEffect(() => {
    if (revealed && settings.autoAdvance && currentIndex < questions.length - 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [revealed, settings.autoAdvance, currentIndex, questions.length, handleNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key >= "1" && e.key <= "4") handleSelect(parseInt(e.key) - 1);
      else if (e.key.toLowerCase() === "n" && revealed) handleNext();
      else if (e.key.toLowerCase() === "p") handlePrev();
      else if (e.key.toLowerCase() === "b" && currentQuestion) toggleBookmark(currentQuestion.id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSelect, handleNext, handlePrev, currentQuestion, toggleBookmark, revealed]);

  if (questions.length === 0) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">No questions available.</p>
    </div>
  );
  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="h-10 w-10 rounded-xl bg-secondary/60 hover:bg-secondary flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">{currentQuestion.subjectName}</p>
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{currentQuestion.topicName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Question Counter */}
          <div className="px-4 py-2 bg-muted rounded-xl text-sm font-semibold">
            {currentIndex + 1} <span className="text-muted-foreground">/ {questions.length}</span>
          </div>

          {/* Timer */}
          {remainingSec !== null && (
            <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
              remainingSec <= 10 
                ? "bg-destructive/10 text-destructive animate-pulse" 
                : "bg-primary/10 text-primary"
            }`}>
              <Clock size={14} />
              {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}
            </div>
          )}

          <div className="h-6 w-px bg-border mx-1" />
          
          {/* Bookmark */}
          <button 
            onClick={() => toggleBookmark(currentQuestion.id)} 
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isBookmarked 
                ? 'text-primary bg-primary/10' 
                : 'hover:bg-muted'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          
          {/* Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center transition-all duration-200">
                <Settings size={18} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-advance" className="text-sm font-medium">Auto-advance</Label>
                <Switch 
                  id="auto-advance" 
                  checked={settings.autoAdvance} 
                  onCheckedChange={(checked) => updateSettings({ autoAdvance: checked })} 
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-muted shrink-0">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-primary to-accent" 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Question */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                    Question {currentIndex + 1}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-semibold leading-relaxed text-foreground">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, i) => {
                  if (!option.trim()) return null;
                  let extraClass = "";
                  let icon = null;
                  
                  if (revealed) {
                    if (i === currentQuestion.answerIndex) {
                      extraClass = "option-btn-correct";
                      icon = <CheckCircle2 size={18} className="text-success shrink-0" />;
                    } else if (i === selectedOption) {
                      extraClass = "option-btn-wrong";
                      icon = <XCircle size={18} className="text-destructive shrink-0" />;
                    } else {
                      extraClass = "opacity-50";
                    }
                  }
                  
                  return (
                    <motion.button 
                      key={i} 
                      onClick={() => handleSelect(i)} 
                      disabled={revealed} 
                      whileHover={!revealed ? { scale: 1.01 } : {}}
                      whileTap={!revealed ? { scale: 0.99 } : {}}
                      className={`option-btn ${extraClass}`}
                    >
                      <span className={`h-10 w-10 rounded-xl border flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200 ${
                        revealed && i === currentQuestion.answerIndex 
                          ? 'bg-success border-success text-white' 
                          : revealed && i === selectedOption && i !== currentQuestion.answerIndex
                            ? 'bg-destructive border-destructive text-white'
                            : 'bg-muted/50 border-border'
                      }`}>
                        {OPTION_LABELS[i]}
                      </span>
                      <span className="text-sm md:text-base flex-1">{option}</span>
                      {icon}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {revealed && currentQuestion.notes && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 p-5 bg-muted/50 border border-border rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                      <Info size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Explanation</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {currentQuestion.notes}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border bg-card/50 p-4 md:p-6 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-secondary/60 
                       hover:bg-secondary hover:border-primary/30 transition-all duration-200 
                       disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Press <kbd className="px-2 py-1 bg-muted rounded-lg text-foreground">1-4</kbd> to select
          </div>

          <button 
            onClick={handleNext} 
            disabled={!revealed} 
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl 
                       text-sm font-semibold hover:shadow-glow transition-all duration-200 
                       disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Next Question"}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Practice;
