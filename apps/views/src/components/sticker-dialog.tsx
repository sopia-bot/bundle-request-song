import {
  Button,
  Modal,
  ModalFooter,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
  ModalBody,
  Card,
  CardBody,
} from '@heroui/react';
import { Sticker, StickerCategory } from '@sopia-bot/core';
import { Key, useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { create } from 'zustand';
import styled from '@emotion/styled';

interface StickerState {
  stickerList: StickerCategory[];
  allStickerList: StickerCategory[];
  isInit: boolean;
  setStickerList: (n: StickerCategory[]) => void;
}

export const useStickerStore = create<StickerState>((set) => ({
  stickerList: [],
  allStickerList: [],
  isInit: false,
  setStickerList: (newStickerList: StickerCategory[]) => {
    const usedStickers = newStickerList
      .filter((category: StickerCategory) => category.is_used)
      .map((cateogory: StickerCategory) => {
        return {
          ...cateogory,
          ...{
            stickers: cateogory.stickers.filter(
              (sticker: Sticker) => sticker.is_used,
            ),
          },
        };
      })
      .filter((category: StickerCategory) => category.stickers.length > 0);
    return set({
      stickerList: usedStickers,
      allStickerList: newStickerList,
      isInit: true,
    });
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, ...other } = props;

  return (
    <Card role="tabpanel" {...other} className="w-full">
      <CardBody className="p-3">{children}</CardBody>
    </Card>
  );
}

type StickerDivProps = {
  sticker: Sticker;
  checked?: boolean;
  onChange?: (value: boolean) => void;
};

function StickerDiv(props: StickerDivProps) {
  const handleOnClick = () => {
    if (typeof props.onChange === 'function') {
      props.onChange(!props.checked);
    }
  };

  console.log('checked', props.checked, props.sticker.name);

  return (
    <div
      className="relative w-full h-[130px] cursor-pointer"
      onClick={handleOnClick}
    >
      <div className="absolute w-full h-[130px] flex items-center justify-center">
        <div className="p-4">
          <img
            src={props.sticker.image_url_web}
            className="w-full"
            alt="sticker"
          />
        </div>
      </div>
      <div
        className={`absolute inset-0 border-4 border-yellow-400 bg-black/40 flex items-end justify-center ${
          props.checked ? 'flex' : 'hidden'
        }`}
      >
        <CheckCircleIcon className="w-6 h-6 text-yellow-400 absolute top-1 left-1" />
        <span className="z-10 mb-4 text-white font-bold [text-shadow:_-2px_0_black,_0_2px_black,_2px_0_black,_0_-2px_black]">
          {props.sticker.price}
        </span>
      </div>
    </div>
  );
}

type StickerDialogProp = {
  open: boolean;
  sticker?: Sticker | null;
  onChange(v: Sticker): void;
  onClose?: () => void;
};

export function StickerDialog(props: StickerDialogProp) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { stickerList, isInit, setStickerList } = useStickerStore(
    (state) => state,
  );
  const [isOpen, setIsOpen] = useState(props.open);
  const [tabKey, setTabKey] = useState<Key | null>(null);
  const [selectedStickerKey, setSelectedStickerKey] = useState<string | null>(
    null,
  );
  const [sticker, setSticker] = useState<Sticker | null>(props.sticker || null);

  useEffect(() => {
    if (!isInit) {
      fetch('https://static.spooncast.net/kr/stickers/index.json')
        .then((res) => res.json())
        .then((data) => {
          const usedStickers: StickerCategory[] = data.categories
            .filter((category: StickerCategory) => category.is_used)
            .map((cateogory: StickerCategory) => {
              return {
                ...cateogory,
                ...{
                  stickers: cateogory.stickers.filter(
                    (sticker: Sticker) => sticker.is_used,
                  ),
                },
              };
            });
          setTabKey('tab-' + usedStickers[0].name);
          setStickerList(usedStickers);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    setIsOpen(props.open);
  }, []);

  useEffect(() => {
    if (stickerList.length > 0) {
      setTabKey('tab-' + stickerList[0].name);
    }
  }, [stickerList]);

  useEffect(() => {
    setIsOpen(props.open);
  }, [props.open]);

  useEffect(() => {
    console.log('chKey', selectedStickerKey);
  }, [selectedStickerKey]);

  const handleChange = (key: Key) => {
    setTabKey(key);
  };

  const handleStickerSelect = (
    category: StickerCategory,
    sticker: Sticker,
    val: boolean,
  ) => {
    const newKey = val ? `${category.name}${sticker.name}` : null;
    setSelectedStickerKey(newKey);
    setSticker(val ? sticker : null);
  };

  const handleSelect = () => {
    handleClose();
    if (typeof props.onChange === 'function') {
      if (sticker) {
        props.onChange(sticker);
      }
    }
  };

  function handleClose() {
    setIsOpen(false);
    if (typeof props.onClose === 'function') {
      props.onClose();
    }
  }

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Modal isOpen={isOpen} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="text-xl font-bold">스푼 선택</ModalHeader>
        <ModalBody>
          <Tabs
            items={stickerList}
            selectedKey={tabKey as Key}
            onSelectionChange={handleChange}
          >
            {stickerList.map((category) => (
              <Tab
                key={'tab-' + category.name}
                title={category.title.replace(/[\b]/g, '')}
              >
                <CustomTabPanel>
                  <div className="grid grid-cols-6 gap-3">
                    {category.stickers.map((sticker) => (
                      <StickerDiv
                        key={`${category.name}${sticker.name}`}
                        checked={
                          selectedStickerKey ===
                          `${category.name}${sticker.name}`
                        }
                        sticker={sticker}
                        onChange={(val) =>
                          handleStickerSelect(category, sticker, val)
                        }
                      />
                    ))}
                  </div>
                </CustomTabPanel>
              </Tab>
            ))}
          </Tabs>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-2 p-4">
          <Button
            onPress={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            취소
          </Button>
          <Button
            onPress={handleSelect}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            선택 확인
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

type StickerDialogBtnProps = {
  sticker?: string;
  onChange: (v: Sticker) => void;
};

export function findSticker(
  stickerList: StickerCategory[],
  stickerName: string,
): Sticker | null {
  for (let i = 0; i < stickerList.length; i++) {
    const category = stickerList[i];
    let idx = category.stickers.findIndex(
      (sticker) => stickerName === sticker.name,
    );
    if (idx !== -1) {
      return category.stickers[idx];
    }
  }
  return null;
}

export function StickerDialogBtn(props: StickerDialogBtnProps) {
  const [opened, setOpened] = useState(false);
  const { stickerList, isInit, setStickerList } = useStickerStore(
    (state) => state,
  );
  const [sticker, setSticker] = useState<Sticker | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      if (isInit) {
        setLoading(false);
        if (props.sticker) {
          setSticker(findSticker(stickerList, props.sticker));
        }
      } else {
        fetch('https://static.spooncast.net/kr/stickers/index.json')
          .then((res) => res.json())
          .then((data) => {
            setStickerList(data.categories);
            if (props.sticker) {
              setSticker(findSticker(data.categories, props.sticker));
            }
            setLoading(false);
          });
      }
    }
  }, []);

  useEffect(() => {
    if (props.sticker) {
      setSticker(findSticker(stickerList, props.sticker));
    }
  }, [props.sticker]);

  const handleOnClick = () => {
    setOpened(true);
  };

  const handleOnChange = (newSticker: Sticker) => {
    if (newSticker) {
      setSticker(newSticker);
      if (typeof props.onChange === 'function') {
        props.onChange(newSticker);
      }
    }
  };
  const handleOnClose = () => {
    setOpened(false);
  };

  const StickerButton = styled.div`
    cursor: pointer;
    max-width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;

    &:hover {
      background-color: #dfdfdf;
    }
  `;

  if (loading) {
    return <div></div>;
  }

  return (
    <StickerButton
      style={{
        cursor: 'pointer',
        minWidth: '200px',
        borderRadius: '3px',
        border: '1px solid rgba(0 0 0 / 0.23)',
      }}
      onClick={handleOnClick}
    >
      <StickerDialog
        open={opened}
        sticker={sticker}
        onChange={handleOnChange}
        onClose={handleOnClose}
      ></StickerDialog>
      <div>
        {sticker ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              style={{
                height: '40px',
                marginRight: '5px',
              }}
              src={sticker.image_url_web}
            />
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              {sticker.price}
            </span>
          </div>
        ) : (
          <div
            style={{ height: '40px', display: 'flex', alignItems: 'center' }}
          >
            스푼을 선택해 주세요.
          </div>
        )}
      </div>
    </StickerButton>
  );
}
