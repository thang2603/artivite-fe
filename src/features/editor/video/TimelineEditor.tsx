/**
 * TimelineEditor.tsx — Single file, no external deps, Tailwind CSS only
 * Drop vào src/ rồi import vào App.tsx là dùng được ngay
 *
 * Usage:
 *   import TimelineEditor from './TimelineEditor'
 *   <TimelineEditor editorData={rows} effects={effects} onChange={setRows} />
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimelineAction {
  id: string;
  start: number; // seconds
  end: number; // seconds
  effectId?: string;
  name?: string;
  data?: Record<string, unknown>;
}

export interface TimelineRow {
  id: string;
  name: string;
  actions: TimelineAction[];
  rowHeight?: number;
}

export interface TimelineEffect {
  id: string;
  name: string;
  /** Tailwind bg color class e.g. "bg-blue-500" or hex color */
  color?: string;
}

export interface TimelineEditorProps {
  editorData: TimelineRow[];
  effects?: Record<string, TimelineEffect>;
  /** pixels per second, default 80 */
  scale?: number;
  minScale?: number;
  maxScale?: number;
  /** left offset for label column, default 160 */
  startLeft?: number;
  autoScroll?: boolean;
  hideCursor?: boolean;
  disableDrag?: boolean;
  /** total duration of timeline in seconds, default 120 */
  duration?: number;
  onChange?: (rows: TimelineRow[]) => void;
  onCursorDragStart?: (time: number) => void;
  onCursorDrag?: (time: number) => void;
  onCursorDragEnd?: (time: number) => void;
  onActionMoveStart?: (p: { action: TimelineAction; row: TimelineRow }) => void;
  onActionMoving?: (p: {
    action: TimelineAction;
    row: TimelineRow;
    start: number;
    end: number;
  }) => void;
  onActionMoveEnd?: (p: { action: TimelineAction; row: TimelineRow }) => void;
  onActionResizeStart?: (p: {
    action: TimelineAction;
    row: TimelineRow;
    dir: "left" | "right";
  }) => void;
  onActionResizing?: (p: {
    action: TimelineAction;
    row: TimelineRow;
    start: number;
    end: number;
  }) => void;
  onActionResizeEnd?: (p: { action: TimelineAction; row: TimelineRow }) => void;
  onClickAction?: (
    e: React.MouseEvent,
    p: { action: TimelineAction; row: TimelineRow },
  ) => void;
  onDoubleClickAction?: (
    e: React.MouseEvent,
    p: { action: TimelineAction; row: TimelineRow },
  ) => void;
}

