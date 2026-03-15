import { useTexture } from "@react-three/drei";
import { BackSide } from "three";

interface FallbackMaterialProps {
  url: string;
}
const FallbackMaterial = ({ url }: FallbackMaterialProps) => {
  const texture = useTexture(url);
  return <meshBasicMaterial map={texture} side={BackSide} />;
};

export default FallbackMaterial;
