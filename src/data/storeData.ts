export interface ColorVariant {
  name: string;
  hex: string;
}

export interface SizeVariant {
  code: string;
  stock: number;
  statusLabel: string; // e.g., "Tersedia", "Sisa 3", "Habis"
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortName: string;
  category: 'Pria' | 'Wanita' | 'Aksesoris';
  subCategory: string;
  tagLabel: string;
  price: number;
  originalPrice?: number;
  isSoldOut?: boolean;
  badges: { text: string; variant: 'white' | 'promo' | 'dark' | 'soldout' }[];
  rating?: { score: string; count: number };
  image: string;
  gallery: string[];
  colors: ColorVariant[];
  extraColorCount?: number;
  sizes: SizeVariant[];
  defaultSize: string;
  specs: {
    density: string;
    silhouette: string;
    detailLabel: string;
    detailValue: string;
    fitNote: string;
    materialTag: string;
    carePoints: string[];
  };
}

export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
  badgeText?: string;
  badgeVariant?: 'promo' | 'dark';
}

export interface OrderItemSnapshot {
  /** Slug produk (id katalog) bila produk masih ada; dipakai untuk beli lagi. */
  productId?: string;
  name: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  price: number;
  image: string;
  fitProfileMatch?: boolean;
  edition?: string;
  reviewText?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  dateStr: string;
  status: OrderStatus;
  paymentMethod: string;
  vaNumber?: string;
  /** ISO time batas pembayaran (dari server). */
  paymentExpiresAt?: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  voucherCode?: string;
  serviceFee: number;
  total: number;
  courierName: string;
  trackingNumber?: string;
  estimatedArrival?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  shippingAddress: string;
  receivedBy?: string;
  items: OrderItemSnapshot[];
}

