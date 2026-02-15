import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Settings, Info } from "lucide-react";
import { useDataStore, useProgressStore } from "@/store/useAppStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { shuffle } from "@/utils/shuffle";
import { Question } from "@/types/question";

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
      // Time's up: finalize immediately with what we have.
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

  if (questions.length === 0) return <div className="p-4 text-center"><p className="text-muted-foreground">No questions available.</p></div>;
  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Modern Header with Gradient Accent */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 hover:bg-muted rounded-xl transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary to-accent"></div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                {currentQuestion.subjectName}
              </p>
            </div>
            <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
              {currentQuestion.topicName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl">
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {remainingSec !== null && (
            <div className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              remainingSec <= 10 
                ? "bg-destructive/15 text-destructive border border-destructive/30" 
                : "bg-primary/10 text-primary border border-primary/20"
            }`}>
              ⏱ {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}
            </div>
          )}

          <div className="h-8 w-[1px] bg-border" />
          
          <button 
            onClick={() => toggleBookmark(currentQuestion.id)} 
            className={`p-2.5 rounded-xl transition-all ${
              isBookmarked 
                ? 'text-primary bg-primary/10 border border-primary/20' 
                : 'hover:bg-muted border border-transparent'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2.5 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border">
                <Settings size={18} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
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

      {/* Enhanced Progress Bar with Gradient */}
      <div className="h-1.5 w-full bg-muted shrink-0 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 relative" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content - Enhanced Typography */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide border border-primary/20">
                Question {currentIndex + 1}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold leading-relaxed text-foreground">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option, i) => {
              if (!option.trim()) return null;
              let extraClass = "";
              if (revealed) {
                if (i === currentQuestion.answerIndex) extraClass = "option-btn-correct";
                else if (i === selectedOption) extraClass = "option-btn-wrong";
                else extraClass = "opacity-40";
              }
              return (
                <button 
                  key={i} 
                  onClick={() => handleSelect(i)} 
                  disabled={revealed} 
                  className={`option-btn ${extraClass}`}
                >
                  <span className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    revealed && i === currentQuestion.answerIndex 
                      ? 'bg-success border-success text-white scale-110' 
                      : revealed && i === selectedOption
                      ? 'bg-destructive border-destructive text-white'
                      : 'bg-muted/50 border-border'
                  }`}>
                    {OPTION_LABELS[i]}
                  </span>
                  <span className="text-sm md:text-base font-medium">{option}</span>
                </button>
              );
            })}
          </div>

          {revealed && currentQuestion.notes && (
            <div className="mt-10 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl animate-slide-up shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info size={16} className="text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Explanation</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {currentQuestion.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer Navigation */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-6 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="compact-btn flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} /> 
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Keys 1-4 to select • N for next • P for previous
            </span>
          </div>

          <button 
            onClick={handleNext} 
            disabled={!revealed} 
            className="gradient-btn flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>{currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Practice;
