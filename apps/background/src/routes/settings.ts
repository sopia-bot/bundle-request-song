import { Router, Request, Response, NextFunction } from 'express';
import { usePrisma } from '../lib/prisma';
import { SettingInput } from '../types/setting';
const { BrowserWindow } = require('electron');

const router = Router();

const DEFAULT_SETTINGS: SettingInput = {
  allowFree: true,
  limitByCount: false,
  limitByTime: false,
  allowPaid: false,
};

// GET /settings
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = usePrisma();
    let setting = await prisma.setting.findUnique({
      where: { id: 'singleton' },
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          id: 'singleton',
          ...DEFAULT_SETTINGS,
        },
      });
    }

    res.json(setting);
  } catch (err) {
    next(err);
  }
});

// PUT /settings
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: SettingInput = req.body;

    const prisma = usePrisma();
    const setting = await prisma.setting.upsert({
      where: { id: 'singleton' },
      update: input,
      create: {
        id: 'singleton',
        ...input,
      },
    });

    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length > 0) {
      const mainWindow = allWindows[0];
      const webContents = mainWindow.webContents;
      webContents.send('request-song.sopia.dev/renderer', 'reload');
    }

    res.json(setting);
  } catch (err) {
    next(err);
  }
});

export default router;
