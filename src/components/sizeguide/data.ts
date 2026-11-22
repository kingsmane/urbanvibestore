import type { Point, PointInfo, SizeRow } from './types';

export const POINT_DATA: Record<Point, PointInfo> = {
  A: {
    title: 'Cara Mengukur Lebar Bahu (Shoulder Width)',
    tag: 'TITIK A: LEBAR BAHU',
    body: 'Bentangkan pakaian menghadap ke bawah atau depan. Ukur garis horizontal lurus dari titik sambungan jahitan bahu paling luar sebelah kiri ke titik jahitan bahu sebelah kanan.',
  },
  B: {
    title: 'Cara Mengukur Dada (Chest Width)',
    tag: 'TITIK B: LINGKAR DADA',
    body: 'Bentangkan pakaian favorit Anda secara rata di atas meja datar. Tarik pita meteran lurus dari ujung jahitan bawah ketiak kiri tepat ke jahitan bawah ketiak kanan (pit-to-pit). Kalikan 2 untuk mendapatkan lingkar dada keliling.',
  },
  C: {
    title: 'Cara Mengukur Panjang Badan (Body Length)',
    tag: 'TITIK C: PANJANG BADAN',
    body: 'Ukur dari titik tertinggi kerah bahu (HPS - High Point Shoulder) lurus ke bawah hingga ujung kelim paling bawah pakaian (bottom hem).',
  },
  D: {
    title: 'Cara Mengukur Panjang Lengan (Sleeve Length)',
    tag: 'TITIK D: PANJANG LENGAN',
    body: 'Tarik meteran dari sambungan jahitan bahu atas menuruni tepi luar lengan hingga ujung manset atau rib pergelangan tangan.',
  },
};

export const SIZE_ROWS: SizeRow[] = [
  { size: 'S', shoulder: 49, chest: 108, length: 69, heightRange: '160 – 170', weightRange: '50 – 62' },
  { size: 'M', shoulder: 51, chest: 114, length: 71, heightRange: '168 – 176', weightRange: '60 – 72' },
  { size: 'L', shoulder: 53, chest: 120, length: 74, heightRange: '173 – 182', weightRange: '68 – 80' },
  { size: 'XL', shoulder: 55, chest: 126, length: 76, heightRange: '178 – 188', weightRange: '78 – 92' },
  { size: 'XXL', shoulder: 58, chest: 132, length: 78, heightRange: '182 – 195', weightRange: '90 – 108' },
];
