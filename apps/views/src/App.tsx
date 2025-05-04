import { useState, useEffect } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DonationSettings } from './components/DonationSettings';
import { SongList } from './components/SongList';
import { CurrentSong } from './components/CurrentSong';
import { Sticker } from '@sopia-bot/core';
import {
  DonationSettings as DonationSettingsType,
  Song,
  CurrentSong as CurrentSongType,
} from './types';
import { useSongsStore } from './store/songs';

// 더미 데이터 (실제로는 react-query로 대체될 예정)
const initialSettings: DonationSettingsType = {
  freeEnabled: false,
  paidEnabled: false,
};

const fetchSettings = async (): Promise<DonationSettingsType> => {
  const response = await fetch('stp://request-song.sopia.dev/settings');
  if (!response.ok) {
    throw new Error('설정을 불러오는데 실패했습니다.');
  }
  const data = await response.json();
  return {
    freeEnabled: data.allowFree,
    limitCountEnabled: data.limitByCount,
    limitCount: data.maxRequestCount ?? 0,
    limitTimeEnabled: data.limitByTime,
    limitTime: data.requestTimeLimit ?? 0,
    paidEnabled: data.allowPaid,
    donationType:
      data.paidType === 'sticker' ? 'SPECIFIC_STICKER' : 'MINIMUM_STICKER',
    sticker: data.stickerId ? ({ name: data.stickerId } as Sticker) : undefined,
    minimumAmount: data.minAmount ?? 0,
    distributionEnabled: data.allowDistribution ?? false,
  };
};

const updateSettings = async (
  settings: DonationSettingsType,
): Promise<void> => {
  const response = await fetch('stp://request-song.sopia.dev/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      allowFree: settings.freeEnabled,
      limitByCount: settings.limitCountEnabled,
      maxRequestCount: settings.limitCount,
      limitByTime: settings.limitTimeEnabled,
      requestTimeLimit: settings.limitTime,
      allowPaid: settings.paidEnabled,
      paidType:
        settings.donationType === 'SPECIFIC_STICKER' ? 'sticker' : 'amount',
      stickerId: settings.sticker?.name,
      minAmount: settings.minimumAmount,
      allowDistribution: settings.distributionEnabled,
    }),
  });

  if (!response.ok) {
    throw new Error('설정을 저장하는데 실패했습니다.');
  }
};

export const App = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const { mutate: updateSettingsMutation } = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => {
      console.error('설정 저장 실패:', error);
    },
  });

  const songs = useSongsStore((state) => state.songs);
  const removeSong = useSongsStore((state) => state.removeSong);
  const updateSong = useSongsStore((state) => state.updateSong);
  const [currentSong, setCurrentSong] = useState<CurrentSongType>(null);
  const [history, setHistory] = useState<Song[]>([]);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('settings');
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1400);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 1400);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSettingsChange = (newSettings: DonationSettingsType) => {
    updateSettingsMutation(newSettings);
  };

  const handlePlay = (song: Song) => {
    if (currentSong) {
    }
    setHistory([...history, song]);
    setCurrentSong(song);
    updateSong(song.id, {
      isPlayed: true,
    });
  };

  const handleDelete = (songId: string) => {
    removeSong(songId);
  };

  const handleNext = () => {
    if (isShuffleActive) {
      // 셔플 모드일 때는 랜덤으로 다음 곡 선택
      const availableSongs = songs.filter(
        (song) => song.id !== currentSong?.id,
      );
      if (availableSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        setCurrentSong(availableSongs[randomIndex]);
        setHistory([...history, availableSongs[randomIndex]]);
        updateSong(availableSongs[randomIndex].id, {
          isPlayed: true,
        });
      } else {
        setCurrentSong(null);
      }
    } else {
      // 일반 모드일 때는 순서대로 다음 곡 선택
      const currentIndex = songs.findIndex(
        (song) => song.id === currentSong?.id,
      );
      const nextSong = songs[currentIndex + 1];
      if (nextSong) {
        setCurrentSong(nextSong);
        setHistory([...history, nextSong]);
        updateSong(nextSong.id, {
          isPlayed: true,
        });
      } else {
        setCurrentSong(null);
      }
    }
  };

  const handlePrevious = () => {
    if (history.length > 0) {
      const previousSong = history[history.length - 1];
      setCurrentSong(previousSong);
      setHistory(history.slice(0, -1));
    }
  };

  const handleStop = () => {
    if (currentSong) {
      setHistory([...history, currentSong]);
    }
    setCurrentSong(null);
  };

  const handleShuffleToggle = () => {
    setIsShuffleActive(!isShuffleActive);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div>로딩 중...</div>;
    }

    if (isWideScreen) {
      return (
        <div className="flex gap-4 w-full">
          <div className="w-1/2">
            <DonationSettings
              settings={settings ?? initialSettings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
          <div className="w-1/2">
            <CurrentSong
              currentSong={currentSong}
              onNext={handleNext}
              onStop={handleStop}
              onPrevious={handlePrevious}
              onShuffleToggle={handleShuffleToggle}
              isShuffleActive={isShuffleActive}
            />
            <SongList
              songs={songs}
              onPlay={handlePlay}
              onDelete={handleDelete}
              currentSongId={currentSong?.id}
              history={history}
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          className="w-full"
        >
          <Tab key="settings" title="설정">
            <DonationSettings
              settings={settings ?? initialSettings}
              onSettingsChange={handleSettingsChange}
            />
          </Tab>
          <Tab key="songs" title="신청곡">
            <div className="space-y-4">
              <CurrentSong
                currentSong={currentSong}
                onNext={handleNext}
                onStop={handleStop}
                onPrevious={handlePrevious}
                onShuffleToggle={handleShuffleToggle}
                isShuffleActive={isShuffleActive}
              />
              <SongList
                songs={songs}
                onPlay={handlePlay}
                onDelete={handleDelete}
                currentSongId={currentSong?.id}
                history={history}
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="mx-auto flex items-center justify-center h-screen w-full max-w-[1600px] overflow-y-auto">
      {renderContent()}
    </div>
  );
};
