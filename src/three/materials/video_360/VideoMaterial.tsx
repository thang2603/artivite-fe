import { useVideoTexture } from "@react-three/drei";
import { BackSide } from "three";
import { useVideo } from "../../../hooks/useVideo";
import { useEffect } from "react";
import { useVideoStore } from "../../../store/useVideoStore";

interface VideoMaterialProps {
  url: string;
}

const VideoMaterial = ({ url }: VideoMaterialProps) => {
  const { videoRef } = useVideo();
  const setDuration = useVideoStore((state) => state.setDuration);
  const texture = useVideoTexture(url, {
    loop: true,
    start: false,
    muted: true,
  });

  useEffect(() => {
    videoRef.current = texture.image as HTMLVideoElement;
    console.log(videoRef.current);
    setDuration(texture.image.duration);
  }, [videoRef, texture, setDuration]);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 60, 40]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
};

export default VideoMaterial;
