import Link from "next/link";
import { routines } from "@/data/routines";

export default function Home() {
  const featuredRoutine = routines[0];

  return (
    <main className="flex min-h-screen items-center bg-[#f6f1e8] px-6 py-10 text-[#241f1a]">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8d6b42]">
          Sprint 1 preview
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal sm:text-6xl">
          9to5 Stretch
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f6252]">
          Quick stretch sessions for desk bodies. No app. No signup. Just stretch.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/routine/${featuredRoutine.slug}`}
            className="flex h-12 items-center rounded-[8px] bg-[#1f5d55] px-5 text-sm font-semibold text-white transition hover:bg-[#174941]"
          >
            Start {featuredRoutine.title}
          </Link>
          <Link
            href="/routine/mcgill-big-three"
            className="flex h-12 items-center rounded-[8px] border border-[#d7c8b4] px-5 text-sm font-semibold text-[#3c3228] transition hover:bg-[#f1e5d2]"
          >
            Try McGill Big Three
          </Link>
        </div>
      </section>
    </main>
  );
}
