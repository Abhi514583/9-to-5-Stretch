"use client";

import { useEffect, useReducer } from "react";
import Link from "next/link";
import type { Routine } from "@/types/routine";
import { getTotalRoutineSeconds, routineCategoryLabels } from "@/data/routines";
import { formatTimer } from "@/lib/time";

type RoutinePlayerProps = {
  routine: Routine;
};

type PlayerState = {
  currentStepIndex: number;
  remainingSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
};

type PlayerAction =
  | { type: "toggle-running" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "restart" }
  | { type: "tick" };

export function RoutinePlayer({ routine }: RoutinePlayerProps) {
  const totalSteps = routine.steps.length;
  const initialState: PlayerState = {
    currentStepIndex: 0,
    remainingSeconds: routine.steps[0]?.seconds ?? 0,
    isRunning: false,
    isComplete: false,
  };

  function reducer(state: PlayerState, action: PlayerAction): PlayerState {
    switch (action.type) {
      case "toggle-running":
        return {
          ...state,
          isRunning: !state.isRunning,
        };
      case "previous": {
        const stepIndex = Math.max(state.currentStepIndex - 1, 0);

        return {
          currentStepIndex: stepIndex,
          remainingSeconds: routine.steps[stepIndex].seconds,
          isRunning: state.isRunning,
          isComplete: false,
        };
      }
      case "next": {
        const nextStepIndex = state.currentStepIndex + 1;

        if (nextStepIndex >= totalSteps) {
          return {
            ...state,
            remainingSeconds: 0,
            isRunning: false,
            isComplete: true,
          };
        }

        return {
          currentStepIndex: nextStepIndex,
          remainingSeconds: routine.steps[nextStepIndex].seconds,
          isRunning: state.isRunning,
          isComplete: false,
        };
      }
      case "restart":
        return {
          currentStepIndex: 0,
          remainingSeconds: routine.steps[0]?.seconds ?? 0,
          isRunning: true,
          isComplete: false,
        };
      case "tick": {
        if (!state.isRunning || state.isComplete) {
          return state;
        }

        if (state.remainingSeconds > 1) {
          return {
            ...state,
            remainingSeconds: state.remainingSeconds - 1,
          };
        }

        const nextStepIndex = state.currentStepIndex + 1;

        if (nextStepIndex >= totalSteps) {
          return {
            ...state,
            remainingSeconds: 0,
            isRunning: false,
            isComplete: true,
          };
        }

        return {
          currentStepIndex: nextStepIndex,
          remainingSeconds: routine.steps[nextStepIndex].seconds,
          isRunning: true,
          isComplete: false,
        };
      }
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const { currentStepIndex, isComplete, isRunning, remainingSeconds } = state;

  const currentStep = routine.steps[currentStepIndex];
  const totalSeconds = getTotalRoutineSeconds(routine);
  const previousStepsSeconds = routine.steps
    .slice(0, currentStepIndex)
    .reduce((total, step) => total + step.seconds, 0);
  const completedSeconds = previousStepsSeconds + ((currentStep?.seconds ?? 0) - remainingSeconds);
  const progressPercent = totalSeconds > 0 ? Math.min(100, (completedSeconds / totalSeconds) * 100) : 0;
  const progressRing = `conic-gradient(#1e564e ${progressPercent}%, #dedede ${progressPercent}% 100%)`;
  const hasStartedStep = remainingSeconds < currentStep.seconds;
  const isImmersive = isRunning || hasStartedStep;

  useEffect(() => {
    if (!isRunning || isComplete) {
      return;
    }

    const interval = window.setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isComplete, isRunning]);

  function handlePrevious() {
    dispatch({ type: "previous" });
  }

  function handleNext() {
    dispatch({ type: "next" });
  }

  function handleRestart() {
    dispatch({ type: "restart" });
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-[#fef9ef] px-6 py-8 text-[#1d241f]">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
          <div className="rounded-[8px] border border-[#dbe3d4] bg-white/85 p-8 shadow-[0_24px_80px_rgba(30,86,78,0.10)] sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#61756a]">
              Session complete
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-[#1e564e] sm:text-7xl">
              {routine.title}
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-[#59665f]">
              Take one easy breath before you return to your desk.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="h-14 rounded-[8px] bg-[#1e564e] px-7 text-base font-semibold text-white transition hover:bg-[#174941]"
              >
                Run again
              </button>
              <Link
                href="/"
                className="flex h-14 items-center rounded-[8px] border border-[#cfdacf] px-7 text-base font-semibold text-[#1e564e] transition hover:bg-[#edf4ea]"
              >
                Back home
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-[#fef9ef] px-4 py-3 text-[#1d241f]">
      <section className="mx-auto grid h-full w-full max-w-7xl grid-rows-[44px_minmax(0,1fr)_86px] gap-3">
        <header className="grid grid-cols-[48px_1fr_120px] items-center border-b border-[#ece7dd]">
          <Link
            href="/"
            aria-label="Back home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-semibold text-[#9b9b9b] shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition hover:text-[#1d241f]"
          >
            x
          </Link>
          <p className="text-center text-3xl font-black leading-none text-[#1d241f]">
            {currentStepIndex + 1} of {totalSteps}
          </p>
          <div className="flex justify-end">
            <div className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#1e564e] shadow-[0_4px_18px_rgba(0,0,0,0.10)]">
              Gesture off
            </div>
          </div>
        </header>

        <div
          className={`grid min-h-0 items-center gap-5 ${
            isImmersive ? "lg:grid-cols-[minmax(360px,0.95fr)_minmax(420px,1.05fr)]" : "lg:grid-cols-[minmax(420px,0.95fr)_minmax(420px,1.05fr)]"
          }`}
        >
          <div className="flex min-h-0 items-center justify-center">
            <div
              className={`relative flex shrink-0 items-center justify-center rounded-full p-2 transition-all ${
                isImmersive
                  ? "h-[min(62vh,520px)] w-[min(62vh,520px)] min-h-[300px] min-w-[300px]"
                  : "h-[min(66vh,560px)] w-[min(66vh,560px)] min-h-[330px] min-w-[330px]"
              }`}
              style={{ background: progressRing }}
            >
              <div className="absolute -top-1 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white text-xl font-black text-[#1d241f] shadow-[0_4px_16px_rgba(0,0,0,0.16)]">
                {currentStepIndex + 1}
              </div>
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[10px] border-white bg-[#f5dfad]">
                <div className="absolute bottom-[22%] h-[14%] w-[82%] bg-[#cf94a5]" />
                <div className="relative h-[64%] w-[44%]">
                  <div className="absolute left-[41%] top-[7%] h-[18%] w-[28%] rounded-full bg-[#7b3f22]" />
                  <div className="absolute left-[30%] top-[20%] h-[40%] w-[42%] -rotate-12 rounded-[40%] bg-[#8dc89b]" />
                  <div className="absolute left-[12%] top-[18%] h-[66%] w-[22%] rounded-full bg-[#24989a]" />
                  <div className="absolute left-[27%] top-[70%] h-[9%] w-[29%] rounded-full bg-[#9d633e]" />
                  <div className="absolute left-[64%] top-[38%] h-[46%] w-[15%] rounded-full bg-[#9d633e]" />
                  <div className="absolute left-[66%] top-[80%] h-[8%] w-[26%] rounded-full bg-[#9d633e]" />
                  <div className="absolute left-[62%] top-[22%] h-[18%] w-[22%] rounded-full bg-[#7b3f22]" />
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#7d8a81]">
              {routineCategoryLabels[routine.category]} / {routine.durationMinutes} min
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 lg:justify-start">
              <h1 className="text-5xl font-black tracking-normal text-[#202020] xl:text-6xl">
                {currentStep.title}
              </h1>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[#a3a3a3] shadow-[0_2px_10px_rgba(0,0,0,0.10)]">
                i
              </span>
            </div>
            <p className="mt-3 max-w-xl text-lg font-semibold leading-7 text-[#6c6c6c]">
              {isImmersive ? currentStep.cue : currentStep.instruction}
            </p>
            <p
              key={remainingSeconds}
              className="slot-tick mt-5 font-mono text-[96px] font-black leading-none text-[#8f8f8f] sm:text-[128px] xl:text-[168px]"
            >
              {formatTimer(remainingSeconds)}
            </p>
            {!isImmersive ? (
              <div className="mt-5 grid max-w-xl gap-3 text-left">
                <div className="rounded-[8px] border border-[#e4e0d8] bg-white/80 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d8a81]">
                    Technique
                  </p>
                  <p className="mt-2 text-base font-semibold leading-6 text-[#303630]">
                    {currentStep.cue}
                  </p>
                </div>
                <div className="rounded-[8px] border border-[#e4e0d8] bg-white/80 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d8a81]">
                    Gesture Assist Beta
                  </p>
                  <p className="mt-2 text-sm leading-5 text-[#6c6c6c]">
                    Hands-free controls will appear here later. Camera processing stays on-device.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 pb-1">
          <button
            type="button"
            aria-label="Previous step"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="ml-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#202020] shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35 sm:h-20 sm:w-20"
          >
            <span className="h-0 w-0 border-y-[11px] border-r-[16px] border-y-transparent border-r-current" />
            <span className="-ml-1 h-0 w-0 border-y-[11px] border-r-[16px] border-y-transparent border-r-current" />
          </button>
          <button
            type="button"
            aria-label={isRunning ? "Pause routine" : "Start routine"}
            onClick={() => dispatch({ type: "toggle-running" })}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#202020] shadow-[0_12px_34px_rgba(0,0,0,0.14)] transition hover:scale-105 sm:h-24 sm:w-24"
          >
            {isRunning ? (
              <span className="flex gap-2">
                <span className="h-9 w-3 rounded-full bg-current" />
                <span className="h-9 w-3 rounded-full bg-current" />
              </span>
            ) : (
              <span className="ml-1 h-0 w-0 border-y-[18px] border-l-[28px] border-y-transparent border-l-current" />
            )}
          </button>
          <button
            type="button"
            aria-label="Next step"
            onClick={handleNext}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#202020] shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:scale-105 sm:h-20 sm:w-20"
          >
            <span className="h-0 w-0 border-y-[11px] border-l-[16px] border-y-transparent border-l-current" />
            <span className="-ml-1 h-0 w-0 border-y-[11px] border-l-[16px] border-y-transparent border-l-current" />
          </button>
        </footer>
      </section>
    </main>
  );
}