export interface SavedAddress {
  id: string;
  label: string;
  isPrimary: boolean;
  recipient: string;
  phone: string;
  fullAddress: string;
  courierNote: string;
  /** Data terstruktur (diisi dari database). */
  recipientName?: string;
  /** Alamat jalan saja (tanpa kota/kode pos). */
  streetAddress?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface FitProfile {
  height: number;
  weight: number;
  preference: 'slim' | 'regular' | 'oversized';
  recommendedTop: string;
  recommendedBottom: string;
  calculatedSize: string;
}

export const formatRupiah = (amount: number): string => {
  return 'Rp ' + amount.toLocaleString('id-ID');
};

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'URBN-TSH-001',
    name: 'Oversized Heavyweight Tee - Charcoal',
    shortName: 'Oversized Heavyweight Tee',
    category: 'Pria',
    subCategory: 'Pria // Esensial',
    tagLabel: 'Ready',
    price: 249000,
    badges: [
      { text: 'New Drop', variant: 'white' },
      { text: '280 GSM', variant: 'promo' },
    ],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCxohio_lrkWtKrdiB3ljAk78Wb6ahTapEIq6L3HppyfVZItVm_Ir2J9KyJVwzbSo98vVP49fo1NTDmonmG5j6BHNIWu95oQE42KeJFJEsH1qFMbn6Twg3uRGB19pkt54BvnGDKCSzNn5cStsAWonwTDawMbEd6gpnDp5qgbciS4GI431yqWcIR1Apuyfam2D_y4pZ75LoEubGS-2GWno-kYevcRc6xWrXAfIWezfxM',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBglhlDFavWJLW5P9pXvahuHdZSf6WK62-xdGG0PEeZc9vOdNcWrGmpw8Zeaj2FShR3psEtsImo0p3R7AVo16-Hzy3tuD26-Cys6KHroAj8XGXs87ujmbh3VpSroJ82KbvwdkPBoY0yrKUp_xZrBDYzIc5gYDiieYfojQmsIo94RR64o75N5M1xbhDw0TlNFaiTc4224yNL3EPNzt0wZ8eQlank_bUzrEH1omPt6Pes',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADh9JZg2bwstQyeU_dyhSuPaY8JT8LIGOYHyWv8tLDbsX8M6zYfWVvbjqAIFBoaPvOMVYmXcJU0mjghisCdwKFe6Uv7WB6Xrc9GWdqX-c0FXh6JYwz-Fs52AlAFtUqeuCnxJsn5mqXQu5XUQuJ7v8k0KmGThFK5A-wRW6NK_Ufu3jgaYMEIXuW4ztKQETPijyAz57J2UaohsbJ74vPM2r5sL3tUqBopsoPNLcmR8M_',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrk9tWosZ3vBm3dpsXwg1I73XhgU3LHC3QuIG9o81kAgy1HWKCsQNpphcbYZ0TaduZyOM-ucMM5BVdyrfhjkJUnzPHorLUQcNSl1h6rM3gsGrKFQGfhexiGe8mKXy0tXBLF9yOmZRxDqdxroxhGXqrMS09jZukgeoAvy61X3aWaWNL6ocS8qIFflSFWj67iG0IYoOjcGjH6Rk0gnNFOqsqga3cH_xMhp9gVsGs3gf6',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCr7P9yIs103Aj3mbpRBlp0wEUdjpMuxFWv8sbP3qj25G5V_XlyKL42kF6V_XzrxDIyfRKt4OCkZJBOvYV3dKoloa2rvpwGQcgO7IMrb2DLe_6xSSh6DuyFwiftkq6XVsjogjF-Z79WnwaKAKcTxmtf8j_kJvxsOSw04PFtc9Kc22jlq4EWtZXMQzMvskUS3nxrK-ZXMVr2ghemTWF3byVTyj0q9i2sPca5BrarHuHe',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACPSPBazgyXyVeCA84uAyie582fEJjsumw-6et6cmwxKwlB9vMUxkzlssQDEk86_gPrwwe2WKlnAqzvsXbrmZBl1-kZHXtniVRCp-cLshLEgq9IUgX9M8TR3HwxKNR--P4QzntVdGah2ct9CbBXS9QMINylDxqqR_XrFR2SrzR5stc29Oy2ICc2sGRn9H8booU4M3Uao7tlCv7yx7AxB8Qg32xGhqsYyi5-QokI4LQ',
    ],
    colors: [
      { name: 'Charcoal Black', hex: '#1C1D21' },
      { name: 'Chalk White', hex: '#ECEEEF' },
      { name: 'Olive Green', hex: '#495441' },
    ],
    extraColorCount: 2,
    sizes: [
      { code: 'S', stock: 3, statusLabel: 'Sisa 3' },
      { code: 'M', stock: 12, statusLabel: 'Tersedia' },
      { code: 'L', stock: 15, statusLabel: 'Tersedia' },
      { code: 'XL', stock: 0, statusLabel: 'Habis' },
      { code: 'XXL', stock: 1, statusLabel: 'Sisa 1' },
    ],
    defaultSize: 'L',
    specs: {
      density: '220 GSM',
      silhouette: 'Boxy Oversized',
      detailLabel: 'Kerah Leher',
      detailValue: 'High Rib 3.0 cm',
      fitNote: 'Model tinggi 182 cm, berat 72 kg mengenakan ukuran L',
      materialTag: '100% Cotton 24S',
      carePoints: [
        '• 100% Combed Cotton 24s (220 GSM) dengan tekstur rapat dan padat.',
        '• Kerah rajut double-ribbed 3.0 cm anti-melar.',
        '• Instruksi pencucian: Cuci mesin air dingin (maks 30°C), jangan gunakan pemutih berbahan klorin, setrika temperatur sedang dari sisi dalam, jemur rata di tempat teduh.',
      ],
    },
  },
  {
    id: 'prod-2',
    sku: 'URBN-SHT-002',
    name: 'Boxy Minimalist Linen Shirt - Sand',
    shortName: 'Boxy Minimalist Linen Shirt',
    category: 'Pria',
    subCategory: 'Pria // Kemeja',
    tagLabel: 'Pure Linen',
    price: 389000,
    originalPrice: 450000,
    badges: [
      { text: 'Best Seller', variant: 'promo' },
      { text: 'Diskon 14%', variant: 'dark' },
    ],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ_A_IZ0erNMfjhMtXCGvU-q17VjJ1M9lGZWxcWQVNxgk0p3qsLuFYPaDIuIZVz2Zs7RQzHWHAibpdF-mOWF82ssFKExDwMoC7M9fcCBbaikSRpD8Q-IUkcHLLaFHydMlkNhKfjQF_qJyyQnWsXohC7oVKTjCumwmUWTAdCYxpQ3M_8RqSm51QaF8iBHrgDPwOFma_IUkyU5UmpKpqBfHvvjkZ_pkA8wZXN9BRikpM',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ_A_IZ0erNMfjhMtXCGvU-q17VjJ1M9lGZWxcWQVNxgk0p3qsLuFYPaDIuIZVz2Zs7RQzHWHAibpdF-mOWF82ssFKExDwMoC7M9fcCBbaikSRpD8Q-IUkcHLLaFHydMlkNhKfjQF_qJyyQnWsXohC7oVKTjCumwmUWTAdCYxpQ3M_8RqSm51QaF8iBHrgDPwOFma_IUkyU5UmpKpqBfHvvjkZ_pkA8wZXN9BRikpM',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCABh2P6ttxQg4XX6S5hoKV2Eo7gxUWh2jKkdcN6gmTIYzhlv5Amse6EM-vMGeZpiVKh_2n2jSddLyELl2C93rJO84c93_7f8dNcwZi68zwoNPeQmpI486ZZVi6x92dBdi1bJNE_HmkFg5A-CW2SF1F3n9WVFaN1ISk-vvGfHQMF-ddgChKhsomshlc2XOmhugIcX6POR6NdhD89HM-CaMUey5T0uWV-r3YDSN1-Q29',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPY_jyWhTmay8K5_Ud69SGhZ4VWio6gIikf9pNbee6HIwtUQ-dK0ZBB3mr1Bzlt5r4VUbPUJGBG05FupOAnVL-z9wyiMq0ITlQSOwOyNDHfYOLe0NE_rIFMRBpH2IiFuJmO68qAOlm99RbGbsge1QnV-mqvKQgJwlWv-k3EoWFpeBPzrOm5Kf7OYOuZy2hpvzWB_XhEKaNOPxl74YT94ZBqtYZedOpT_S-cwVvQu9V',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3weazbwFp09QW0IKGsZZ_stVr1gqbiP-i3VLrM9L-te6H3pFOhpKnhL23HWMtLWw4o_mDnA04J-DyYUiismvaHAniuGaWnba-dwyD7bJ1fpAvEgXMpcYOzNSZ9CzNHRA48oWvCNym0iuYJ4pNNL_VUR4f-DgEXQgi0IcSvH-ey_2X6cVps9Oz8150ZExts9G5XUEOwAxi6QTNyncqxVCSFzzBpdy1XbumtP9NsXrB',
    ],
    colors: [
      { name: 'Sand Beige', hex: '#e4d8c5' },
      { name: 'Obsidian Black', hex: '#292524' },
    ],
    sizes: [
      { code: 'S', stock: 5, statusLabel: 'Tersedia' },
      { code: 'M', stock: 9, statusLabel: 'Tersedia' },
      { code: 'L', stock: 4, statusLabel: 'Sisa 4' },
      { code: 'XL', stock: 2, statusLabel: 'Sisa 2' },
    ],
    defaultSize: 'M',
    specs: {
      density: '185 GSM Linen',
      silhouette: 'Boxy Camp Cut',
      detailLabel: 'Kancing',
      detailValue: 'Mother of Pearl',
      fitNote: 'Model tinggi 180 cm, berat 70 kg mengenakan ukuran M',
      materialTag: '100% European Flax Linen',
      carePoints: [
        '• 100% Pure European Flax Linen dengan sirkulasi udara tinggi untuk iklim tropis.',
        '• Potongan boxy camp collar yang rileks namun terstruktur.',
        '• Cuci lembut dengan air dingin, hindari pemerasan kuat, setrika uap saat masih agak lembap.',
      ],
    },
  },
  {
    id: 'prod-3',
    sku: 'URBN-TRS-003',
    name: 'Wide-Leg Pleated Trousers - Ink Black',
    shortName: 'Wide-Leg Pleated Trousers',
    category: 'Wanita',
    subCategory: 'Wanita // Celana',
    tagLabel: 'Tailored',
    price: 479000,
    badges: [{ text: 'Trending', variant: 'promo' }],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZAU3c3uk7qyCaJhNZGffuRg-kO-Y3KAoWE1IjCAF--hKXhidvZfKLQulppl6MizhHUuNkWu66sQTEGViVq_cj1OI2JSkXtGil-8JDMDeAupLYadzxOirNqb2e9zek1B_hmzIrR4mNUxleDxFk-aweAUgHLR2o-VPcgnttPXr3H9jr2bWTZxiE7KbSEm0aEzVmdFzQA7Y6bzclkT-SGz4XlvJd7KNQCpfzFAAS5YSp',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZAU3c3uk7qyCaJhNZGffuRg-kO-Y3KAoWE1IjCAF--hKXhidvZfKLQulppl6MizhHUuNkWu66sQTEGViVq_cj1OI2JSkXtGil-8JDMDeAupLYadzxOirNqb2e9zek1B_hmzIrR4mNUxleDxFk-aweAUgHLR2o-VPcgnttPXr3H9jr2bWTZxiE7KbSEm0aEzVmdFzQA7Y6bzclkT-SGz4XlvJd7KNQCpfzFAAS5YSp',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCw14YRvisUi6Nx_-38l57WG34s5Qu0kndBz0bfgbPUKS0qZdKRvB1zosKk2sCXfsttSzbT5uRBA4_dVUjZ7dArGt5bhiqehBMrft574N8lBa1zAAs1IvQIVEfk4pqmE3ZAskTpsz3Gpc0YsaqcEmP7v4WIOeTpTVH_bUT-8DPGfCMSWGeNJ3yD3YO0fbWqCeYcmRNEE7yFA1kdVOi60vHn9IxY_FpVYkk7Hnp7HFOI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDV9fKkWm1cOMCD4NNYuqsCMJs3yIW-DFnjknp2ok4YWRKP9NrM1XOyx7PcFyLsL2QHAvVzKU-z4pF8epI0OWMr7SD6nVtbOEf5soAMcyDKcXIeXlg-X9qamfgsb5-PTyYSLIqamwMopiGcv1PhZQ03mNEwYBgno8Kd5drvmTOFsveAoflRStJrs6diTQrYGyzjVKXwnWSa3dP-Qar9jiMGkMZmrhxqEGrUTu1IfojM',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBYQiGggPIhja1aaDV4IfPVaEhoPR6Lo_lSUaoOMpS-X3GKPH2bMuv8a3Q4ni6Jh4EiP9BAQj5JHsPcpWmZp1CoIesDe13JzoA8BlnfqPciWW5H5dThMc-Qm7EXNy8EeXcGIA_9nj_DgCADO3wfESH0YY4twqLHGRSZOYfkXcm2lQBWXQVISE6tg3BfLpjNhX4m8w5VK8B2r1zkfxWH9buMWSGUFRdWzHPpXjPeJEJW',
    ],
    colors: [
      { name: 'Ink Black', hex: '#000000' },
      { name: 'Stone Grey', hex: '#d4d4d4' },
    ],
    sizes: [
      { code: '26', stock: 6, statusLabel: 'Tersedia' },
      { code: '28', stock: 10, statusLabel: 'Tersedia' },
      { code: '30', stock: 3, statusLabel: 'Sisa 3' },
    ],
    defaultSize: '28',
    specs: {
      density: '260 GSM Twill',
      silhouette: 'High-Waist Wide',
      detailLabel: 'Lipatan Depan',
      detailValue: 'Double Architectural Pleat',
      fitNote: 'Model tinggi 170 cm, berat 52 kg mengenakan ukuran 28',
      materialTag: 'Poly-Rayon Twill',
      carePoints: [
        '• Drape jatuh sempurna dengan struktur pinggang tinggi yang tegas.',
        '• Dilengkapi saku samping tersembunyi dan pengait logam internal.',
        '• Cuci dingin atau dry clean untuk menjaga ketajaman lipatan pleat.',
      ],
    },
  },
  {
    id: 'prod-4',
    sku: 'URBN-BLZ-004',
    name: 'Cropped Structured Blazer - Bone White',
    shortName: 'Cropped Structured Blazer',
    category: 'Wanita',
    subCategory: 'Wanita // Outerwear',
    tagLabel: 'Restock SS26',
    price: 629000,
    isSoldOut: true,
    badges: [{ text: 'Habis', variant: 'soldout' }],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTz5Rio15Ag5qCF90iJIEJC8l6rVCKCMzqv2vEGqQ-jvHQ8HqkM5EgfoGz1oN0S7TlgK-eGxe37FVWUXxQT9-69bMRHQW0oidMlYDN6Un7CxLijNafD03PyZBAEvPZJ9-yTItOrJVdEPAPBKA9NxZgL9BMWHUNEiW5ZeAX7a05wih17Vz4XECrnS7daEN4e6moOA6PhWNdLn12gPtXRKtAnf--MTNpIGPeOGQ8iVCt',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTz5Rio15Ag5qCF90iJIEJC8l6rVCKCMzqv2vEGqQ-jvHQ8HqkM5EgfoGz1oN0S7TlgK-eGxe37FVWUXxQT9-69bMRHQW0oidMlYDN6Un7CxLijNafD03PyZBAEvPZJ9-yTItOrJVdEPAPBKA9NxZgL9BMWHUNEiW5ZeAX7a05wih17Vz4XECrnS7daEN4e6moOA6PhWNdLn12gPtXRKtAnf--MTNpIGPeOGQ8iVCt',
    ],
    colors: [{ name: 'Bone White', hex: '#e7e5e4' }],
    sizes: [
      { code: 'S', stock: 0, statusLabel: 'Habis' },
      { code: 'M', stock: 0, statusLabel: 'Habis' },
      { code: 'L', stock: 0, statusLabel: 'Habis' },
    ],
    defaultSize: 'M',
    specs: {
      density: '310 GSM Gabardine',
      silhouette: 'Cropped Boxy',
      detailLabel: 'Konstruksi Bahu',
      detailValue: 'Soft Tailored Pad',
      fitNote: 'Seluruh varian ukuran saat ini sedang habis terjual (Restock SS26)',
      materialTag: 'Structured Gabardine',
      carePoints: [
        '• Siluet cropped arsitektural dengan lapel minimalis.',
        '• Disarankan dry clean saja untuk menjaga struktur bantalan bahu.',
      ],
    },
  },
  {
    id: 'prod-5',
    sku: 'URBN-DNM-005',
    name: 'Relaxed Japanese Raw Denim - Deep Indigo',
    shortName: 'Relaxed Japanese Raw Denim',
    category: 'Pria',
    subCategory: 'Pria // Denim',
    tagLabel: 'Kojima Mill',
    price: 549000,
    badges: [{ text: '14.5 oz Selvedge', variant: 'dark' }],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKYL7fMV4z66PtlI9OENMp_2yoTLz_6YEZhPWKxLmYEA6FVbWL4bTyOSFQJNq1ux6B-wvDfrL1w43-bUOOApeTsZQFTkYB0TUum6FZSS7xVzQC3YxtkuUGOAhdDDWnKxygUrwf8m2qFEq4VGwXtWNyi0JYtDXA3rrr7ZOUfA0gZ9xr7rS5khlib23xqWyAGURBU3GlDMsXcDKZZrfRNMDq7mD03K6sbM142fcjj4Pz',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKYL7fMV4z66PtlI9OENMp_2yoTLz_6YEZhPWKxLmYEA6FVbWL4bTyOSFQJNq1ux6B-wvDfrL1w43-bUOOApeTsZQFTkYB0TUum6FZSS7xVzQC3YxtkuUGOAhdDDWnKxygUrwf8m2qFEq4VGwXtWNyi0JYtDXA3rrr7ZOUfA0gZ9xr7rS5khlib23xqWyAGURBU3GlDMsXcDKZZrfRNMDq7mD03K6sbM142fcjj4Pz',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBm2I3siBPaoJ48oHxEdw3cBhpHVKACRsVRub9eLDRHhGqd_h2v-8g2cCR2kB93z3C8FgtvEmdvKRFRnnMQ2kTLstr3EoQxxZOhmgzo9ky3yS4JI0OeXNfl-PmBtR2_ru_YIrXhCB9c63iv_I4uYtfvEYqdXrainPTtlaNCkDnRWMHVy81mEgtHFs7Tsp4dS1ZXpoPINYTIZbhVDMrff3II8qlxTugzlEYK5_SqF5Uf',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAU1yTemLOwMCGPTWgj-QfL3GAP6WFEyr2Dxw33pDXxrPe2WEtR9Xz0BSdaZHMjkpFRGiqx_6X7EZfbg6xX4L89bmscygLqq_LabsWimQzxFuK3rWo2yT7ZrNgmMrMSeyJnra_zunH8NvAkVAp33q8DqC3FcLMuIC3FDvBNnyNgIEY8z6Pgxhy9DfyFOh_VE8BF-MJv_hHd-2hMSPpBGQD3lC-etvOAfifaO0pqmahE',
    ],
    colors: [{ name: 'Deep Indigo', hex: '#1e1b4b' }],
    sizes: [
      { code: '28', stock: 4, statusLabel: 'Tersedia' },
      { code: '30', stock: 8, statusLabel: 'Tersedia' },
      { code: '32', stock: 5, statusLabel: 'Tersedia' },
      { code: '34', stock: 2, statusLabel: 'Sisa 2' },
    ],
    defaultSize: '30',
    specs: {
      density: '14.5 oz Selvedge',
      silhouette: 'Relaxed Straight',
      detailLabel: 'Tenunan',
      detailValue: 'Red-Line Shuttle Loom',
      fitNote: 'Model tinggi 181 cm, berat 71 kg mengenakan ukuran 30',
      materialTag: '100% Kojima Raw Cotton',
      carePoints: [
        '• 14.5 oz Japanese Rope-Dyed Indigo Selvedge Denim dari Kojima.',
        '• Jahitan rantai (chain-stitch) pada hem bawah dan rivet tembaga matte.',
        '• Rendam air dingin secara berkala (soak wash) dengan deterjen khusus denim.',
      ],
    },
  },
  {
    id: 'prod-6',
    sku: 'URBN-KNT-006',
    name: 'Ribbed Knit Asymmetric Top - Sage Green',
    shortName: 'Ribbed Knit Asymmetric Top',
    category: 'Wanita',
    subCategory: 'Wanita // Atasan',
    tagLabel: 'Organic Rib',
    price: 299000,
    badges: [{ text: 'New Siluet', variant: 'promo' }],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzxmYFhiLjhBCPkYVu_ACyzuhhovgy5I1Y0c4B0Sh5-IHXxCjr44cvXz9OXiF5-f-BZkcJNthysW09COedQ-HAf5kww6ye1jzcAEwS7gSYNvH4aT95m3j-afhbzfoTcQ-KT_riMTKUVHyzF71h7FCk9FKloqe4POKmOrdrVrSejrgiJxC1QNuNROg_hb0uWd_wNQYgjL97WMTDBSmsRCaQSVo4vcWdbyzoBhtTTSEQ',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzxmYFhiLjhBCPkYVu_ACyzuhhovgy5I1Y0c4B0Sh5-IHXxCjr44cvXz9OXiF5-f-BZkcJNthysW09COedQ-HAf5kww6ye1jzcAEwS7gSYNvH4aT95m3j-afhbzfoTcQ-KT_riMTKUVHyzF71h7FCk9FKloqe4POKmOrdrVrSejrgiJxC1QNuNROg_hb0uWd_wNQYgjL97WMTDBSmsRCaQSVo4vcWdbyzoBhtTTSEQ',
    ],
    colors: [
      { name: 'Sage Green', hex: '#065f46' },
      { name: 'Warm Cream', hex: '#e5e5e5' },
    ],
    sizes: [
      { code: 'S', stock: 7, statusLabel: 'Tersedia' },
      { code: 'M', stock: 9, statusLabel: 'Tersedia' },
      { code: 'L', stock: 3, statusLabel: 'Sisa 3' },
    ],
    defaultSize: 'S',
    specs: {
      density: '240 GSM Knit',
      silhouette: 'Sculpted Fit',
      detailLabel: 'Garis Leher',
      detailValue: 'Asymmetric Collarbone Cut',
      fitNote: 'Model tinggi 168 cm, berat 51 kg mengenakan ukuran S',
      materialTag: 'Organic Cotton Modal',
      carePoints: [
        '• Rajutan rib organik elastis yang mengikuti kontur tubuh dengan lembut.',
        '• Jangan digantung saat basah; jemur mendatar agar panjang rajutan tetap stabil.',
      ],
    },
  },
  {
    id: 'prod-7',
    sku: 'URBN-BAG-007',
    name: 'Utility Minimalist Crossbody Pouch',
    shortName: 'Utility Minimalist Crossbody Pouch',
    category: 'Aksesoris',
    subCategory: 'Aksesoris // Tas',
    tagLabel: 'Water-repellent',
    price: 219000,
    badges: [{ text: 'Cordura®', variant: 'white' }],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDk7Cj0OuzCybmVGVtNlIRX9BbdlZXL8Oax8clIYzu1BytJnFRG6rH9KoWwaLGVT9JReCjQOjylrxhcuEWXzgUDF9KrxGkFWBXH1JBBYFa_-fJrzL8c0ExMYTCY-q-oR2EBGtE26NR_C1sLr5c0xuzR7ImCHTHwsqsGez6DNa48tsNKH7tn9jwCXU6Gz5XD37eqX5mphhAj2d4LGu18v6TGOnU_r6tQsX-3y8kUNyiM',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDk7Cj0OuzCybmVGVtNlIRX9BbdlZXL8Oax8clIYzu1BytJnFRG6rH9KoWwaLGVT9JReCjQOjylrxhcuEWXzgUDF9KrxGkFWBXH1JBBYFa_-fJrzL8c0ExMYTCY-q-oR2EBGtE26NR_C1sLr5c0xuzR7ImCHTHwsqsGez6DNa48tsNKH7tn9jwCXU6Gz5XD37eqX5mphhAj2d4LGu18v6TGOnU_r6tQsX-3y8kUNyiM',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5-yfa0Qu7RUVCdI2VnACYtc6r6jTcRMY1GIMtRf4fY9NrOH6Ho-_pUfyqy2pPvVZV_V1HKA3eBpyy-4MVuBcAeK7L9TgjnZqakJFcRcLRqgPhpMVyTijBijW76cOKio23bQYngNA88LXnyS8B-XEvzNX9I5GiC4rSNha_HnkIO321H2ZksX9AUgDKjKqQDMiD0uLRTV2Fdr_OC0RcOdHzpYk-Gk4oyf0wyhvYhIhz',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhHjuJxONw08c30wMaQFAucDirLqMUmERZkWjq_mZZb1djB_sVQ388AdHJ7JS8JXkswS8fS781v1i31mByNp1bXMbJs-B_v-DFum4CYFjt_u-K79zDaf5LjwUz_AQgSXsPCaIoyWYczcYW0GyzGjPTMfNvpKY24q7BTdNDca-deCRuL6HvFYTcZPtLuaK2-wwg0BCc2lxJuEYnLSYWi_Hs41J1kNTKFD_JUuPMx1sZ',
    ],
    colors: [{ name: 'Ultra Matte Black', hex: '#171717' }],
    sizes: [{ code: 'OS', stock: 14, statusLabel: 'Tersedia' }],
    defaultSize: 'OS',
    specs: {
      density: '500D Cordura®',
      silhouette: 'Compact Modular',
      detailLabel: 'Ritsleting',
      detailValue: 'YKK AquaGuard® Matte',
      fitNote: 'Dimensi: 22 cm × 16 cm × 6 cm (Tali dapat disesuaikan)',
      materialTag: 'Ballistic Nylon',
      carePoints: [
        '• Material 500D Cordura® tahan gesekan dan percikan air hujan.',
        '• Tiga kompartemen internal untuk paspor, ponsel, dan kunci.',
        '• Bersihkan dengan kain lembap; jangan dimasukkan ke mesin cuci.',
      ],
    },
  },
  {
    id: 'prod-8',
    sku: 'URBN-COT-008',
    name: 'Everyday Wool Blend Overcoat - Slate',
    shortName: 'Everyday Wool Blend Overcoat',
    category: 'Wanita',
    subCategory: 'Wanita // Mantel',
    tagLabel: 'Wool Blend',
    price: 899000,
    badges: [{ text: 'Premium Cut', variant: 'promo' }],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDS05yKpnO4AUAQ7Q9fEHdO-U4vqCu8FMYvOm5NZLKBiCdFi4YeECk3Fs67vwu0Kn4266t3zByyE2eCKFXJc4qaQ8u6cQHQjMha7Pkm6m_9W3XaS52f3RodXc8bAqivS3fXBrr-IXBohm0ieiacxoBcWk3PAOSyjq99RLzOas5mmQgoyvVSnrUjpjwxt3Vmc7USUYhkrCC8XGd0evCIdDrdpLYOX5SK8jKzJrZLSZkh',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDS05yKpnO4AUAQ7Q9fEHdO-U4vqCu8FMYvOm5NZLKBiCdFi4YeECk3Fs67vwu0Kn4266t3zByyE2eCKFXJc4qaQ8u6cQHQjMha7Pkm6m_9W3XaS52f3RodXc8bAqivS3fXBrr-IXBohm0ieiacxoBcWk3PAOSyjq99RLzOas5mmQgoyvVSnrUjpjwxt3Vmc7USUYhkrCC8XGd0evCIdDrdpLYOX5SK8jKzJrZLSZkh',
    ],
    colors: [
      { name: 'Slate Gray', hex: '#475569' },
      { name: 'Pitch Black', hex: '#1c1917' },
    ],
    sizes: [
      { code: 'S', stock: 4, statusLabel: 'Tersedia' },
      { code: 'M', stock: 6, statusLabel: 'Tersedia' },
      { code: 'L', stock: 2, statusLabel: 'Sisa 2' },
    ],
    defaultSize: 'M',
    specs: {
      density: '420 GSM Wool',
      silhouette: 'Relaxed Drop Shoulder',
      detailLabel: 'Penutup Depan',
      detailValue: 'Concealed Placket',
      fitNote: 'Model tinggi 173 cm, berat 54 kg mengenakan ukuran M',
      materialTag: '60% Wool / 40% Tencel',
      carePoints: [
        '• Campuran wol merino lembut dan serat Tencel dengan bobot jatuh presisi.',
        '• Kancing depan tersembunyi untuk siluet monolitik yang bersih.',
        '• Khusus perawatan Dry Clean profesional.',
      ],
    },
  },
  {
    id: 'prod-derbies',
    sku: 'URBN-SHO-009',
    name: 'Vibram Sole Leather Derbies - Archive Black',
    shortName: 'Vibram Sole Leather Derbies',
    category: 'Aksesoris',
    subCategory: 'Aksesoris // Alas Kaki',
    tagLabel: 'Vibram Sole',
    price: 899000,
    badges: [{ text: 'Full Grain', variant: 'dark' }],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA5-JsITeGQLaGdNoZX_mmapNqpJu4Rp2qMa1ye_ksqvn5XC_kpxVqzIs4MmYgfBE-6tEEAQZXt-CBUR9VXb-vLcHjBtRksXRmk2vCU89FKpiUfcaA94LEwJAc525kI3OCvPel7Vfff2blQ6YWsKR1MTLu1xJtNbPdwy2b-YIHC_O9j2Oowqy3TKaF6fcRutn7CHmYSv3cHJrtvZrEJPHff92-f-40nH-xiQ618q7CS',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA5-JsITeGQLaGdNoZX_mmapNqpJu4Rp2qMa1ye_ksqvn5XC_kpxVqzIs4MmYgfBE-6tEEAQZXt-CBUR9VXb-vLcHjBtRksXRmk2vCU89FKpiUfcaA94LEwJAc525kI3OCvPel7Vfff2blQ6YWsKR1MTLu1xJtNbPdwy2b-YIHC_O9j2Oowqy3TKaF6fcRutn7CHmYSv3cHJrtvZrEJPHff92-f-40nH-xiQ618q7CS',
    ],
    colors: [{ name: 'Archive Black', hex: '#1a1a1a' }],
    sizes: [
      { code: '40', stock: 3, statusLabel: 'Sisa 3' },
      { code: '41', stock: 6, statusLabel: 'Tersedia' },
      { code: '42', stock: 8, statusLabel: 'Tersedia' },
      { code: '43', stock: 5, statusLabel: 'Tersedia' },
      { code: '44', stock: 2, statusLabel: 'Sisa 2' },
    ],
    defaultSize: '42',
    specs: {
      density: 'Full-Grain Leather',
      silhouette: 'Classic Derby',
      detailLabel: 'Sol',
      detailValue: 'Vibram Lug Sole',
      fitNote: 'Ukuran EU; pilih satu ukuran di atas bila berada di antara dua ukuran',
      materialTag: 'Full-Grain Leather',
      carePoints: [
        '• Kulit full-grain dengan sol Vibram tahan selip untuk pemakaian harian.',
        '• Bersihkan dengan kain lembap dan semir netral; hindari rendaman air.',
      ],
    },
  },
  {
    id: 'prod-socks',
    sku: 'URBN-SOK-010',
    name: 'Heavy Ribbed Socks (2-Pack) - Archive Black',
    shortName: 'Heavy Ribbed Socks (2-Pack)',
    category: 'Aksesoris',
    subCategory: 'Aksesoris // Kaus Kaki',
    tagLabel: 'Heavy Rib',
    price: 99000,
    badges: [],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXOdyhHPShzVT_wPTe9U5kiJXEcQz2CrrcSCzFgyh4CmQYZx-W5uyzfZ5IEhu16Mxdk8kI_ZEshhEKxWf7iBPVgo_bo-c4UrXWWvJej5rriV7MoX8sDWUJxLtTnWgK51uDGKiXedzHoHhjkLzeJso5fXsWvRJt_xxGONkPEGOmPMx5bfPB741pNCptolbG4bj0x1_F4YHCz4TsCS2ZCdQ0rNW6iXYiqUZRh9apfXh9',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXOdyhHPShzVT_wPTe9U5kiJXEcQz2CrrcSCzFgyh4CmQYZx-W5uyzfZ5IEhu16Mxdk8kI_ZEshhEKxWf7iBPVgo_bo-c4UrXWWvJej5rriV7MoX8sDWUJxLtTnWgK51uDGKiXedzHoHhjkLzeJso5fXsWvRJt_xxGONkPEGOmPMx5bfPB741pNCptolbG4bj0x1_F4YHCz4TsCS2ZCdQ0rNW6iXYiqUZRh9apfXh9',
    ],
    colors: [{ name: 'Archive Black', hex: '#1a1a1a' }],
    sizes: [{ code: 'OS', stock: 40, statusLabel: 'Tersedia' }],
    defaultSize: 'OS',
    specs: {
      density: 'Heavy Rib Knit',
      silhouette: 'Crew Length',
      detailLabel: 'Isi',
      detailValue: '2 pasang per kemasan',
      fitNote: 'Satu ukuran (OS), cocok untuk EU 39 - 45',
      materialTag: 'Cotton Blend',
      carePoints: [
        '• Rajutan rib tebal yang menahan bentuk dan nyaman dipakai seharian.',
        '• Cuci mesin air dingin; jemur di tempat teduh.',
      ],
    },
  },
];

