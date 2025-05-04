import {
  LiveMessageSocket,
  LivePresentSocket,
  LiveSocket,
} from '@sopia-bot/core';
const { ipcRenderer } = window.require('electron');

export interface Setting {
  id: string;
  allowFree: boolean;
  limitByCount: boolean;
  maxRequestCount: number | null;
  limitByTime: boolean;
  requestTimeLimit: number | null;
  allowPaid: boolean;
  paidType: 'sticker' | 'amount' | null;
  stickerId: string | null;
  minAmount: number | null;
  allowDistribution: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

let setting: Setting;
function reload() {
  fetch(`stp://request-song.sopia.dev/settings`)
    .then((res) => res.json())
    .then((data) => {
      setting = data;
    });
}

function backgroundListener(event: any, msg: string, data: any) {
  if (msg === 'reload') {
    reload();
  } else if (msg === 'insert-paid') {
    const list = paidMap.get(data.authorId) || [];
    list.push(data);
    paidMap.set(data.authorId, list);
  }
}
reload();

const DOMAIN = 'request-song.sopia.dev';
ipcRenderer.on(`${DOMAIN}/renderer`, backgroundListener);
function onAbort() {
  ipcRenderer.off(`${DOMAIN}/renderer`, backgroundListener);
}

type PaidInfo = {
  liveId: number;
  authorId: number;
  nickname: string;
  sticker: string;
  amount: number;
  combo: number;
};
const paidMap = new Map<number, PaidInfo[]>();

async function liveMesasge(evt: LiveMessageSocket, socket: LiveSocket) {
  if ((window as any).$sopia.logonUser.id === evt.data.user.id) {
    return;
  }

  const message = evt.update_component.message.value;

  if (message.startsWith('신청곡 취소')) {
    const res = await fetch(`stp://request-song.sopia.dev/songs/latest`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorId: evt.data.user.id,
      }),
    });
    const data = await res.json();
    if (data.success) {
      socket.message(`${evt.data.user.nickname}님의 ${data.message}`);
      if (data.isPaid) {
        const list = paidMap.get(evt.data.user.id) || [];
        list.push({
          liveId: evt.data.live.id,
          authorId: evt.data.user.id,
          nickname: evt.data.user.nickname,
          sticker: '__sopia_insert_paid',
          amount: 0,
          combo: 0,
        });
        paidMap.set(evt.data.user.id, list);
        socket.message(
          `${evt.data.user.nickname}님의 유료 신청권을 돌려드렸습니다.`
        );
      }
    } else {
      socket.message(
        `${evt.data.user.nickname}님의 신청곡 취소가 실패했습니다.\\n${data.message}`
      );
    }
    return;
  }

  if (message.trim() === '신청곡') {
    // 목록 5개만 보여주기
    const res = await fetch(`stp://request-song.sopia.dev/songs`, {
      method: 'GET',
    });
    const data = await res.json();
    socket.message(
      `🎶 신청곡 대기 목록\\n\\n` +
        data
          .filter((song: any) => song.isPlayed === false)
          .slice(0, 5)
          .map(
            (song: any, index: number) =>
              `${index + 1}. ${song.title} - ${song.artist}`
          )
          .join('\\n')
    );
    return;
  }

  if (message.startsWith('신청곡 ')) {
    const userNickname = evt.data.user.nickname;

    const list = paidMap.get(evt.data.user.id) || [];
    let isPaid = false;
    if (list.length > 0) {
      isPaid = true;
      console.log('삭제 전 리스트', list);
      list.shift();
      console.log('삭제 후 리스트', list);
    }

    if (!isPaid) {
      if (!setting.allowFree) {
        let msg = `${userNickname}님은 현재 신청할 수 없습니다.`;
        if (setting.allowPaid) {
          msg += `\\n유료 신청만 가능합니다.`;
        }
        socket.message(msg);
        return;
      }
      const res = await fetch(`stp://request-song.sopia.dev/songs/available`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liveId: evt.live_id,
          authorId: evt.data.user.id,
        }),
      }).then((res) => res.json());
      if (!res.allowed) {
        socket.message(
          `${userNickname}님은 현재 신청할 수 없습니다.\\n${res.reason}`
        );
        return;
      }
    }

    const song = message.replace('신청곡 ', '');
    const res = await fetch(`stp://request-song.sopia.dev/music/${song}`);
    const data = await res.json();
    if (data) {
      const newSong = await fetch(`stp://request-song.sopia.dev/songs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist: data.artist,
          title: data.name,
          thumbnail: data.thumbnail,
          playTime: data.playTime,
          requester: userNickname,
          liveId: evt.live_id,
          authorId: evt.data.user.id,
          nickname: userNickname,
          isPaid,
        }),
      }).then((res) => res.json());
      socket.message(
        `${userNickname}님이 신청하신 [${data.name} - ${data.artist}] 곡이 추가되었습니다.\\n\\n` +
          `취소하시려면 "신청곡 취소"를 입력해주세요.`
      );
    }
  }
}

function livePresent(evt: LivePresentSocket, sock: LiveSocket) {
  const { author: user, sticker, amount, combo } = evt.data;

  let isPaid = false;
  let insertCount = 1;
  if (setting.allowPaid) {
    if (setting.paidType === 'sticker') {
      if (sticker === setting.stickerId) {
        isPaid = true;
      }
    }
    if (setting.paidType === 'amount') {
      const total = amount * combo;
      if (total >= (setting.minAmount ?? 0)) {
        isPaid = true;
        if (setting.allowDistribution) {
          if (setting.minAmount && setting.minAmount > 0) {
            insertCount = Math.floor(total / setting.minAmount);
          }
        }
      }
    }
  }

  if (isPaid) {
    const list = paidMap.get(user.id) || [];
    for (let i = 0; i < insertCount; i++) {
      list.push({
        liveId: evt.data.live.id,
        authorId: user.id,
        nickname: user.nickname,
        sticker,
        amount,
        combo,
      });
    }
    paidMap.set(user.id, list);
    if (insertCount >= 1) {
      sock.message(
        `${user.nickname}님. 원하는 곡을 ${insertCount}개 신청할 수 있습니다.\\n"신청곡 [곡 제목 - 아티스트]"를 입력해 추가해 주세요.`
      );
    }
  }
}

export default {
  live_message: liveMesasge,
  live_present: livePresent,
  onAbort,
};
