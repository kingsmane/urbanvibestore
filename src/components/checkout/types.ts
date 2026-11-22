export type PaymentMethod = 'qris' | 'va' | 'cc';

export interface Courier {
  id: string;
  name: string;
  cost: number;
  eta: string;
}

export interface Voucher {
  code: string;
  amount: number;
}
