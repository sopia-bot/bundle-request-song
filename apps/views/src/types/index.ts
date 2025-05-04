import { Sticker } from '@sopia-bot/core';
import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type DonationType = 'SPECIFIC_STICKER' | 'MINIMUM_STICKER';

export type DonationSettings = {
  // 무료 신청곡 설정
  freeEnabled?: boolean;
  limitCountEnabled?: boolean;
  limitCount?: number;
  limitTimeEnabled?: boolean;
  limitTime?: number;

  // 유료 신청곡 설정
  paidEnabled?: boolean;
  donationType?: DonationType;
  sticker?: Sticker;
  minimumAmount?: number;
  distributionEnabled?: boolean;
};

export type Song = {
  id: string;
  addedAt: string;
  artist: string;
  title: string;
  requester: string;
  thumbnail: string;
  playTime: number;
  isPlayed: boolean;
};

export type CurrentSong = Song | null;
