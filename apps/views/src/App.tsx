import { useState, useEffect } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { DonationSettings } from './components/DonationSettings';
import { SongList } from './components/SongList';
import { CurrentSong } from './components/CurrentSong';
import {
  DonationSettings as DonationSettingsType,
  Song,
  CurrentSong as CurrentSongType,
} from './types';

// 더미 데이터 (실제로는 react-query로 대체될 예정)
const initialSettings: DonationSettingsType = {
  freeEnabled: false,
  paidEnabled: false,
};

const initialSongs: Song[] = [
  {
    id: '1',
    addedAt: '2024-04-29 14:00:00',
    artist: '아이유',
    title: 'Love wins all',
    requester: '신청자1',
  },
  {
    id: '2',
    addedAt: '2024-04-29 14:01:00',
    artist: 'NewJeans',
    title: 'Super Shy',
    requester: '신청자2',
  },
  {
    id: '3',
    addedAt: '2024-04-29 14:02:00',
    artist: 'LE SSERAFIM',
    title: 'Perfect Night',
    requester: '신청자3',
  },
  {
    id: '4',
    addedAt: '2024-04-29 14:03:00',
    artist: 'IVE',
    title: 'Baddie',
    requester: '신청자4',
  },
  {
    id: '5',
    addedAt: '2024-04-29 14:04:00',
    artist: 'aespa',
    title: 'Drama',
    requester: '신청자5',
  },
  {
    id: '6',
    addedAt: '2024-04-29 14:05:00',
    artist: 'BLACKPINK',
    title: 'How You Like That',
    requester: '신청자6',
  },
  {
    id: '7',
    addedAt: '2024-04-29 14:06:00',
    artist: 'BTS',
    title: 'Dynamite',
    requester: '신청자7',
  },
  {
    id: '8',
    addedAt: '2024-04-29 14:07:00',
    artist: 'TWICE',
    title: 'I GOT YOU',
    requester: '신청자8',
  },
  {
    id: '9',
    addedAt: '2024-04-29 14:08:00',
    artist: 'Red Velvet',
    title: 'Chill Kill',
    requester: '신청자9',
  },
  {
    id: '10',
    addedAt: '2024-04-29 14:09:00',
    artist: 'NCT DREAM',
    title: 'Candy',
    requester: '신청자10',
  },
];

export const App = () => {
  const [settings, setSettings] =
    useState<DonationSettingsType>(initialSettings);
  const [songs, setSongs] = useState<Song[]>(initialSongs);
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
    setSettings(newSettings);
    // TODO: 서버에 저장하는 로직 추가
  };

  const handlePlay = (song: Song) => {
    if (currentSong) {
    }
    setHistory([...history, song]);
    setCurrentSong(song);
  };

  const handleDelete = (songId: string) => {
    setSongs(songs.filter((song) => song.id !== songId));
    // TODO: 서버에 삭제 요청 추가
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
    if (isWideScreen) {
      return (
        <div className="flex gap-4 w-full">
          <div className="w-1/2">
            <DonationSettings
              settings={settings}
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
              settings={settings}
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
    <div className="mx-auto flex items-center justify-center h-screen w-full max-w-[1600px]">
      {renderContent()}
    </div>
  );
};
