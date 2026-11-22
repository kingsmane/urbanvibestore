export type Category = 'tops' | 'bottoms' | 'outerwear';
export type Point = 'A' | 'B' | 'C' | 'D';
export type Preference = 'slim' | 'regular' | 'oversized';

export interface PointInfo {
  title: string;
  tag: string;
  body: string;
}

export interface SizeRow {
  size: string;
  shoulder: number;
  chest: number;
  length: number;
  heightRange: string;
  weightRange: string;
}
