import { Song } from '../types';

const API_BASE_URL = 'stp://request-song.sopia.dev';

interface CheckAvailabilityRequest {
  liveId: number;
  authorId: number;
  nickname: string;
}

interface CheckAvailabilityResponse {
  allowed: boolean;
  reason?: string;
}

interface CreateSongRequest {
  artist: string;
  title: string;
  requester: string;
  thumbnail: string;
  playTime: number;
  liveId: number;
  authorId: number;
  nickname: string;
}

export const checkAvailability = async (
  data: CheckAvailabilityRequest,
): Promise<CheckAvailabilityResponse> => {
  const response = await fetch(`${API_BASE_URL}/songs/available`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const fetchSongs = async (): Promise<Song[]> => {
  const response = await fetch(`${API_BASE_URL}/songs`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export const createSong = async (song: CreateSongRequest): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(song),
  });
  return response.json();
};

export const updateSong = async (
  id: string,
  song: Partial<Song>,
): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/songs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(song),
  });
  return response.json();
};

export const deleteSong = async (id: string = ''): Promise<void> => {
  await fetch(`${API_BASE_URL}/songs/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteAllSongs = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}/songs/all`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
