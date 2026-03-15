import { Suspense } from "react";
import FallbackMaterial from "./FallbackMaterial";
import VideoMaterial from "./VideoMaterial";
import IMAGE_URL from "../../../assets/images/demo.jpg";
import VIDEO_URL from "../../../assets/videos/demo.mp4";

const Video360 = () => {
  return (
    <Suspense fallback={<FallbackMaterial url={IMAGE_URL} />}>
      <VideoMaterial url={VIDEO_URL} />
    </Suspense>
  );
};

export default Video360;
