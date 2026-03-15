import { OrbitControls } from "@react-three/drei";
import Video360 from "../materials/video_360/Video360";

const MainScene = () => {
  return (
    <mesh>
      <axesHelper args={[100]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 0]} intensity={1} />

      <OrbitControls enabled />
      <Video360 />
    </mesh>
  );
};

export default MainScene;
