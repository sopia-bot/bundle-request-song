import { Router, Request, Response, NextFunction } from 'express';
import { createPromiseHandshake } from '../lib/promise-handshake';
import { User } from '@sopia-bot/core';

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
export default router;
