import { createContext, useRef, type ReactNode, type RefObject } from "react";

interface VideoContextType {
  videoRef: RefObject<HTMLVideoElement | null>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <VideoContext.Provider value={{ videoRef }}>
      {children}
    </VideoContext.Provider>
  );
};

export default VideoContext;
