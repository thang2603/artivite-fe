import type { TimelineRow } from "./type";

export const ACTION_ROWS: TimelineRow[] = [
  {
    id: "position",
    name: "Position",
    actions: [
      { id: "v1", start: 0, end: 8, effectId: "position", name: "Opening" },
      { id: "v2", start: 10, end: 22, effectId: "position", name: "Scene 2" },
      { id: "v3", start: 25, end: 40, effectId: "position", name: "Climax" },
    ],
  },
  {
    id: "rotation",
    name: "Rotation",
    actions: [
      { id: "a1", start: 4, end: 12, effectId: "rotation", name: "BG Track" },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    actions: [
      { id: "s1", start: 2, end: 4.5, effectId: "scale", name: "Whoosh" },
      { id: "s2", start: 10.5, end: 12, effectId: "scale", name: "Hit" },
      { id: "s3", start: 25, end: 26.5, effectId: "scale", name: "Boom" },
    ],
  },
];