/** Produk yang disarankan di bagian "Lengkapi Gaya Anda" (diambil dari katalog). */
export const PAIRING_PRODUCT_IDS = ['prod-3', 'prod-7', 'prod-derbies', 'prod-socks'];

export const INITIAL_CART: CartItem[] = [];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: '#URBN-202611-8492',
    dateStr: '17 Nov 2026, 14:12 WIB',
    status: 'PENDING_PAYMENT',
    paymentMethod: 'BCA Virtual Account (Otomatis)',
    vaNumber: '8277 0812 3456 7890',
    subtotal: 638000,
    shippingFee: 12000,
    discount: 50000,
    voucherCode: 'ESSENTIAL2026',
    serviceFee: 1000,
    total: 601000,
    courierName: 'J&T Express Regular',
    estimatedArrival: '18 – 20 Nov 2026',
    recipientName: 'Naya Rahmadani',
    recipientPhone: '+62 812-3456-7890',
    recipientEmail: 'naya.rahmadani@email.com',
    shippingAddress: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan, 12160',
    items: [
      {
        name: 'Oversized Heavyweight Tee',
        color: 'Charcoal',
        size: 'L',
        sku: 'URBN-TSH-HVY-CH-L',
        quantity: 1,
        price: 249000,
        fitProfileMatch: true,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC9neDPQ85zVWsDk6bRrAsI55-acLCVqlQUYwfETKwQfreQ6v1AO43bLT58hT-25VdkGaT4Cr5UwhRVvaCOZfW9vskx3qopG3Eb-cmTQa1P4kcnLoq-03mr0x2OOspZnahmkvh34WoFoytBTV2lLdbtGhjjSsTpBNuopw0kehGadel_IBBfGaXCZ_GTY3i4tKwFKC-GHThIXWMyvPlBek_qkdbfvn-CIolfmn1BFCZL',
      },
      {
        name: 'Boxy Minimalist Linen Shirt',
        color: 'Sand Beige',
        size: 'M',
        sku: 'URBN-SHT-LNN-SD-M',
        quantity: 1,
        price: 389000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCABh2P6ttxQg4XX6S5hoKV2Eo7gxUWh2jKkdcN6gmTIYzhlv5Amse6EM-vMGeZpiVKh_2n2jSddLyELl2C93rJO84c93_7f8dNcwZi68zwoNPeQmpI486ZZVi6x92dBdi1bJNE_HmkFg5A-CW2SF1F3n9WVFaN1ISk-vvGfHQMF-ddgChKhsomshlc2XOmhugIcX6POR6NdhD89HM-CaMUey5T0uWV-r3YDSN1-Q29',
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: '#URBN-202610-3104',
    dateStr: '28 Okt 2026, 09:45 WIB',
    status: 'IN_TRANSIT',
    paymentMethod: 'GoPay / QRIS Lunas',
    subtotal: 549000,
    shippingFee: 0,
    discount: 0,
    serviceFee: 0,
    total: 549000,
    courierName: 'J&T Express Regular',
    trackingNumber: 'JT9842109923',
    estimatedArrival: 'Hari ini, maks 18:00',
    recipientName: 'Naya Rahmadani',
    recipientPhone: '+62 812-3456-4491',
    recipientEmail: 'naya.rahmadani@email.com',
    shippingAddress: 'Kebayoran Baru, Jakarta Selatan',
    items: [
      {
        name: 'Relaxed Japanese Raw Denim',
        color: 'Deep Indigo',
        size: '30',
        sku: 'URBN-DNM-RAW-30',
        quantity: 1,
        price: 549000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBm2I3siBPaoJ48oHxEdw3cBhpHVKACRsVRub9eLDRHhGqd_h2v-8g2cCR2kB93z3C8FgtvEmdvKRFRnnMQ2kTLstr3EoQxxZOhmgzo9ky3yS4JI0OeXNfl-PmBtR2_ru_YIrXhCB9c63iv_I4uYtfvEYqdXrainPTtlaNCkDnRWMHVy81mEgtHFs7Tsp4dS1ZXpoPINYTIZbhVDMrff3II8qlxTugzlEYK5_SqF5Uf',
      },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: '#URBN-202609-1822',
    dateStr: '14 Sep 2026',
    status: 'COMPLETED',
    paymentMethod: 'BCA Virtual Account Lunas',
    subtotal: 219000,
    shippingFee: 12000,
    discount: 0,
    serviceFee: 0,
    total: 231000,
    courierName: 'SiCepat BEST',
    trackingNumber: 'SC0019283741',
    recipientName: 'Naya Rahmadani',
    recipientPhone: '+62 812-3456-4491',
    recipientEmail: 'naya.rahmadani@email.com',
    shippingAddress: 'Jl. Senopati Dalam No. 42B, Kebayoran Baru, Jakarta Selatan',
    receivedBy: 'Naya (Diterima Satpam Rumah)',
    items: [
      {
        name: 'Utility Minimalist Crossbody Pouch',
        color: 'Ultra Matte Black',
        size: 'OS',
        sku: 'URBN-BAG-007',
        quantity: 1,
        price: 219000,
        edition: 'Urban Essentials',
        reviewText: 'Ulasan: 5.0 (Sudah Dinilai)',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC5-yfa0Qu7RUVCdI2VnACYtc6r6jTcRMY1GIMtRf4fY9NrOH6Ho-_pUfyqy2pPvVZV_V1HKA3eBpyy-4MVuBcAeK7L9TgjnZqakJFcRcLRqgPhpMVyTijBijW76cOKio23bQYngNA88LXnyS8B-XEvzNX9I5GiC4rSNha_HnkIO321H2ZksX9AUgDKjKqQDMiD0uLRTV2Fdr_OC0RcOdHzpYk-Gk4oyf0wyhvYhIhz',
      },
    ],
  },
];

export const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Rumah',
    isPrimary: true,
    recipient: 'Naya Rahmadani (+62 812-3456-4491)',
    phone: '+62 812-3456-4491',
    fullAddress:
      'Jl. Senopati Dalam No. 42B, RT 04 / RW 02, Selong, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12110',
    courierNote: 'Catatan kurir: Pagar abu-abu, titipkan ke satpam pos jika tidak di tempat.',
  },
  {
    id: 'addr-2',
    label: 'Kantor',
    isPrimary: false,
    recipient: 'Naya Rahmadani - Treasury Tower Lt. 24',
    phone: '+62 812-3456-4491',
    fullAddress:
      'Pacific Century Place / SCBD Lot 10, Jl. Jend. Sudirman Kav. 52-53, Senayan, Kebayoran Baru, Jakarta Selatan 12190',
    courierNote: 'Catatan kurir: Resepsionis Office Lobby Lantai 1.',
  },
];

