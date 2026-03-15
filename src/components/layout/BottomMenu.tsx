import TimelineDemo from "../../features/editor/video/timeline/TimelineDemo";
import VideoControl from "../../features/editor/video/VideoControl";
// import VideoTimeline from "../../features/editor/video/VideoTimeline";

const BottomMenu = () => {
  return (
    <div className="relative w-full ">
      <div>
        <VideoControl />
      </div>

      <div>
        {/* <VideoTimeline /> */}
        <TimelineDemo />
      </div>
    </div>
  );
};

export default BottomMenu;
