import { useGLTF } from "@react-three/drei";

interface ModelProps {
  url: string;
}

const Model = ({ url }: ModelProps) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
};

export default Model;
