export type RoutineCategory = "desk-relief" | "back-care" | "mobility";

export type RoutineLevel = "easy" | "medium";

export type RoutineMedia =
  | {
      type: "animation";
      key: string;
      alt: string;
    }
  | {
      type: "video";
      src: string;
      poster?: string;
      alt: string;
    };

export type RoutineStep = {
  id: string;
  title: string;
  seconds: number;
  instruction: string;
  cue: string;
  media: RoutineMedia;
};

export type Routine = {
  slug: string;
  title: string;
  summary: string;
  category: RoutineCategory;
  level: RoutineLevel;
  durationMinutes: number;
  equipment: "none" | "chair" | "mat";
  premium?: boolean;
  steps: RoutineStep[];
};

