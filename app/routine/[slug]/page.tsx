import { notFound } from "next/navigation";
import { RoutinePlayer } from "@/components/routine/RoutinePlayer";
import { getRoutineBySlug, routines } from "@/data/routines";

export function generateStaticParams() {
  return routines.map((routine) => ({
    slug: routine.slug,
  }));
}

type RoutinePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RoutinePageProps) {
  const { slug } = await params;
  const routine = getRoutineBySlug(slug);

  if (!routine) {
    return {
      title: "Routine not found | 9to5 Stretch",
    };
  }

  return {
    title: `${routine.title} | 9to5 Stretch`,
    description: routine.summary,
  };
}

export default async function RoutinePage({ params }: RoutinePageProps) {
  const { slug } = await params;
  const routine = getRoutineBySlug(slug);

  if (!routine) {
    notFound();
  }

  return <RoutinePlayer routine={routine} />;
}
