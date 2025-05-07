import { Router, Request, Response, NextFunction } from 'express';
import { createPromiseHandshake } from '../lib/promise-handshake';
import { User } from '@sopia-bot/core';
import { usePrisma } from '../lib/prisma';

const { BrowserWindow } = require('electron');
const router = Router();

interface UserListResponse {
  success: boolean;
  message: string;
  users: User[];
}

// GET /users/list
router.get('/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const handshake = await createPromiseHandshake<UserListResponse>();
    console.log('handshake', handshake);
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send(
      'request-song.sopia.dev/renderer',
      'user-list',
      handshake.id
    );
    const userList = await handshake.promise;
    if (userList.success) {
      res.json({
        success: true,
        data: userList.users,
      });
    } else {
      res.json({
        success: false,
        message: userList.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /users/paid
router.post(
  '/paid',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { selectedUsers } = req.body;
      console.log('selectedUsers', selectedUsers);
      const window = BrowserWindow.getAllWindows()[0];
      const sendMsgFlag = selectedUsers.length <= 3;
      for (const user of selectedUsers) {
        window.webContents.send(
          'request-song.sopia.dev/renderer',
          'insert-paid',
          {
            user,
            sendMsgFlag,
          }
        );
      }
      res.json({
        success: true,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /users/ticket
router.get('/ticket', async (req: Request, res: Response) => {
  try {
    const prisma = usePrisma();
    const { authorId } = req.query;
    if (!authorId) {
      res.json({
        success: false,
        message: 'authorId is required',
      });
      return;
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        authorId: Number(authorId),
        isUsed: false,
      },
    });

    res.json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.json({
      success: false,
      message: (err as Error).message,
    });
  }
});

// PUT /users/ticket
router.put('/ticket', async (req: Request, res: Response) => {
  try {
    const { liveId, authorId, nickname, sticker, amount, combo } = req.body;
    console.log('liveId', liveId);
    console.log('authorId', authorId);
    console.log('nickname', nickname);
    console.log('sticker', sticker);
    console.log('amount', amount);
    console.log('combo', combo);
    const prisma = usePrisma();
    const ticket = await prisma.ticket.create({
      data: {
        liveId,
        authorId,
        nickname,
        sticker,
        amount,
        combo,
      },
    });

    res.json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: (err as Error).message,
    });
  }
});

// PATCH /users/ticket/:id
router.patch('/ticket/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { authorId } = req.body;
    const prisma = usePrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id), authorId: Number(authorId) },
    });

    if (!ticket) {
      res.json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    if (ticket.isUsed) {
      res.json({
        success: false,
        message: 'Ticket already used',
      });
      return;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(id), authorId: Number(authorId) },
      data: { isUsed: true },
    });

    res.json({
      success: true,
      data: updatedTicket,
    });
  } catch (err) {
    res.json({
      success: false,
      message: (err as Error).message,
    });
  }
});

export default router;
