import { Card, Button, Progress, Tooltip } from '@heroui/react';
import { CurrentSong as CurrentSongType } from '../types';
import {
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface CurrentSongProps {
  currentSong: CurrentSongType;
  onNext: () => void;
  onStop: () => void;
  onPrevious: () => void;
  onShuffleToggle: () => void;
  isShuffleActive: boolean;
}

export const CurrentSong = ({
  currentSong,
  onNext,
  onStop,
  onPrevious,
  onShuffleToggle,
  isShuffleActive,
}: CurrentSongProps) => {
  useEffect(() => {
    if (!currentSong) return;
  }, [currentSong]);

  const handleNext = () => {
    onNext();
  };

  return (
    <>
      <Card className="p-4 mb-4 bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-start gap-4">
          {/* 앨범 커버 */}
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-rose-400"></div>
          </div>

          {/* 노래 정보와 컨트롤 */}
          <div className="flex-grow">
            <div className="mb-2">
              <p className="text-gray-400 text-sm">
                {currentSong ? currentSong.artist : '재생 중이지 않음'}
              </p>
              <h2 className="text-gray-800 font-bold">
                {currentSong ? currentSong.title : '재생할 노래를 선택해주세요'}
              </h2>
            </div>

            {/* 프로그레스 바 */}
            <div className="space-y-2">
              <Progress
                value={currentSong ? 30 : 0}
                className="h-1 bg-gray-200"
                color="primary"
                aria-label="프로그래스 바"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0:00</span>
                <span>0:00</span>
              </div>
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <Tooltip
                content="이전 곡"
                className="!bg-gray-900 !text-white !rounded-lg !shadow-lg !px-3 !py-2 !text-sm !font-semibold !border !border-gray-700"
              >
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onPrevious}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <BackwardIcon className="w-5 h-5" />
                </Button>
              </Tooltip>
              <Tooltip
                content="중지"
                className="!bg-gray-900 !text-white !rounded-lg !shadow-lg !px-3 !py-2 !text-sm !font-semibold !border !border-gray-700"
              >
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onStop}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <StopIcon className="w-5 h-5" />
                </Button>
              </Tooltip>
              <Tooltip
                content="다음 곡"
                className="!bg-gray-900 !text-white !rounded-lg !shadow-lg !px-3 !py-2 !text-sm !font-semibold !border !border-gray-700"
              >
                <Button
                  isIconOnly
                  variant="light"
                  onPress={handleNext}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ForwardIcon className="w-5 h-5" />
                </Button>
              </Tooltip>
              <Tooltip
                content="셔플"
                className="!bg-gray-900 !text-white !rounded-lg !shadow-lg !px-3 !py-2 !text-sm !font-semibold !border !border-gray-700"
              >
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onShuffleToggle}
                  className={`${
                    isShuffleActive
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
