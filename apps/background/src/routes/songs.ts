import { Router, Request, Response } from 'express';
import { usePrisma } from '../lib/prisma';
import { Song } from '../types/music';
const router = Router();

router.post('/available', async (req, res) => {
  try {
    const { liveId, authorId } = req.body;
    const prisma = usePrisma();
    const settings = await prisma.setting.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      res.json({
        allowed: false,
        reason: '설정이 초기화되지 않았습니다',
      });
      return;
    }

    // 신청 횟수 제한 검사
    if (settings.limitByCount) {
      const requestCount = await prisma.requestHistory.count({
        where: {
          liveId,
          authorId,
        },
      });

      if (requestCount >= (settings.maxRequestCount ?? 0)) {
        res.json({
          allowed: false,
          reason: '신청 횟수 제한에 도달했습니다',
        });
        return;
      }
    }

    // 신청 시간 제한 검사
    if (settings.limitByTime) {
      const lastRequest = await prisma.requestHistory.findFirst({
        where: {
          liveId,
          authorId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (lastRequest) {
        const timeDiff = Math.floor(
          (Date.now() - lastRequest.createdAt.getTime()) / 1000
        );

        if (timeDiff < (settings.requestTimeLimit ?? 0)) {
          res.json({
            allowed: false,
            reason: `신청 제한시간에 걸렸습니다. 남은 시간: ${
              (settings.requestTimeLimit ?? 0) - timeDiff
            }초`,
          });
          return;
        }
      }
    }

    res.json({ allowed: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 현재 재생중인 곡 조회
router.get('/current', async (req, res) => {
  try {
    const prisma = usePrisma();
    const currentSong = await prisma.song.findFirst({
      where: {
        isPlayed: true,
      },
      orderBy: {
        playedAt: 'desc',
      },
    });
    res.json({
      success: true,
      data: currentSong,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: (error as Error).message });
  }
});

// 모든 신청곡 조회
router.get('/', async (req, res) => {
  try {
    const prisma = usePrisma();
    const songs = await prisma.song.findMany();
    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 신청곡 추가
router.post('/', async (req, res) => {
  try {
    const {
      artist,
      title,
      thumbnail,
      playTime,
      requester,
      liveId,
      authorId,
      nickname,
      isPaid,
    } = req.body;

    const prisma = usePrisma();

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 마지막 신청곡 아이디 가져오기
      const lastSong = await tx.song.findFirst({
        orderBy: {
          id: 'desc',
        },
      });
      const id = (lastSong?.id ?? 0) + 1;

      // 신청곡 추가
      const song = await tx.song.create({
        data: {
          id,
          artist,
          title,
          thumbnail,
          requester,
          requesterId: authorId,
          playTime,
          isPaid,
        },
      });

      // 히스토리 기록
      const historyData = {
        liveId,
        nickname,
        authorId,
        songName: title,
        artist,
        thumbnail,
        playTime,
      };

      await tx.requestHistory.create({
        data: historyData,
      });

      await tx.requestHistoryBackup.create({
        data: historyData,
      });

      return song;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 신청곡 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { artist, title, requester, isPlayed } = req.body;
    const prisma = usePrisma();
    const song = await prisma.song.update({
      where: { id: parseInt(id) },
      data: {
        artist,
        title,
        requester,
        isPlayed,
        playedAt: isPlayed ? new Date() : null,
      },
    });
    res.json(song);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 전체 신청곡 삭제
router.delete('/all', async (req, res) => {
  try {
    const prisma = usePrisma();
    await prisma.song.deleteMany();
    res.json({ message: 'All songs deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/limit-reset', async (req, res) => {
  try {
    const prisma = usePrisma();
    await prisma.requestHistory.deleteMany();
    res.json({ success: true, message: '신청곡 제한 초기화 완료' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 마지막에 신청한 곡 1개 삭제
router.delete('/latest', async (req, res) => {
  try {
    const { authorId, liveId } = req.body;
    const prisma = usePrisma();

    const song = await prisma.$transaction(async (tx) => {
      // 최신 정렬해서 1개 가져오기
      const song = await tx.song.findFirst({
        orderBy: {
          addedAt: 'desc',
        },
        where: {
          requesterId: authorId,
          isPlayed: false,
        },
      });
      if (!song) {
        return { success: false, message: '신청곡을 찾을 수 없습니다.' };
      }
      await tx.song.delete({
        where: {
          id: song.id,
        },
      });

      await tx.requestHistory.deleteMany({
        where: {
          liveId: liveId,
          authorId: authorId,
          songName: song.title,
          artist: song.artist,
        },
      });

      return {
        success: true,
        message: `[${song.title} - ${song.artist}] 신청곡을 취소했습니다.`,
        isPaid: song.isPaid,
      };
    });

    res.json(song);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ID 로 신청곡 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = usePrisma();

    const song = await prisma.$transaction(async (tx) => {
      // 최신 정렬해서 1개 가져오기
      const song = await tx.song.findFirst({
        orderBy: {
          addedAt: 'desc',
        },
        where: {
          id: parseInt(id),
        },
      });
      if (!song) {
        return { success: false, message: '신청곡을 찾을 수 없습니다.' };
      }
      await tx.song.delete({
        where: {
          id: song.id,
        },
      });

      return {
        success: true,
        message: `[${song.title} - ${song.artist}] 신청곡을 취소했습니다.`,
        isPaid: song.isPaid,
      };
    });

    res.json(song);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
