import { useState } from 'react';
import { Card, Select, SelectItem, NumberInput } from '@heroui/react';
import {
  DonationType,
  DonationSettings as DonationSettingsType,
} from '../types';
import { StickerDialogBtn } from './sticker-dialog';

interface DonationSettingsProps {
  settings: DonationSettingsType;
  onSettingsChange: (settings: DonationSettingsType) => void;
}

const donationTypes = [
  { key: 'SPECIFIC_STICKER', label: '특정 스티커 후원' },
  { key: 'MINIMUM_STICKER', label: '일정 수치 이상의 스티커 후원' },
];

export const DonationSettings = ({
  settings,
  onSettingsChange,
}: DonationSettingsProps) => {
  const [selectedType, setSelectedType] = useState<DonationType>(settings.type);
  const [minimumAmount, setMinimumAmount] = useState<number>(
    settings.minimumAmount || 0,
  );

  const handleTypeChange = (type: DonationType) => {
    setSelectedType(type);
    onSettingsChange({
      type,
      minimumAmount: type === 'MINIMUM_STICKER' ? minimumAmount : undefined,
    });
  };

  const handleMinimumAmountChange = (value: number) => {
    setMinimumAmount(value);
    onSettingsChange({
      type: selectedType,
      minimumAmount: value,
    });
  };

  return (
    <Card className="p-4 mb-4">
      <h2 className="text-xl font-bold mb-4">후원 조건 설정</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">후원 타입</label>
        <Select
          value={selectedType}
          items={donationTypes}
          label="후원 타입"
          onChange={(e) => handleTypeChange(e.target.value as DonationType)}
          className="w-full"
        >
          {donationTypes.map((type) => (
            <SelectItem key={type.key}>{type.label}</SelectItem>
          ))}
        </Select>
      </div>

      {selectedType === 'SPECIFIC_STICKER' ? (
        <div>
          <StickerDialogBtn
            onChange={(sticker) => {
              onSettingsChange({
                type: selectedType,
                sticker,
              });
            }}
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">
            최소 후원 수치
          </label>
          <NumberInput
            value={minimumAmount}
            onChange={(e) => handleMinimumAmountChange(Number(e))}
            min={0}
            className="w-full"
          />
        </div>
      )}
    </Card>
  );
};
