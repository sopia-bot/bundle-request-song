import { useState } from 'react';
import { Card, Switch, Input, Select, SelectItem } from '@heroui/react';
import { StickerDialogBtn } from './sticker-dialog';
import { DonationType, DonationSettings } from '../types';

interface PaidSongSettingsProps {
  settings: DonationSettings;
  onSettingsChange: (settings: DonationSettings) => void;
}

const donationTypes = [
  { key: 'SPECIFIC_STICKER', label: '특정 스티커 후원' },
  { key: 'MINIMUM_STICKER', label: '일정 수치 이상의 스티커 후원' },
];

export const PaidSongSettings = ({
  settings,
  onSettingsChange,
}: PaidSongSettingsProps) => {
  const [paidEnabled, setPaidEnabled] = useState(settings.paidEnabled ?? false);
  const [donationType, setDonationType] = useState<DonationType>(
    settings.donationType ?? 'SPECIFIC_STICKER',
  );
  const [minimumAmount, setMinimumAmount] = useState(
    settings.minimumAmount ?? 0,
  );
  const [distributionEnabled, setDistributionEnabled] = useState(
    settings.distributionEnabled ?? false,
  );

  const handlePaidEnabledChange = (enabled: boolean) => {
    setPaidEnabled(enabled);
    onSettingsChange({
      ...settings,
      paidEnabled: enabled,
      donationType: enabled ? donationType : undefined,
      minimumAmount: enabled ? minimumAmount : undefined,
      distributionEnabled: enabled ? distributionEnabled : false,
    });
  };

  const handleDonationTypeChange = (type: DonationType) => {
    setDonationType(type);
    onSettingsChange({
      ...settings,
      donationType: type,
      minimumAmount: type === 'MINIMUM_STICKER' ? minimumAmount : undefined,
    });
  };

  const handleMinimumAmountChange = (value: number) => {
    setMinimumAmount(value);
    onSettingsChange({
      ...settings,
      minimumAmount: value,
    });
  };

  const handleDistributionEnabledChange = (enabled: boolean) => {
    setDistributionEnabled(enabled);
    onSettingsChange({
      ...settings,
      distributionEnabled: enabled,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">유료 신청곡 허용</h3>
        <Switch
          isSelected={paidEnabled}
          onValueChange={handlePaidEnabledChange}
          aria-label="유료 신청곡 허용"
        />
      </div>

      <div className="space-y-4 pl-4 border-l-2 border-gray-200">
        {/* 후원 타입 선택 */}
        <div className="space-y-2 flex items-center justify-between">
          <h4 className="text-base font-medium">후원 타입 선택</h4>
          <Select
            selectedKeys={[donationType]}
            onChange={(e) =>
              handleDonationTypeChange(e.target.value as DonationType)
            }
            isDisabled={!paidEnabled}
            className="w-[300px]"
            aria-label="후원 타입 선택"
          >
            {donationTypes.map((type) => (
              <SelectItem key={type.key}>{type.label}</SelectItem>
            ))}
          </Select>
        </div>

        {/* 후원 조건 */}
        {donationType === 'SPECIFIC_STICKER' ? (
          <div className="flex items-center justify-end">
            <div className="block">
              <StickerDialogBtn
                onChange={(sticker) => {
                  onSettingsChange({
                    ...settings,
                    sticker,
                  });
                }}
                disabled={!paidEnabled}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={String(minimumAmount)}
                onChange={(e) =>
                  handleMinimumAmountChange(Number(e.target.value))
                }
                isDisabled={!paidEnabled}
                className="w-24"
                aria-label="최소 후원 수치"
              />
              <span className="text-sm text-gray-500">최소 후원 수치</span>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                분배 사용 (최소 후원 수치 이상 후원시, [후원 수치 / 최소 후원
                수치] 만큼 신청 가능)
              </h4>
              <Switch
                isSelected={distributionEnabled}
                onValueChange={handleDistributionEnabledChange}
                isDisabled={!paidEnabled}
                aria-label="분배 사용"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
