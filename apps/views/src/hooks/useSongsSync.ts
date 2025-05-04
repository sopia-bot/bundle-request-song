import { useEffect } from 'react';
import { useSongsStore } from '../store/songs';

export const useSongsSync = () => {
  const fetchSongs = useSongsStore((state) => state.fetchSongs);

  useEffect(() => {
    const syncInterval = setInterval(fetchSongs, 1500);
    return () => clearInterval(syncInterval);
  }, [fetchSongs]);
};
