import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";
import { getTicks } from "./helpers";
import { PRESET_COLORS } from "./constants";
import type {
  ActionType,
  SelectedAction,
  TimelineAction,
  TimelineRow,
} from "./type";
import { useModelStore } from "../../../../store/useModelStrore";
import type { ModelType } from "../../../../types/editor";
import { INIT_ACTION } from "../../../../constants/editor";

interface TimelineDemoProps {
  duration?: number;
  startLeft?: number;
  scale?: number;
  withLabel?: number;
  hightRow?: number;
}

// moc

// CONSTANT

const MIN_DURATION = 0.1;
const RESIZE_ZONE = 8;
const DURATION = 100;
const HIGHT_ROW = 40;
const LEFT_SPACE = 100;
const WIDTH_LABEL = 160;
const SCALE = 80;
const LEFT_MENU_WIDTH = 386;
const HIGHT_TICK = 12;

const ROWS = [
  {
    id: "position",
    name: "Position",
  },
  {
    id: "rotation",
    name: "Rotation",
  },
  {
    id: "scale",
    name: "Scale",
  },
];

const TimelineDemo = ({
  duration = DURATION,
  startLeft = LEFT_SPACE,
  scale = SCALE,
  withLabel = WIDTH_LABEL,
  hightRow = HIGHT_ROW,
}: TimelineDemoProps) => {
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);
  const animations = selectedModel?.animations || ([] as TimelineRow[]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<SelectedAction | null>(null);

  const totalWidth = useMemo(() => duration * scale, [duration, scale]);
  const ticks = useMemo(() => getTicks(scale, duration), [scale, duration]);

  const covertPositionToTime = (clientX: number) => {
    if (!scrollRef.current) return 0;
    const rect = scrollRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;

    const time = ((relativeX / scale) * 1000) / 1000;
    return Math.max(0, time);
  };

  const handleSelected = (
    e: MouseEvent,
    action: TimelineAction,
    type: ActionType,
    rowId: string,
  ) => {
    e.stopPropagation();
    const clientX = e.clientX;
    const time = covertPositionToTime(clientX);
    setSelected({ ...action, type, currentTime: time, rowId });
  };

  const handleResize = (e: MouseEvent, rowId: string) => {
    if (!selected) return;
    if (selected.type !== "resize") return;
    if (!selectedModel) return;
    e.stopPropagation();
    const clientX = e.clientX;

    const newAnimations = animations.map((row) => {
      if (row.id !== rowId) return row;
      const newActions = row.actions.map((action) => {
        if (action.id !== selected.id) return action;
        const newEnd = covertPositionToTime(clientX);
        return {
          ...action,
          end: newEnd > action.start + MIN_DURATION ? newEnd : action.end,
        };
      });
      return {
        ...row,
        actions: newActions,
      };
    });
    const updateModel: ModelType = {
      ...selectedModel,
      animations: newAnimations,
    };
    setSelectedModel(updateModel);
  };

  const handleDrag = (e: MouseEvent, rowId: string) => {
    if (!selected) return;
    if (selected.type !== "move") return;
    if (!selectedModel) return;
    e.stopPropagation();
    const clientX = e.clientX;

    const newAnimations = animations.map((row) => {
      if (row.id !== rowId) return row;
      const newActions = row.actions.map((action) => {
        if (action.id !== selected.id) return action;
        const time = covertPositionToTime(clientX);
        const currentTime = selected.currentTime;
        const delta = time - currentTime;
        const newStart = selected.start + delta;
        const newEnd = selected.end + delta;
        if (newStart < 0 || newEnd > duration) return action;
        return {
          ...action,
          end: newEnd,
          start: newStart,
        };
      });
      return {
        ...row,
        actions: newActions,
      };
    });

    const updateModel: ModelType = {
      ...selectedModel!,
      animations: newAnimations,
    };
    setSelectedModel(updateModel);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!selected) return;
    const { rowId } = selected;
    if (selected.type === "resize") {
      handleResize(e, rowId);
      return;
    }
    if (selected.type === "move") {
      handleDrag(e, rowId);
      return;
    }
  };
  const handleMouseUp = () => {
    if (!selected) return;
    setSelected(null);
  };

  const handleDragStart = (e: DragEvent, field: string) => {
    console.log("handleDragStart", { field });
    if (!selectedModel) return;
    e.dataTransfer.setData("type", field);
  };

  const handleDrop = (e: DragEvent) => {
    if (!selectedModel) return;
    e.preventDefault();

    const initAction: TimelineAction = {
      ...INIT_ACTION,
      id: `1`,
    };
    const type = e.dataTransfer.getData("type");
    const newAnimations = animations.map((row) => {
      if (row.id !== type) return row;
      return {
        ...row,
        actions: [...row.actions, initAction],
      };
    });
    const updateModel: ModelType = {
      ...selectedModel!,
      animations: newAnimations,
    };
    setSelectedModel(updateModel);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };
  return (
    <div className="border flex relative min-w-full bg-[#0e1018]  border-[#252840] rounded-lg text-white">
      <div>
        <div
          className="border-b border-r"
          style={{ width: withLabel, height: hightRow }}
        >
          <span>Timeline</span>
        </div>
        {ROWS.map(({ id, name }) => (
          <div
            draggable
            key={`label_${id}`}
            className="border-b border-r"
            style={{ width: withLabel, height: HIGHT_ROW }}
            onDragStart={(e) => handleDragStart(e, id)}
          >
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div>
        <div
          className="border-b "
          style={{ width: startLeft, height: hightRow }}
        ></div>
        {ROWS.map(({ id }) => (
          <div
            key={`space_${id}`}
            className="border-b "
            style={{ width: startLeft, height: hightRow }}
          ></div>
        ))}
      </div>
      <div
        ref={scrollRef}
        className="overflow-x-auto relative bg-[#0a0c14]  border-indigo-500 px-0 m-0 "
        style={{
          maxWidth: `calc(100vw - ${startLeft + withLabel + LEFT_MENU_WIDTH}px)`,
          cursor: selected?.type === "resize" ? "ew-resize" : "grab",
        }}
        onMouseMove={(e) => handleMouseMove(e)}
        onMouseUp={handleMouseUp}
      >
        <div
          style={{ width: `${totalWidth}px` }}
          className="bg-[#0a0c14]  border-indigo-50 "
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="border-b " style={{ height: hightRow }}>
            {ticks.map((tick) => (
              <div key={`tick_${tick.time}`}>
                <div
                  className="absolute translate-x-[-50%] text-[10px] text-gray-500"
                  style={{ left: tick.x }}
                >
                  {tick.label}
                </div>
                <div
                  className="w-px bg-gray-400 absolute"
                  style={{
                    left: tick.x,
                    height: tick.major
                      ? hightRow * 4 - HIGHT_TICK - 4
                      : hightRow / 4,
                    top: tick.major
                      ? HIGHT_TICK + 4
                      : hightRow - HIGHT_TICK + 1,
                  }}
                ></div>
              </div>
            ))}
          </div>

          {animations.map(({ actions, id }, index) => {
            const color = PRESET_COLORS[index % PRESET_COLORS.length];
            return actions.map((action) => (
              <div
                key={action.id}
                className="absolute rounded"
                style={{
                  left: action.start * scale,
                  width: (action.end - action.start) * scale,
                  top: (index + 1) * HIGHT_ROW + 6,
                  height: HIGHT_ROW - 12,
                  background: `${color}22`,
                  border: `1px solid ${color}`,
                  zIndex: 10,
                  cursor: selected?.type === "resize" ? "ew-resize" : "grab",
                }}
              >
                <div
                  className="px-2 flex items-center gap-1 h-full"
                  onMouseDown={(e) => handleSelected(e, action, "move", id)}
                >
                  <span className="text-[10px]">{action.name}</span>
                  <span className="text-[10px]">
                    {(action.end - action.start).toFixed(1)}s
                  </span>
                </div>
                {/* Right resize handle */}
                <div
                  className="absolute right-0 top-0 h-full flex items-center justify-center cursor-ew-resize shrink-0 z-10"
                  style={{ width: RESIZE_ZONE }}
                  onMouseDown={(e) => handleSelected(e, action, "resize", id)}
                >
                  <div
                    className="w-0.5 h-[55%] rounded-full"
                    style={{ background: `${color}77` }}
                  />
                </div>
              </div>
            ));
          })}

          {/* Cursor line */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none h-full"
            style={{
              left: 22,
              width: 1,
              background: "#f43f5e88",
              zIndex: 5,
            }}
          />
          {ROWS.map(({ id }) => (
            <div
              key={`row_${id}`}
              className="border-b"
              style={{ height: HIGHT_ROW }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineDemo;
