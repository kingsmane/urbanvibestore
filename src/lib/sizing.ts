export type FitPreference = 'slim' | 'regular' | 'oversized';

/** Rekomendasi ukuran atasan dari tinggi (cm), berat (kg), dan preferensi potongan. */
export function computeRecommendedSize(heightCm: number, weightKg: number, pref: FitPreference): string {
  const score = heightCm * 0.4 + weightKg * 0.6;
  let calc: string;
  if (score < 96) calc = 'S';
  else if (score < 109) calc = 'M';
  else if (score < 122) calc = 'L';
  else if (score < 135) calc = 'XL';
  else calc = 'XXL';

  if (pref === 'slim') {
    // slim: turun satu ukuran, kecuali sudah S atau M
    if (calc === 'XXL') calc = 'XL';
    else if (calc === 'XL') calc = 'L';
    else if (calc === 'L') calc = 'M';
  } else if (pref === 'oversized') {
    if (calc === 'S') calc = 'M';
  }
  return calc;
}

export function recommendedBottomSize(weightKg: number): string {
  return weightKg < 58 ? 'Size 27' : weightKg < 68 ? 'Size 29' : 'Size 31';
}
