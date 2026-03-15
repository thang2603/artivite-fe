import { TextField } from "@radix-ui/themes";
import { Move3DIcon, Rotate3DIcon, Scale3DIcon } from "lucide-react";
import { useModelStore } from "../../../store/useModelStrore";
import { MODEL_INIT } from "../../../constants/editor";
import type { VectorType } from "../../../types/editor";
import { convertNumber } from "../../../utils/format";

const Transform = () => {
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);
  const editModel = useModelStore((state) => state.editModel);
  const { position, rotation, scale } = selectedModel || MODEL_INIT;

  const handleEditModel = (
    value: number,
    field: "position" | "rotation" | "scale",
    subField: keyof VectorType,
  ) => {
    if (!selectedModel) return;
    const updateModel = {
      ...selectedModel,
      [field]: { ...selectedModel[field], [subField]: value },
    };
    editModel(selectedModel?.id, updateModel);
    setSelectedModel(updateModel);
  };

  return (
    <div className=" flex flex-col gap-1 px-2 py-4">
      <div className="flex items-center gap-2">
        <Move3DIcon />
        <div className="flex gap-1">
          <TextField.Root
            size="1"
            placeholder="X"
            type="number"
            value={position.x}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "position",
                "x",
              )
            }
          />
          <TextField.Root
            size="1"
            placeholder="Y"
            type="number"
            value={position.y}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "position",
                "y",
              )
            }
          />
          <TextField.Root
            size="1"
            placeholder="Z"
            type="number"
            value={position.z}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "position",
                "z",
              )
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Rotate3DIcon />
        <div className="flex gap-1">
          <TextField.Root
            size="1"
            placeholder="X"
            type="number"
            value={rotation.x}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "rotation",
                "x",
              )
            }
          />
          <TextField.Root
            size="1"
            placeholder="Y"
            type="number"
            value={rotation.y}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "rotation",
                "y",
              )
            }
          />
          <TextField.Root
            size="1"
            placeholder="Z"
            type="number"
            value={rotation.z}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "rotation",
                "z",
              )
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Scale3DIcon />
        <div className="flex gap-1">
          <TextField.Root
            size="1"
            placeholder="X"
            type="number"
            value={scale.x}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "scale",
                "x",
              )
            }
          />
          <TextField.Root
            size="1"
            placeholder="Y"
            type="number"
            value={scale.y}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "scale",
                "y",
              )
            }
          />
          <TextField.Root
            size="1"
            placeholder="Z"
            type="number"
            value={scale.z}
            onChange={(e) =>
              handleEditModel(
                convertNumber(Number(e.target.value)),
                "scale",
                "z",
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Transform;
