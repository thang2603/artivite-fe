import { TransformControls } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";
import { useModelStore } from "../../store/useModelStrore";
import Model from "../materials/models/Model";
import cloneDeep from "lodash.clonedeep";
import { convertNumber } from "../../utils/format";
const TransformControlModel = () => {
  const ref = useRef<Mesh>(null!);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);
  const editModel = useModelStore((state) => state.editModel);

  const handleMouseUp = () => {
    if (!ref?.current || !selectedModel) return;

    const { position, rotation, scale } = ref.current;
    const newPosition = {
      x: convertNumber(position.x),
      y: convertNumber(position.y),
      z: convertNumber(position.z),
    };
    const newRotation = {
      x: convertNumber(rotation.x),
      y: convertNumber(rotation.y),
      z: convertNumber(rotation.z),
    };
    const newScale = {
      x: convertNumber(scale.x),
      y: convertNumber(scale.y),
      z: convertNumber(scale.z),
    };
    const updateModel = {
      ...selectedModel,
      position: newPosition,
      rotation: newRotation,
      scale: newScale,
    };
    editModel(selectedModel?.id, cloneDeep(updateModel));
    setSelectedModel(cloneDeep(updateModel));
  };

  return (
    selectedModel && (
      <TransformControls
        mode="translate"
        object={ref}
        onMouseUp={() => handleMouseUp()}
      >
        <mesh
          ref={ref}
          position={[
            selectedModel.position.x,
            selectedModel.position.y,
            selectedModel.position.z,
          ]}
          rotation={[
            selectedModel.rotation.x,
            selectedModel.rotation.y,
            selectedModel.rotation.z,
          ]}
          scale={[
            selectedModel.scale.x,
            selectedModel.scale.y,
            selectedModel.scale.z,
          ]}
        >
          <Model url={selectedModel?.url} />
        </mesh>
      </TransformControls>
    )
  );
};

export default TransformControlModel;
