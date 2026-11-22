import { describe, expect, it } from 'vitest';
import {
  FREE_SHIPPING_MIN_SUBTOTAL,
  amountToFreeShipping,
  calculateShippingFee,
  qualifiesForFreeShipping,
} from './pricing';

const regular = { id: 'jnt', cost: 12000 };
const nextDay = { id: 'sicepat', cost: 18000 };
const instant = { id: 'instant', cost: 35000 };

describe('gratis ongkir reguler', () => {
  it('batas minimum Rp 500.000', () => {
    expect(FREE_SHIPPING_MIN_SUBTOTAL).toBe(500000);
  });

  it('tepat di batas atau di atasnya gratis untuk kurir reguler', () => {
    expect(calculateShippingFee(500000, regular)).toBe(0);
    expect(calculateShippingFee(747000, regular)).toBe(0);
  });

  it('di bawah batas membayar ongkir penuh', () => {
    expect(calculateShippingFee(499999, regular)).toBe(12000);
    expect(calculateShippingFee(0, regular)).toBe(12000);
  });

  it('kurir lebih cepat tidak pernah digratiskan', () => {
    expect(calculateShippingFee(2000000, nextDay)).toBe(18000);
    expect(calculateShippingFee(2000000, instant)).toBe(35000);
    expect(qualifiesForFreeShipping(2000000, nextDay)).toBe(false);
  });

  it('amountToFreeShipping menghitung sisa belanja dan tidak negatif', () => {
    expect(amountToFreeShipping(389000)).toBe(111000);
    expect(amountToFreeShipping(500000)).toBe(0);
    expect(amountToFreeShipping(900000)).toBe(0);
  });
});
