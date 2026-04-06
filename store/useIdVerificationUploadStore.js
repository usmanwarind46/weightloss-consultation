import { create } from "zustand";
import { persist } from "zustand/middleware";

const useIdVerificationUploadStore = create(
  persist(
    (set) => ({
      idVerificationUpload: false,
      setIdVerificationUpload: (status) =>
        set({ idVerificationUpload: status }),
    }),
    {
      name: "id-verification-image-storage", // Key in localStorage
      partialize: (state) => ({
        idVerificationUpload: state.idVerificationUpload,
      }), // Only persist this field
    },
  ),
);

export default useIdVerificationUploadStore;
