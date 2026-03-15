export interface Tick {
  time: number;
  x: number;
  label: string;
  major: boolean;
}

export interface TimelineAction {
  id: string;
  start: number; // seconds
  end: number; // seconds
  effectId?: string;
  name?: string;
  data?: Record<string, unknown>;
}

export type ActionType = "move" | "resize";

export interface SelectedAction extends TimelineAction {
  rowId: string;
  currentTime: number;
  type: ActionType;
}

export interface TimelineRow {
  id: string;
  name: string;
  actions: TimelineAction[];
  rowHeight?: number;
}

export interface DragState {
  type: "cursor" | "move" | "resize-left" | "resize-right";
  actionId?: string;
  rowId?: string;
  startX: number;
  startTime: number;
  origStart?: number;
  origEnd?: number;
}