export const INITIAL_FIT_PROFILE: FitProfile = {
  height: 168,
  weight: 54,
  preference: 'oversized',
  recommendedTop: 'Size S / M',
  recommendedBottom: 'Size 27',
  calculatedSize: 'L',
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const formatDateId = (d: Date): string =>
  `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;

export const formatDateTimeId = (d: Date): string =>
  `${formatDateId(d)}, ${pad2(d.getHours())}:${pad2(d.getMinutes())} WIB`;

export const addDays = (d: Date, days: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
};

/** Rentang estimasi tiba, mis. "24 – 26 Nov 2026". */
export const formatEtaRange = (from: Date, minDays: number, maxDays: number): string => {
  const a = addDays(from, minDays);
  const b = addDays(from, maxDays);
  if (minDays === maxDays) return formatDateId(a);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return sameMonth
    ? `${a.getDate()} – ${formatDateId(b)}`
    : `${formatDateId(a)} – ${formatDateId(b)}`;
};

const randomDigits = (len: number): string =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');

/** Nomor order unik per pesanan, mis. #URBN-202611-4821. */
export const generateOrderNumber = (d = new Date()): string =>
  `#URBN-${d.getFullYear()}${pad2(d.getMonth() + 1)}-${randomDigits(4)}`;

/** Nomor VA demo (16 digit, dipisah per 4). Placeholder sampai ada gateway pembayaran. */
export const generateVaNumber = (): string =>
  ['8277', randomDigits(4), randomDigits(4), randomDigits(4)].join(' ');
