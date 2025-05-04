import React from 'react';
import { useSongsStore } from '../store/songs';

export const DeleteAllSongsButton: React.FC = () => {
  const clearSongs = useSongsStore((state) => state.clearSongs);

  const handleClearAll = async () => {
    if (window.confirm('모든 신청곡을 삭제하시겠습니까?')) {
      await clearSongs();
    }
  };

  return (
    <button
      onClick={handleClearAll}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      목록 전체 삭제
    </button>
  );
};
