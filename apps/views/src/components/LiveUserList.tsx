import { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Checkbox,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  addToast,
  Input,
} from '@heroui/react';
import { ArrowPathIcon } from '@heroicons/react/16/solid';

type User = {
  id: number;
  nickname: string;
  tag: string;
  profile_url: string;
};

type LiveUserListProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedUsers: User[]) => void;
};

export default function LiveUserList({
  isOpen,
  onClose,
  onConfirm,
}: LiveUserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('stp://request-song.sopia.dev/users/list');
      const data = await response.json();
      if (data.success) {
        console.log('data', data.data);
        setUsers(data.data);
      } else {
        addToast({
          description: data.message,
          color: 'danger',
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  // 더미 데이터 로드
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleRefresh = () => {
    // 목록 새로고침 핸들러
    fetchUsers();
  };

  const handleUserSelect = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedUsers);
    onClose();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers([...users]);
    } else {
      setSelectedUsers([]);
    }
  };

  const isAllSelected =
    users.length > 0 && selectedUsers.length === users.length;

  const filteredUsers = users.filter(
    (user) =>
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">
                현재 참여자 목록 {users.length}명
              </h2>
              <div className="flex items-center gap-2 ms-2">
                <Button
                  isIconOnly
                  size="sm"
                  onPress={handleRefresh}
                  variant="light"
                  isDisabled={isRefreshing}
                >
                  <ArrowPathIcon
                    className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mr-5">
              <Checkbox
                isSelected={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                size="sm"
              >
                전체 선택
              </Checkbox>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <Input
              placeholder="닉네임 또는 태그로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </ModalHeader>

        <ModalBody>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg"
            >
              <img
                src={user.profile_url}
                alt={user.nickname}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {user.nickname} ({user.tag})
                </p>
              </div>
              <Checkbox
                isSelected={selectedUsers.some((u) => u.id === user.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleUserSelect(user);
                }}
              />
            </div>
          ))}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onPress={onClose}>
            취소
          </Button>
          <Button variant="flat" color="success" onPress={handleConfirm}>
            확인
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
