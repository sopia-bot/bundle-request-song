import { memo } from 'react';
import { DonationSettings as DonationSettingsType } from '../types';
import { FreeSongSettings } from './FreeSongSettings';
import { PaidSongSettings } from './PaidSongSettings';

interface DonationSettingsProps {
  settings: DonationSettingsType;
  onSettingsChange: (settings: DonationSettingsType) => void;
}

const areSettingsEqual = (
  prevProps: DonationSettingsProps,
  nextProps: DonationSettingsProps,
) => {
  return (
    JSON.stringify(prevProps.settings) === JSON.stringify(nextProps.settings)
  );
};

export const DonationSettings = memo(
  ({ settings, onSettingsChange }: DonationSettingsProps) => {
    return (
      <div className="space-y-4">
        <FreeSongSettings
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
        <PaidSongSettings
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </div>
    );
  },
  areSettingsEqual,
);
