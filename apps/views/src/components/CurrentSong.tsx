import { Card, Button } from '@heroui/react';
import { CurrentSong as CurrentSongType } from '../types';

interface CurrentSongProps {
  currentSong: CurrentSongType;
  onNext: () => void;
  onStop: () => void;
}

export const CurrentSong = ({
  currentSong,
  onNext,
  onStop,
}: CurrentSongProps) => {
  if (!currentSong) {
    return null;
  }

  return (
    <Card className="p-4 mb-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">현재 재생 중</h2>
        <div className="mb-4">
          <p className="text-xl">{currentSong.artist}</p>
          <p className="text-2xl font-bold">{currentSong.title}</p>
          <p className="text-gray-600">신청자: {currentSong.requester}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onPress={onNext}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            다음
          </Button>
          <Button
            onPress={onStop}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            정지
          </Button>
        </div>
      </div>
    </Card>
  );
};
