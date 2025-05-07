import {
  LiveMessageSocket,
  LivePresentSocket,
  LiveSocket,
  SpoonClient,
  User,
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

declare global {
  interface Window {
    $sopia: SpoonClient;
  }
}

async function getAllListeners(liveId: number): Promise<User[]> {
  let members: User[] = [];
  const liveInfo = await window.$sopia.api.lives.info(liveId);
  const authorInfo = liveInfo.res.results[0].author as User;
  members.push(authorInfo);
  let req = await window.$sopia.api.lives.listeners(liveId);
  let res = req.res;
  members = members.concat(req.res.results);
  while (res.next) {
    res = await req.next();
    members = members.concat(res.results);
  }
  return members;
}

let setting: Setting;
function reload() {
  fetch(`stp://request-song.sopia.dev/settings`)
    .then((res) => res.json())
    .then((data) => {
      setting = data;
    })
    .catch((err) => {
      console.error(err);
      setTimeout(reload, 1000);
    });
}

async function backgroundListener(event: any, msg: string, data: any) {
  console.log('backgroundListener', event, msg, data);
  if (msg === 'reload') {
    reload();
  } else if (msg === 'insert-paid') {
    const res = await fetch(`stp://request-song.sopia.dev/users/ticket`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liveId: 0,
        authorId: data.user.id,
        nickname: data.user.nickname,
        sticker: '__sopia_insert_paid',
        amount: 0,
        combo: 0,
      }),
    });
    const result = await res.json();
    if (result.success && data.sendMsgFlag) {
      window.$sopia.liveMap
        .values()
        .next()
        .value?.socket.message(
          `${data.user.nickname}님. 곡 유료 신청권을 지급받았습니다.`
        );
    }
  } else if (msg === 'user-list') {
    const { value: liveInfo } = window.$sopia.liveMap.values().next();
    if (liveInfo) {
      const userList = await getAllListeners(liveInfo.id);
      await fetch(`stp://request-song.sopia.dev/resolve-handshake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: data,
          data: {
            success: true,
            users: userList.map((user) => ({
              id: user.id,
              nickname: user.nickname,
              tag: user.tag,
              profile_url: user.profile_url,
            })),
          },
        }),
      });
    } else {
      await fetch(`stp://request-song.sopia.dev/resolve-handshake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: data,
          data: { success: false, message: '방송에 연결되지 않았습니다.' },
        }),
      });
    }
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
        const ticketRes = await fetch(
          `stp://request-song.sopia.dev/users/ticket`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              liveId: evt.live_id,
              authorId: evt.data.user.id,
              nickname: evt.data.user.nickname,
              sticker: '__sopia_insert_paid',
              amount: 0,
              combo: 0,
            }),
          }
        );
        const ticketData = await ticketRes.json();
        if (ticketData.success) {
          socket.message(
            `${evt.data.user.nickname}님의 유료 신청권을 돌려드렸습니다.`
          );
        }
      }
    } else {
      socket.message(
        `${evt.data.user.nickname}님의 신청곡 취소가 실패했습니다.\\n${data.message}`
      );
    }
    return;
  }

  if (evt.data.user.tag === 'raravel') {
    if (message.trim() === '신청곡 설정') {
      socket.message(
        `${evt.data.live.author.nickname}님의 신청곡 설정\\n` +
          `무료 신청곡 허용: ${setting.allowFree ? '허용' : '비허용'}\\n` +
          `├ 횟수 제한: ${setting.limitByCount ? '허용' : '비허용'}\\n` +
          `├ 횟수 제한 값: ${setting.maxRequestCount ?? '설정 안됨'}\\n` +
          `├ 시간 제한: ${setting.limitByTime ? '허용' : '비허용'}\\n` +
          `└ 시간 제한 값: ${setting.requestTimeLimit ?? '설정 안됨'}`
      );
      socket.message(
        `유료 신청곡 허용: ${setting.allowPaid ? '허용' : '비허용'}\\n` +
          `├ 타입: ${setting.paidType === 'sticker' ? '스티커' : '금액'}\\n` +
          `├ 스티커: ${setting.stickerId ?? '설정 안됨'}\\n` +
          `├ 최소 금액: ${setting.minAmount ?? '설정 안됨'}\\n` +
          `└ 분배 허용: ${setting.allowDistribution ? '허용' : '비허용'}`
      );
      return;
    }
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

  if (message.trim() === '현재곡') {
    const res = await fetch(`stp://request-song.sopia.dev/songs/current`, {
      method: 'GET',
    }).then((res) => res.json());
    const data = res.data;
    socket.message(
      `신청자: ${data.requester}\\n` +
        `현재 재생중인 곡: ${data.title} - ${data.artist}`
    );
    return;
  }

  if (message.startsWith('신청곡 ')) {
    const userNickname = evt.data.user.nickname;

    // 티켓 확인
    const ticketRes = await fetch(
      `stp://request-song.sopia.dev/users/ticket?authorId=${evt.data.user.id}`
    );
    const ticketData = await ticketRes.json();
    const userTickets = ticketData.data;
    let isPaid = userTickets.length > 0;
    let ticketId = isPaid ? userTickets[0].id : null;

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

      // 티켓 사용 처리
      if (isPaid && ticketId) {
        await fetch(`stp://request-song.sopia.dev/users/ticket/${ticketId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authorId: evt.data.user.id,
          }),
        });
      }

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
    for (let i = 0; i < insertCount; i++) {
      fetch(`stp://request-song.sopia.dev/users/ticket`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liveId: evt.data.live.id,
          authorId: user.id,
          nickname: user.nickname,
          sticker,
          amount,
          combo,
        }),
      });
    }
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