export interface TimelineEditorRef {
  setTime: (t: number) => void;
  getTime: () => number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  isPlaying: () => boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 44;
const RULER_HEIGHT = 32;
const MIN_DURATION = 0.1;
const RESIZE_ZONE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${ms}`;
}

interface Tick {
  time: number;
  x: number;
  label: string;
  major: boolean;
}

function getTicks(scale: number, startLeft: number, totalSec: number): Tick[] {
  let minor = 1,
    major = 5;
  if (scale < 20) {
    minor = 10;
    major = 60;
  } else if (scale < 40) {
    minor = 5;
    major = 30;
  } else if (scale < 80) {
    minor = 2;
    major = 10;
  } else if (scale >= 200) {
    minor = 0.25;
    major = 1;
  } else if (scale >= 120) {
    minor = 0.5;
    major = 2;
  }

  const ticks: Tick[] = [];
  for (let t = 0; t <= totalSec + minor; t = +(t + minor).toFixed(6)) {
    const isMajor = Math.abs(t % major) < 0.001;
    ticks.push({
      time: t,
      x: startLeft + t * scale,
      label: isMajor ? formatTime(t) : "",
      major: isMajor,
    });
  }
  return ticks;
}

// Predefined colors for effects (hex, works with inline style)
const PRESET_COLORS: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
  pink: "#ec4899",
  teal: "#14b8a6",
  amber: "#f59e0b",
  red: "#ef4444",
  cyan: "#06b6d4",
};

function resolveColor(color?: string): string {
  if (!color) return PRESET_COLORS.blue;
  if (color.startsWith("#") || color.startsWith("rgb")) return color;
  // If it's a named key like "green"
  return PRESET_COLORS[color] ?? PRESET_COLORS.blue;
}

// ─── DragState ────────────────────────────────────────────────────────────────

interface DragState {
  type: "cursor" | "move" | "resize-left" | "resize-right";
  actionId?: string;
  rowId?: string;
  startX: number;
  startTime: number;
  origStart?: number;
  origEnd?: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TimelineEditor = forwardRef<TimelineEditorRef, TimelineEditorProps>(
  (props, ref) => {
    const {
      editorData,
      effects = {},
      scale: scaleProp = 80,
      minScale = 20,
      maxScale = 400,
      startLeft = 160,
      autoScroll = true,
      hideCursor = false,
      disableDrag = false,
      duration: durationProp = 120,
      onChange,
      onCursorDragStart,
      onCursorDrag,
      onCursorDragEnd,
      onActionMoveStart,
      onActionMoving,
      onActionMoveEnd,
      onActionResizeStart,
      onActionResizing,
      onActionResizeEnd,
      onClickAction,
      onDoubleClickAction,
    } = props;

    const scrollRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const lastTRef = useRef<number>(0);

    const [scale, setScale] = useState(scaleProp);
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [rows, setRows] = useState<TimelineRow[]>(editorData);
    const [selected, setSelected] = useState<string | null>(null);
    const [drag, setDrag] = useState<DragState | null>(null);

    useEffect(() => {
      setRows(editorData);
    }, [editorData]);
    useEffect(() => {
      setScale(scaleProp);
    }, [scaleProp]);

    const totalWidth = useMemo(
      () => startLeft + durationProp * scale + 200,
      [startLeft, durationProp, scale],
    );

    // ── Playback ──────────────────────────────────────────────────────────────

    const play = useCallback(() => {
      lastTRef.current = performance.now();
      setPlaying(true);
    }, []);
    const pause = useCallback(() => {
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    }, []);
    const toggle = useCallback(() => {
      if (playing) pause();
      else play();
    }, [playing, play, pause]);

    useEffect(() => {
      if (!playing) return;
      const tick = (now: number) => {
        const dt = (now - lastTRef.current) / 1000;
        lastTRef.current = now;
        setTime((prev) => {
          const next = prev + dt;
          if (next >= durationProp) {
            setPlaying(false);
            return durationProp;
          }
          if (autoScroll && scrollRef.current) {
            const cx = startLeft + next * scale;
            const { scrollLeft, clientWidth } = scrollRef.current;
            if (cx > scrollLeft + clientWidth - 60)
              scrollRef.current.scrollLeft = cx - clientWidth / 2;
          }
          return next;
        });
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }, [playing, scale, startLeft, autoScroll, durationProp]);

    useImperativeHandle(ref, () => ({
      setTime,
      getTime: () => time,
      play,
      pause,
      toggle,
      isPlaying: () => playing,
    }));

    // ── Helpers ───────────────────────────────────────────────────────────────

    const xToTime = useCallback(
      (clientX: number) => {
        if (!scrollRef.current) return 0;
        const rect = scrollRef.current.getBoundingClientRect();
        const x = clientX - rect.left + scrollRef.current.scrollLeft;
        return Math.max(0, (x - startLeft) / scale);
      },
      [scale, startLeft],
    );

    // ── Wheel zoom ────────────────────────────────────────────────────────────

    const handleWheel = useCallback(
      (e: React.WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        setScale((prev) =>
          clamp(prev + (e.deltaY > 0 ? -10 : 10), minScale, maxScale),
        );
      },
      [minScale, maxScale],
    );

    // ── Ruler click / drag ────────────────────────────────────────────────────

    const handleRulerDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const t = xToTime(e.clientX);
        setTime(t);
        onCursorDragStart?.(t);
        setDrag({ type: "cursor", startX: e.clientX, startTime: t });
      },
      [xToTime, onCursorDragStart],
    );

    // ── Action drag / resize ──────────────────────────────────────────────────

    const handleActionDown = useCallback(
      (
        e: React.MouseEvent,
        action: TimelineAction,
        row: TimelineRow,
        type: "move" | "resize-left" | "resize-right",
      ) => {
        if (disableDrag || e.button !== 0) return;
        e.stopPropagation();
        setSelected(action.id);
        const t = xToTime(e.clientX);
        setDrag({
          type,
          actionId: action.id,
          rowId: row.id,
          startX: e.clientX,
          startTime: t,
          origStart: action.start,
          origEnd: action.end,
        });
        if (type === "move") onActionMoveStart?.({ action, row });
        else
          onActionResizeStart?.({
            action,
            row,
            dir: type === "resize-left" ? "left" : "right",
          });
      },
      [disableDrag, xToTime, onActionMoveStart, onActionResizeStart],
    );

    // ── Global mouse events ───────────────────────────────────────────────────

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!drag) return;
        const t = xToTime(e.clientX);
        const dt = t - drag.startTime;

        if (drag.type === "cursor") {
          const nt = clamp(t, 0, durationProp);
          setTime(nt);
          onCursorDrag?.(nt);
          return;
        }

        const { actionId, rowId } = drag;
        if (!actionId || !rowId) return;

        setRows((prev) =>
          prev.map((row) => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              actions: row.actions.map((action) => {
                if (action.id !== actionId) return action;
                const dur = drag.origEnd! - drag.origStart!;
                if (drag.type === "move") {
                  const ns = clamp(drag.origStart! + dt, 0, durationProp - dur);
                  const ne = ns + dur;
                  onActionMoving?.({
                    action: { ...action, start: ns, end: ne },
                    row,
                    start: ns,
                    end: ne,
                  });
                  return { ...action, start: ns, end: ne };
                }
                if (drag.type === "resize-left") {
                  const ns = clamp(
                    drag.origStart! + dt,
                    0,
                    drag.origEnd! - MIN_DURATION,
                  );
                  onActionResizing?.({
                    action: { ...action, start: ns, end: action.end },
                    row,
                    start: ns,
                    end: action.end,
                  });
                  return { ...action, start: ns };
                }
                // resize-right
                const ne = clamp(
                  drag.origEnd! + dt,
                  drag.origStart! + MIN_DURATION,
                  durationProp,
                );
                onActionResizing?.({
                  action: { ...action, start: action.start, end: ne },
                  row,
                  start: action.start,
                  end: ne,
                });
                return { ...action, end: ne };
              }),
            };
          }),
        );
      },
      [
        drag,
        xToTime,
        durationProp,
        onCursorDrag,
        onActionMoving,
        onActionResizing,
      ],
    );

    const handleMouseUp = useCallback(() => {
      if (!drag) return;
      if (drag.type === "cursor") {
        onCursorDragEnd?.(time);
      } else if (drag.actionId && drag.rowId) {
        const row = rows.find((r) => r.id === drag.rowId);
        const action = row?.actions.find((a) => a.id === drag.actionId);
        if (action && row) {
          if (drag.type === "move") onActionMoveEnd?.({ action, row });
          else onActionResizeEnd?.({ action, row });
        }
        onChange?.(rows);
      }
      setDrag(null);
    }, [
      drag,
      time,
      rows,
      onCursorDragEnd,
      onActionMoveEnd,
      onActionResizeEnd,
      onChange,
    ]);

    useEffect(() => {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [handleMouseMove, handleMouseUp]);

    // ── Ticks ─────────────────────────────────────────────────────────────────

    const ticks = useMemo(
      () => getTicks(scale, startLeft, durationProp),
      [scale, startLeft, durationProp],
    );
    const majorTicks = useMemo(() => ticks.filter((t) => t.major), [ticks]);
    const cursorX = startLeft + time * scale;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
      <div
        className="flex flex-col w-full h-full bg-[#12141e] border border-[#252840] rounded-lg overflow-hidden select-none font-mono text-xs"
        onWheel={handleWheel}
      >
        {/* ── Controls bar ── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0e1018] border-b border-[#252840] shrink-0">
          {/* Stop */}
          <button
            onClick={() => {
              setTime(0);
              setPlaying(false);
            }}
            className="flex items-center justify-center w-7 h-7 rounded bg-[#1e2135] border border-[#2d3060] text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            title="Stop"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <rect x="3" y="3" width="10" height="10" rx="1" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={toggle}
            className={`flex items-center justify-center w-8 h-8 rounded-full border-0 text-white transition-colors ${
              playing
                ? "bg-rose-500 hover:bg-rose-400"
                : "bg-indigo-500 hover:bg-indigo-400"
            }`}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                width="13"
                height="13"
              >
                <rect x="3" y="2" width="3.5" height="12" rx="1" />
                <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                width="13"
                height="13"
              >
                <path d="M4 2.5l10 5.5-10 5.5z" />
              </svg>
            )}
          </button>

          {/* Time display */}
          <span className="px-2 py-1 rounded bg-[#1a1d2e] border border-[#252840] text-indigo-400 font-mono text-xs tracking-wider min-w-[80px] text-center">
            {formatTime(time)}
          </span>

          <div className="w-px h-5 bg-[#252840] mx-1" />

          {/* Zoom */}
          <button
            onClick={() => setScale((s) => clamp(s - 20, minScale, maxScale))}
            className="flex items-center justify-center w-6 h-6 rounded bg-[#1e2135] border border-[#2d3060] text-slate-300 hover:border-indigo-400 hover:text-white transition-colors text-base leading-none"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-slate-500 w-14 text-center text-[10px]">
            {scale}px/s
          </span>
          <button
            onClick={() => setScale((s) => clamp(s + 20, minScale, maxScale))}
            className="flex items-center justify-center w-6 h-6 rounded bg-[#1e2135] border border-[#2d3060] text-slate-300 hover:border-indigo-400 hover:text-white transition-colors text-base leading-none"
            title="Zoom in"
          >
            +
          </button>

          <div className="ml-auto text-[10px] text-slate-600 hidden sm:block">
            Ctrl+Scroll to zoom · Drag action to move · Drag edges to resize
          </div>
        </div>

        {/* ── Body: label col + scrollable timeline ── */}
        <div className="flex flex-1 overflow-scroll min-h-0">
          {/* Label column */}
          <div className="shrink-0 w-40 bg-[#0e1018] border-r border-[#252840] z-10 flex flex-col">
            {/* Ruler label */}
            <div
              className="flex items-center justify-center shrink-0 bg-[#0a0c14] border-b-2 border-indigo-500"
              style={{ height: RULER_HEIGHT }}
            >
              <span className="text-[9px] text-slate-600 uppercase tracking-widest">
                Timeline
              </span>
            </div>
            {/* Row labels */}
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center px-3 border-b border-[#1e2135] shrink-0"
                style={{ height: row.rowHeight ?? ROW_HEIGHT }}
              >
                <span className="text-slate-300 text-[11px] font-medium truncate max-w-[130px]">
                  {row.name}
                </span>
              </div>
            ))}
          </div>

          {/* Scrollable timeline */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden relative"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#2d3060 transparent",
            }}
          >
            <div style={{ width: totalWidth, position: "relative" }}>
              {/* Ruler */}
              <div
                className="relative bg-[#0a0c14] border-b-2 border-indigo-500 overflow-hidden cursor-col-resize"
                style={{ height: RULER_HEIGHT }}
                onMouseDown={handleRulerDown}
              >
                {ticks.map((tick) => (
                  <div
                    key={tick.time}
                    className="absolute bottom-0"
                    style={{ left: tick.x, transform: "translateX(-50%)" }}
                  >
                    <div
                      className={tick.major ? "bg-slate-600" : "bg-[#252840]"}
                      style={{ width: 1, height: tick.major ? 14 : 7 }}
                    />
                    {tick.major && (
                      <span
                        className="absolute text-[9px] text-slate-500 whitespace-nowrap"
                        style={{
                          bottom: 16,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        {tick.label}
                      </span>
                    )}
                  </div>
                ))}
                {/* Cursor head on ruler */}
                {!hideCursor && (
                  <div
                    className="absolute top-0 pointer-events-none z-20"
                    style={{
                      left: cursorX,
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "10px solid #f43f5e",
                    }}
                  />
                )}
              </div>

              {/* Rows */}
              {rows.map((row, ri) => (
                <div
                  key={row.id}
                  className={`relative border-b border-[#1e2135] ${ri % 2 === 0 ? "bg-[#14172a]" : "bg-[#111427]"}`}
                  style={{ height: row.rowHeight ?? ROW_HEIGHT }}
                >
                  {/* Grid lines */}
                  {majorTicks.map((tick) => (
                    <div
                      key={tick.time}
                      className="absolute top-0 bottom-0 bg-[#1e2240] pointer-events-none"
                      style={{ left: tick.x, width: 1, opacity: 0.5 }}
                    />
                  ))}

                  {/* Actions */}
                  {row.actions.map((action) => {
                    const effect = action.effectId
                      ? effects[action.effectId]
                      : null;
                    const color = resolveColor(effect?.color);
                    const label = action.name ?? effect?.name ?? action.id;
                    const left = startLeft + action.start * scale;
                    const width = Math.max(
                      (action.end - action.start) * scale,
                      4,
                    );
                    const h = (row.rowHeight ?? ROW_HEIGHT) - 8;
                    const isSel = selected === action.id;
                    const isDrag = drag?.actionId === action.id;

                    return (
                      <div
                        key={action.id}
                        className={`absolute flex items-center rounded overflow-hidden transition-shadow ${isDrag ? "cursor-grabbing opacity-90" : "cursor-grab"}`}
                        style={{
                          left,
                          top: 4,
                          width,
                          height: h,
                          background: `${color}22`,
                          border: `1px solid ${color}${isSel ? "cc" : "55"}`,
                          boxShadow: isSel
                            ? `0 0 0 1.5px ${color}88, 0 0 10px ${color}33`
                            : undefined,
                          zIndex: isSel ? 6 : isDrag ? 10 : 1,
                        }}
                        onMouseDown={(e) =>
                          handleActionDown(e, action, row, "move")
                        }
                        onClick={(e) => {
                          setSelected(action.id);
                          onClickAction?.(e, { action, row });
                        }}
                        onDoubleClick={(e) =>
                          onDoubleClickAction?.(e, { action, row })
                        }
                      >
                        {/* Left resize handle */}
                        <div
                          className="absolute left-0 top-0 h-full flex items-center justify-center cursor-ew-resize shrink-0 z-10"
                          style={{ width: RESIZE_ZONE }}
                          onMouseDown={(e) =>
                            handleActionDown(e, action, row, "resize-left")
                          }
                        >
                          <div
                            className="w-[2px] h-[55%] rounded-full opacity-0 group-hover:opacity-100"
                            style={{ background: color }}
                          />
                        </div>

                        {/* Label */}
                        <span
                          className="flex-1 text-[10px] font-semibold px-2 truncate pointer-events-none tracking-wide"
                          style={{ color: `${color}dd` }}
                        >
                          {label}
                        </span>

                        {/* Duration */}
                        <span
                          className="text-[9px] pr-2 pointer-events-none shrink-0"
                          style={{ color: `${color}77` }}
                        >
                          {(action.end - action.start).toFixed(1)}s
                        </span>

                        {/* Right resize handle */}
                        <div
                          className="absolute right-0 top-0 h-full flex items-center justify-center cursor-ew-resize shrink-0 z-10"
                          style={{ width: RESIZE_ZONE }}
                          onMouseDown={(e) =>
                            handleActionDown(e, action, row, "resize-right")
                          }
                        >
                          <div
                            className="w-[2px] h-[55%] rounded-full"
                            style={{ background: `${color}77` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Cursor line */}
                  {!hideCursor && (
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none"
                      style={{
                        left: cursorX,
                        width: 1,
                        background: "#f43f5e88",
                        zIndex: 5,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

TimelineEditor.displayName = "TimelineEditor";
export default TimelineEditor;
