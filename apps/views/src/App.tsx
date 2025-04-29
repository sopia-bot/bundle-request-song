import { useState } from 'react';
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
  type: 'SPECIFIC_STICKER',
};

const initialSongs: Song[] = [
  {
    id: '1',
    addedAt: '2024-04-29 14:00:00',
    artist: '아티스트1',
    title: '노래1',
    requester: '신청자1',
  },
  {
    id: '2',
    addedAt: '2024-04-29 14:01:00',
    artist: '아티스트2',
    title: '노래2',
    requester: '신청자2',
  },
];

export const App = () => {
  const [settings, setSettings] =
    useState<DonationSettingsType>(initialSettings);
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [currentSong, setCurrentSong] = useState<CurrentSongType>(null);

  const handleSettingsChange = (newSettings: DonationSettingsType) => {
    setSettings(newSettings);
    // TODO: 서버에 저장하는 로직 추가
  };

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
  };

  const handleDelete = (songId: string) => {
    setSongs(songs.filter((song) => song.id !== songId));
    // TODO: 서버에 삭제 요청 추가
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong?.id);
    const nextSong = songs[currentIndex + 1];
    if (nextSong) {
      setCurrentSong(nextSong);
    } else {
      setCurrentSong(null);
    }
  };

  const handleStop = () => {
    setCurrentSong(null);
  };

  return (
    <div className="container mx-auto p-4">
      <DonationSettings
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      <CurrentSong
        currentSong={currentSong}
        onNext={handleNext}
        onStop={handleStop}
      />
      <SongList songs={songs} onPlay={handlePlay} onDelete={handleDelete} />
    </div>
  );
};
