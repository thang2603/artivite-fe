import { TextField } from "@radix-ui/themes";
import { SearchIcon } from "lucide-react";
import { useModelStore } from "../../../store/useModelStrore";
import type { ModelType } from "../../../types/editor";
import { MODEL_INIT } from "../../../constants/editor";

const TYPE_ELEMENTS = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "model",
    label: "Models",
  },
  {
    value: "image",
    label: "Images",
  },
];

const DATA_MODELS = [
  {
    id: "model_1",
    name: "Model 1",
    type: "model",
    url: "https://cdn.artivive.com/3d-models/teapot.glb",
    urlImage: "https://cdn.artivive.com/3d-models/teapot.png",
  },
];

const Elements = () => {
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);
  const addModel = useModelStore((state) => state.addModel);

  const handleAddModel = (model: ModelType) => {
    const newModel = {
      ...model,
      id: `model_${Date.now().toString()}`,
    };
    addModel(newModel);
    setSelectedModel(newModel);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <TextField.Root placeholder="Search elements...">
          <TextField.Slot>
            <SearchIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </div>
      <div className="flex gap-2 items-center ">
        {TYPE_ELEMENTS.map((item) => (
          <div key={item.value} className="cursor-pointer font-medium">
            {item.label}
          </div>
        ))}
      </div>
      <div>
        <span>Models</span>
        <div>
          {DATA_MODELS.map((model) => (
            <div
              key={model.id}
              className="border rounded bg-gray-200 w-28 h-28 flex flex-col items-center justify-center gap-2 cursor-pointer"
              onClick={() => handleAddModel(MODEL_INIT)}
            >
              <span>{model.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Elements;
