import { OrbitControls } from "@react-three/drei";
import Video360 from "../materials/video_360/Video360";
import ListModel from "./ListModel";

const MainScene = () => {
  return (
    <mesh>
      <axesHelper args={[100]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 0]} intensity={1} />

      <OrbitControls enabled makeDefault />
      <Video360 />
      <ListModel />
    </mesh>
  );
};

export default MainScene;
