import { Canvas } from "@react-three/fiber";
import MainScene from "../scene/MainScene";

const SceneCanvas = () => {
  return (
    <Canvas style={{ width: "100%", height: "100%" }} tabIndex={-1}>
      <MainScene />
    </Canvas>
  );
};

export default SceneCanvas;
