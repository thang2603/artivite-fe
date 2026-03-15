import { create } from "zustand";
import type { ModelType } from "../types/editor";

interface ModelState {
  listModels: ModelType[];
  setListModels: (models: ModelType[]) => void;
  selectedModel: ModelType | null;
  setSelectedModel: (model: ModelType | null) => void;
  addModel: (model: ModelType) => void;
  removeModel: (id: string) => void;
  editModel: (id: string, updatedModel: Partial<ModelType>) => void;
}

const initsialState = {
  listModels: [],
  selectedModel: null,
};

export const useModelStore = create<ModelState>((set) => ({
  ...initsialState,
  setListModels: (models) => set({ listModels: models }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  addModel: (model) =>
    set((state) => ({ listModels: [...state.listModels, model] })),

  removeModel: (id) =>
    set((state) => ({
      listModels: state.listModels.filter((model) => model.id !== id),
    })),

  editModel: (id, updatedModel) =>
    set((state) => ({
      listModels: state.listModels.map((model) =>
        model.id === id ? { ...model, ...updatedModel } : model,
      ),
    })),
}));
