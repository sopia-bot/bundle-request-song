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

export interface SettingInput {
  allowFree: boolean;
  limitByCount: boolean;
  maxRequestCount?: number;
  limitByTime: boolean;
  requestTimeLimit?: number;
  allowPaid: boolean;
  paidType?: 'sticker' | 'amount';
  stickerId?: string;
  minAmount?: number;
  allowDistribution?: boolean;
}
