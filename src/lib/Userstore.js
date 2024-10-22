import { create } from 'zustand';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  error: null, // State for tracking errors
  fetchUserInfo: async (uid) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false, error: null });
      return; // Return early if uid is not provided
    }
    
    set({ isLoading: true }); // Set loading state to true before fetching

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false, error: null });
      } else {
        set({ currentUser: null, isLoading: false, error: "User not found" }); // Set error if user not found
      }
    } catch (err) {
      console.error("Error fetching user info:", err); // Log error
      set({ currentUser: null, isLoading: false, error: "Failed to fetch user info" }); // Set error state
    }
  }
}));
