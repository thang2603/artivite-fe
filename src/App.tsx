import DefaultLayout from "./components/layout/DefaultLayout";
import { VideoProvider } from "./contexts/VideoContext";
import Editor from "./pages/Editor";

const App = () => {
  return (
    <VideoProvider>
      <DefaultLayout>
        <Editor />
      </DefaultLayout>
    </VideoProvider>
  );
};

export default App;
