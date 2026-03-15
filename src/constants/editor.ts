export const POSITION_INIT = { x: 0, y: 0, z: 0 };

export const ROTATION_INIT = { x: 0, y: 0, z: 0 };

export const SCALE_INIT = { x: 1, y: 1, z: 1 };

export const URL = "/models/demo.glb";

export const INIT_ANIMATIONS = [
  {
    id: "position",
    name: "Position",
    actions: [],
  },
  {
    id: "rotation",
    name: "Rotation",
    actions: [],
  },
  {
    id: "scale",
    name: "Scale",
    actions: [],
  },
];

export const MODEL_INIT = {
  id: "model_1",
  name: "Model 1",
  url: URL,
  position: POSITION_INIT,
  rotation: ROTATION_INIT,
  scale: SCALE_INIT,
  animations: INIT_ANIMATIONS,
};

export const INIT_ACTION = {
  id: "a1",
  start: 0,
  end: 1,
  effectId: "rotation",
  name: "BG Track",
};
