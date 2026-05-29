"use client";

import { useEffect, useMemo, useReducer } from "react";
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
  | { type: "go-to-step"; stepIndex: number }
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
      case "go-to-step": {
        const stepIndex = Math.min(Math.max(action.stepIndex, 0), totalSteps - 1);

        return {
          currentStepIndex: stepIndex,
          remainingSeconds: routine.steps[stepIndex].seconds,
          isRunning: state.isRunning,
          isComplete: false,
        };
      }
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
  const totalSeconds = useMemo(() => getTotalRoutineSeconds(routine), [routine]);
  const completedSeconds = useMemo(() => {
    const previousStepsSeconds = routine.steps
      .slice(0, currentStepIndex)
      .reduce((total, step) => total + step.seconds, 0);

    return previousStepsSeconds + ((currentStep?.seconds ?? 0) - remainingSeconds);
  }, [currentStep?.seconds, currentStepIndex, remainingSeconds, routine.steps]);
  const progressPercent = totalSeconds > 0 ? Math.min(100, (completedSeconds / totalSeconds) * 100) : 0;

  useEffect(() => {
    if (!isRunning || isComplete) {
      return;
    }

    const interval = window.setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isComplete, isRunning]);

  function goToStep(stepIndex: number) {
    dispatch({ type: "go-to-step", stepIndex });
  }

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
      <main className="min-h-screen bg-[#f6f1e8] px-6 py-8 text-[#241f1a]">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
          <div className="rounded-[8px] border border-[#decfb8] bg-[#fffaf1] p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8d6b42]">
              Session complete
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-normal text-[#241f1a] sm:text-5xl">
              {routine.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6f6252]">
              Nice reset. Take one easy breath before you sit back down.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="h-12 rounded-[8px] bg-[#1f5d55] px-5 text-sm font-semibold text-white transition hover:bg-[#174941]"
              >
                Run again
              </button>
              <Link
                href="/"
                className="flex h-12 items-center rounded-[8px] border border-[#d7c8b4] px-5 text-sm font-semibold text-[#3c3228] transition hover:bg-[#f1e5d2]"
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
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-5 text-[#241f1a] sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-6xl grid-rows-[auto_1fr_auto] gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold text-[#5e4b36] hover:text-[#241f1a]">
            9to5 Stretch
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8d6b42]">
            <span>{routineCategoryLabels[routine.category]}</span>
            <span aria-hidden="true">/</span>
            <span>{routine.durationMinutes} min</span>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="flex min-h-[520px] flex-col rounded-[8px] border border-[#decfb8] bg-[#fffaf1] p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#8d6b42]">
                  Step {currentStepIndex + 1} of {totalSteps}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#241f1a] sm:text-5xl">
                  {currentStep.title}
                </h1>
              </div>
              <div className="rounded-[8px] border border-[#d8c8af] bg-white px-5 py-4 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d6b42]">
                  Timer
                </p>
                <p className="mt-1 font-mono text-5xl font-semibold text-[#1f5d55]">
                  {formatTimer(remainingSeconds)}
                </p>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#eadcc8]">
              <div
                className="h-full rounded-full bg-[#1f5d55] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-8 grid flex-1 gap-7 lg:grid-cols-[1fr_280px]">
              <div className="flex flex-col justify-center rounded-[8px] bg-[#f0e4d1] p-6">
                <div className="mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center rounded-full bg-[#d9eadf]">
                  <div className="relative h-48 w-32">
                    <div className="absolute left-1/2 top-2 h-14 w-14 -translate-x-1/2 rounded-full bg-[#f2c9a6]" />
                    <div className="absolute left-1/2 top-16 h-24 w-20 -translate-x-1/2 rounded-[999px] bg-[#1f5d55]" />
                    <div className="absolute left-3 top-20 h-20 w-5 origin-top rotate-[-28deg] rounded-full bg-[#f2c9a6]" />
                    <div className="absolute right-3 top-20 h-20 w-5 origin-top rotate-[28deg] rounded-full bg-[#f2c9a6]" />
                    <div className="absolute bottom-0 left-9 h-20 w-5 rounded-full bg-[#3c3228]" />
                    <div className="absolute bottom-0 right-9 h-20 w-5 rounded-full bg-[#3c3228]" />
                  </div>
                </div>
              </div>

              <aside className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8d6b42]">
                  Cue
                </p>
                <p className="mt-3 text-2xl font-semibold leading-9 text-[#241f1a]">
                  {currentStep.cue}
                </p>
                <p className="mt-5 text-base leading-7 text-[#6f6252]">
                  {currentStep.instruction}
                </p>
                <p className="mt-6 text-sm text-[#8a7a66]">
                  Move gently and stop if anything feels painful.
                </p>
              </aside>
            </div>
          </section>

          <aside className="rounded-[8px] border border-[#decfb8] bg-[#fffaf1] p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#241f1a]">{routine.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6252]">{routine.summary}</p>

            <div className="mt-6 space-y-2">
              {routine.steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`w-full rounded-[8px] border px-4 py-3 text-left transition ${
                    index === currentStepIndex
                      ? "border-[#1f5d55] bg-[#e1efe8]"
                      : "border-[#e3d5c1] bg-white hover:bg-[#f7ead7]"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[#241f1a]">{step.title}</span>
                  <span className="mt-1 block text-xs text-[#786753]">
                    {formatTimer(step.seconds)}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <footer className="grid gap-3 rounded-[8px] border border-[#decfb8] bg-[#fffaf1] p-3 shadow-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="h-12 rounded-[8px] border border-[#d7c8b4] px-5 text-sm font-semibold text-[#3c3228] transition hover:bg-[#f1e5d2] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "toggle-running" })}
            className="h-14 rounded-[8px] bg-[#1f5d55] px-10 text-base font-semibold text-white transition hover:bg-[#174941]"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="h-12 rounded-[8px] border border-[#d7c8b4] px-5 text-sm font-semibold text-[#3c3228] transition hover:bg-[#f1e5d2]"
          >
            {currentStepIndex === totalSteps - 1 ? "Finish" : "Next"}
          </button>
        </footer>
      </section>
    </main>
  );
}
