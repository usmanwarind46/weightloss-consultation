import { create } from "zustand";

const useLoginModalStore = create((set) => ({
  showLoginModal: false,
  openLoginModal: () => set({ showLoginModal: true }),
  closeLoginModal: () => set({ showLoginModal: false }),
}));

export default useLoginModalStore;
