import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
} from '@heroui/react';
import { Song } from '../types';
import {
  PlayIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface SongListProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  onDelete: (songId: string) => void;
  currentSongId?: string;
  history: Song[];
}

export const SongList = ({
  songs,
  onPlay,
  onDelete,
  currentSongId,
  history,
}: SongListProps) => {
  const columns = [
    { name: '재생', uid: 'played' },
    { name: '추가된 시각', uid: 'addedAt' },
    { name: '가수', uid: 'artist' },
    { name: '제목', uid: 'title' },
    { name: '신청자', uid: 'requester' },
    { name: '액션', uid: 'actions' },
  ];

  const renderCell = (song: Song, columnKey: React.Key) => {
    switch (columnKey) {
      case 'played':
        return history.some((h) => h.id === song.id) ? (
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
        ) : null;
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="light"
              onPress={() => onPlay(song)}
              className="text-blue-500 hover:text-blue-600"
            >
              <PlayIcon className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              onPress={() => onDelete(song.id)}
              className="text-red-500 hover:text-red-600"
            >
              <TrashIcon className="w-5 h-5" />
            </Button>
          </div>
        );
      default:
        return song[columnKey as keyof Song];
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4">신청곡 관리 목록</h2>
      <Table aria-label="신청곡 목록" isHeaderSticky className="max-h-[450px]">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} allowsSorting>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={songs}>
          {songs.map((song) => (
            <TableRow
              key={song.id}
              className={`group ${currentSongId === song.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              {(columnKey) => (
                <TableCell
                  className={`${currentSongId === song.id ? 'text-blue-600 font-medium' : ''}`}
                >
                  {renderCell(song, columnKey)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
