import { PauseIcon, PlayIcon, StopCircleIcon } from "lucide-react";
import { useVideoStore } from "../../../store/useVideoStore";
import { useEffect } from "react";
import { useVideo } from "../../../hooks/useVideo";
import { formatVideoTime } from "../../../utils/format";

const VideoControl = () => {
  const { videoRef } = useVideo();
  const duration = useVideoStore((state) => state.duration);
  const isPlaying = useVideoStore((state) => state.isPlaying);
  const currentTime = useVideoStore((state) => state.currentTime);
  const setIsPlaying = useVideoStore((state) => state.setIsPlaying);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [duration, setCurrentTime, setIsPlaying, videoRef]);

  const handlePlay = () => {
    if (!videoRef.current) return;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.pause();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="w-full relative   ">
      <div className="flex gap-3 items-center justify-center">
        {!isPlaying ? (
          <div
            className="cursor-pointer  hover:bg-gray-300 p-1 rounded"
            onClick={handlePlay}
          >
            <PlayIcon size={20} />
          </div>
        ) : (
          <div
            className="cursor-pointer  hover:bg-gray-300 p-1 rounded"
            onClick={handlePause}
          >
            <PauseIcon size={20} />
          </div>
        )}
        <div
          className="cursor-pointer  hover:bg-gray-300 p-1 rounded"
          onClick={handleStop}
        >
          <StopCircleIcon size={20} />
        </div>
        <div className="flex gap-1">
          <span>{formatVideoTime(currentTime)}</span>
          <span>/</span>
          <span>{formatVideoTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoControl;
