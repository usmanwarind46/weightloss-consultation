import { create } from "zustand";
import { persist } from "zustand/middleware";

const useImageUploadStore = create(
  persist(
    (set) => ({
      imageUploaded: false,
      setImageUploaded: (status) => set({ imageUploaded: status }),
    }),
    {
      name: "image-upload-storage", // Key in localStorage
      partialize: (state) => ({ imageUploaded: state.imageUploaded }), // Only persist this field
    },
  ),
);

export default useImageUploadStore;
