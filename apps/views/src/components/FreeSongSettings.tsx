import { useState, memo } from 'react';
import { Card, Switch, Input, Button, addToast } from '@heroui/react';
import { DonationSettings } from '../types';

interface FreeSongSettingsProps {
  settings: DonationSettings;
  onSettingsChange: (settings: DonationSettings) => void;
}

const areSettingsEqual = (
  prevProps: FreeSongSettingsProps,
  nextProps: FreeSongSettingsProps,
) => {
  return (
    JSON.stringify(prevProps.settings) === JSON.stringify(nextProps.settings)
  );
};

export const FreeSongSettings = memo(
  ({ settings, onSettingsChange }: FreeSongSettingsProps) => {
    const [freeEnabled, setFreeEnabled] = useState(
      settings.freeEnabled ?? false,
    );
    const [limitCountEnabled, setLimitCountEnabled] = useState(
      settings.limitCountEnabled ?? false,
    );
    const [limitTimeEnabled, setLimitTimeEnabled] = useState(
      settings.limitTimeEnabled ?? false,
    );

    const handleFreeEnabledChange = (enabled: boolean) => {
      setFreeEnabled(enabled);
      onSettingsChange({
        ...settings,
        freeEnabled: enabled,
        limitCountEnabled: enabled ? limitCountEnabled : false,
        limitTimeEnabled: enabled ? limitTimeEnabled : false,
      });
    };

    const handleLimitCountEnabledChange = (enabled: boolean) => {
      setLimitCountEnabled(enabled);
      onSettingsChange({
        ...settings,
        limitCountEnabled: enabled,
      });
    };

    const handleLimitTimeEnabledChange = (enabled: boolean) => {
      setLimitTimeEnabled(enabled);
      onSettingsChange({
        ...settings,
        limitTimeEnabled: enabled,
      });
    };

    const handleLimitReset = () => {
      fetch(`stp://request-song.sopia.dev/songs/limit-reset`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            addToast({
              description: data.message,
              variant: 'solid',
              color: 'success',
            });
          }
        });
    };

    return (
      <>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">무료 신청곡 허용</h3>
            <Switch
              isSelected={freeEnabled}
              onValueChange={handleFreeEnabledChange}
            />
          </div>

          <div className="space-y-6 pl-4 border-l-2 border-gray-200">
            {/* 신청곡 횟수 제한 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold">신청곡 횟수 제한</h4>
                <Switch
                  isSelected={limitCountEnabled}
                  onValueChange={handleLimitCountEnabledChange}
                  isDisabled={!freeEnabled}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={String(settings.limitCount ?? 0)}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      limitCount: Number(e.target.value),
                    })
                  }
                  aria-label="신청곡 횟수 제한"
                  isDisabled={!freeEnabled || !limitCountEnabled}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">회</span>
              </div>
            </div>

            {/* 신청곡 제한 시간 설정 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold">신청곡 제한 시간 설정</h4>
                <Switch
                  isSelected={limitTimeEnabled}
                  onValueChange={handleLimitTimeEnabledChange}
                  isDisabled={!freeEnabled}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={String(settings.limitTime ?? 0)}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      limitTime: Number(e.target.value),
                    })
                  }
                  isDisabled={!freeEnabled || !limitTimeEnabled}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">초</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base">
                  현재 방송에 걸린 신청곡 제한을 초기화합니다.
                </h4>
                <Button
                  size="sm"
                  color="danger"
                  onPress={handleLimitReset}
                  isDisabled={
                    (!limitCountEnabled && !limitTimeEnabled) || !freeEnabled
                  }
                >
                  초기화
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </>
    );
  },
  areSettingsEqual,
);
