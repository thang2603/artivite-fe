import type { TimelineRow } from "../features/editor/video/timeline/type";

export interface VectorType {
  x: number;
  y: number;
  z: number;
}

export interface ModelType {
  id: string;
  name: string;
  url: string;
  position: VectorType;
  rotation: VectorType;
  scale: VectorType;
  animations: TimelineRow[];
}
