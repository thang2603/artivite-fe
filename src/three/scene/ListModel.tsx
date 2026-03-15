import { useModelStore } from "../../store/useModelStrore";
import type { ModelType } from "../../types/editor";
import Model from "../materials/models/Model";
import TransformControlModel from "./TransformControlModel";

const ListModel = () => {
  const listModels = useModelStore((state) => state.listModels);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);

  const handleSelectModel = (model: ModelType) => {
    setSelectedModel(model);
  };

  return (
    <group>
      {listModels.map(
        (model) =>
          selectedModel?.id !== model.id && (
            <mesh
              key={model.id}
              position={[model.position.x, model.position.y, model.position.z]}
              rotation={[model.rotation.x, model.rotation.y, model.rotation.z]}
              scale={[model.scale.x, model.scale.y, model.scale.z]}
              onClick={() => handleSelectModel(model)}
            >
              <Model url={model.url} />
            </mesh>
          ),
      )}
      {selectedModel && <TransformControlModel />}
    </group>
  );
};

export default ListModel;
