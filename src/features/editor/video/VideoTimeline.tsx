import { useState, useRef, useCallback } from "react";
// import TimelineEditor from "./TimelineEditor";
import type {
  TimelineRow,
  TimelineEffect,
  TimelineEditorRef,
} from "./TimelineEditor";
import TimelineEditor from "./TimelineEditor";

const ROWS: TimelineRow[] = [
  {
    id: "video",
    name: "🎬 Video",
    actions: [
      { id: "v1", start: 0, end: 8, effectId: "video", name: "Opening" },
      { id: "v2", start: 10, end: 22, effectId: "video", name: "Scene 2" },
      { id: "v3", start: 25, end: 40, effectId: "video", name: "Climax" },
    ],
  },
  {
    id: "audio",
    name: "🎵 Music",
    actions: [
      { id: "a1", start: 0, end: 45, effectId: "audio", name: "BG Track" },
    ],
  },
  {
    id: "sfx",
    name: "🔊 SFX",
    actions: [
      { id: "s1", start: 2, end: 4.5, effectId: "sfx", name: "Whoosh" },
      { id: "s2", start: 10.5, end: 12, effectId: "sfx", name: "Hit" },
      { id: "s3", start: 25, end: 26.5, effectId: "sfx", name: "Boom" },
    ],
  },
  {
    id: "text",
    name: "✏️ Captions",
    actions: [
      { id: "t1", start: 1, end: 5, effectId: "text", name: "Title" },
      { id: "t2", start: 12, end: 18, effectId: "text", name: "Subtitle" },
      { id: "t3", start: 30, end: 38, effectId: "text", name: "Credits" },
    ],
  },
  {
    id: "fx",
    name: "✨ Effects",
    actions: [
      { id: "e1", start: 7.5, end: 11, effectId: "fx", name: "Fade" },
      { id: "e2", start: 24, end: 26, effectId: "fx", name: "Flash" },
    ],
  },
];

const EFFECTS: Record<string, TimelineEffect> = {
  video: { id: "video", name: "Video", color: "#3b82f6" },
  audio: { id: "audio", name: "Audio", color: "#22c55e" },
  sfx: { id: "sfx", name: "SFX", color: "#f97316" },
  text: { id: "text", name: "Caption", color: "#a855f7" },
  fx: { id: "fx", name: "Effect", color: "#ec4899" },
};

let uid = 200;
const VideoTimeline = () => {
  const editorRef = useRef<TimelineEditorRef>(null);
  const [rows, setRows] = useState<TimelineRow[]>(ROWS);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback(
    (msg: string) => setLog((p) => [msg, ...p].slice(0, 5)),
    [],
  );

  const handleAdd = () => {
    const ri = Math.floor(Math.random() * rows.length);
    const row = rows[ri];
    const effectIds = Object.keys(EFFECTS);
    const eid = effectIds[Math.floor(Math.random() * effectIds.length)];
    const start = +(Math.random() * 50).toFixed(1);
    const end = +(start + 2 + Math.random() * 6).toFixed(1);
    const newAction = { id: `a-${++uid}`, start, end, effectId: eid };
    setRows((prev) =>
      prev.map((r, i) =>
        i !== ri ? r : { ...r, actions: [...r.actions, newAction] },
      ),
    );
    addLog(`➕ Added to "${row.name}"`);
  };

  return (
    <div className="min-h-screen bg-[#090b12] text-slate-300 p-6 flex flex-col gap-5 font-mono">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: "▶ Play", fn: () => editorRef.current?.play() },
          { label: "⏸ Pause", fn: () => editorRef.current?.pause() },
          {
            label: "⏮ Reset",
            fn: () => {
              editorRef.current?.setTime(0);
            },
          },
          { label: "➕ Add Action", fn: handleAdd },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.fn}
            className="px-3 py-1.5 text-[11px] bg-[#1a1d2e] border border-[#2d3060] rounded hover:border-indigo-400 hover:text-white transition-colors"
          >
            {btn.label}
          </button>
        ))}

        {/* Event log */}
        <div className="flex gap-2 ml-2 overflow-hidden">
          {log.map((l, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-1 rounded bg-[#181b2e] border border-[#2d3060] text-indigo-400 whitespace-nowrap"
              style={{ opacity: 1 - i * 0.2 }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg overflow-hidden" style={{ height: 280 }}>
        <TimelineEditor
          ref={editorRef}
          editorData={rows}
          effects={EFFECTS}
          scale={80}
          duration={60}
          autoScroll
          onChange={(updated) => {
            setRows(updated);
          }}
          onActionMoveEnd={({ action, row }) =>
            addLog(
              `✋ Moved in "${row.name}" → ${action.start.toFixed(1)}–${action.end.toFixed(1)}s`,
            )
          }
          onActionResizeEnd={({ action }) =>
            addLog(
              `↔ Resized → ${action.start.toFixed(1)}–${action.end.toFixed(1)}s`,
            )
          }
          onClickAction={(_, { action, row }) =>
            addLog(`🖱 "${action.name ?? action.id}" in "${row.name}"`)
          }
        />
      </div>

      {/* API reference */}
      <div className="text-[10px] text-slate-700 flex gap-2 flex-wrap border-t border-[#1a1d2e] pt-3">
        {[
          "onChange",
          "onClickAction",
          "onActionMoveEnd",
          "onActionResizeEnd",
          "ref.play()",
          "ref.pause()",
          "ref.setTime(n)",
          "ref.getTime()",
        ].map((s) => (
          <code
            key={s}
            className="bg-[#141726] px-2 py-0.5 rounded text-slate-500"
          >
            {s}
          </code>
        ))}
      </div>
    </div>
  );
};

export default VideoTimeline;
