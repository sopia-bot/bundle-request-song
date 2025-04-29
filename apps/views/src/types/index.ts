import { Sticker } from '@sopia-bot/core';
import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type DonationType = 'SPECIFIC_STICKER' | 'MINIMUM_STICKER';

export type DonationSettings = {
  type: DonationType;
  sticker?: Sticker;
  minimumAmount?: number;
};

export type Song = {
  id: string;
  addedAt: string;
  artist: string;
  title: string;
  requester: string;
};

export type CurrentSong = Song | null;
