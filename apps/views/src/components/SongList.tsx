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

interface SongListProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  onDelete: (songId: string) => void;
}

export const SongList = ({ songs, onPlay, onDelete }: SongListProps) => {
  const columns = [
    { name: '추가된 시각', uid: 'addedAt' },
    { name: '가수', uid: 'artist' },
    { name: '제목', uid: 'title' },
    { name: '신청자', uid: 'requester' },
    { name: '액션', uid: 'actions' },
  ];

  const renderCell = (song: Song, columnKey: React.Key) => {
    switch (columnKey) {
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button
              onPress={() => onPlay(song)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              재생
            </Button>
            <Button
              onPress={() => onDelete(song.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              삭제
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
      <Table
        aria-label="신청곡 목록"
        isStriped
        isHeaderSticky
        className="max-h-[600px]"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} allowsSorting>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={songs}>
          {(song) => (
            <TableRow key={song.id}>
              {(columnKey) => (
                <TableCell>{renderCell(song, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
