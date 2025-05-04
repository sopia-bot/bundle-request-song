import { create } from 'zustand';
import { Song } from '../types/';
import {
  fetchSongs,
  createSong,
  updateSong,
  deleteSong,
  deleteAllSongs,
  checkAvailability,
} from '../api/songs';

interface SongsState {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  fetchSongs: () => Promise<void>;
  addSong: (song: Parameters<typeof createSong>[0]) => Promise<void>;
  updateSong: (id: string, song: Partial<Song>) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  clearSongs: () => Promise<void>;
  checkAvailability: (
    data: Parameters<typeof checkAvailability>[0],
  ) => Promise<{
    allowed: boolean;
    reason?: string;
  }>;
}

export const useSongsStore = create<SongsState>((set) => ({
  songs: [],
  isLoading: false,
  error: null,
  fetchSongs: async () => {
    try {
      set({ isLoading: true, error: null });
      const newSongs = await fetchSongs();
      set((state) => {
        const hasChanges =
          JSON.stringify(state.songs) !== JSON.stringify(newSongs);
        return hasChanges
          ? { songs: newSongs, isLoading: false }
          : { isLoading: false };
      });
    } catch (error) {
      set({ error: 'Failed to fetch songs', isLoading: false });
    }
  },
  addSong: async (song) => {
    try {
      const newSong = await createSong(song);
      set((state) => ({ songs: [newSong, ...state.songs] }));
    } catch (error) {
      set({ error: 'Failed to add song' });
    }
  },
  updateSong: async (id, song) => {
    try {
      const updatedSong = await updateSong(id, song);
      set((state) => ({
        songs: state.songs.map((s) => (s.id === id ? updatedSong : s)),
      }));
    } catch (error) {
      set({ error: 'Failed to update song' });
    }
  },
  removeSong: async (id) => {
    try {
      await deleteSong(id);
      set((state) => ({
        songs: state.songs.filter((s) => s.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete song' });
    }
  },
  clearSongs: async () => {
    try {
      await deleteAllSongs();
      set({ songs: [] });
    } catch (error) {
      set({ error: 'Failed to clear songs' });
    }
  },
  checkAvailability: async (data) => {
    try {
      return await checkAvailability(data);
    } catch (error) {
      set({ error: 'Failed to check availability' });
      return { allowed: false, reason: '서버 오류가 발생했습니다' };
    }
  },
}));
