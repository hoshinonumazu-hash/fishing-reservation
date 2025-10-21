/**
 * 釣りプランの基本情報を表す型
 */
export type FishingPlan = {
  /** プランの一意のID */
  id: number;
  /** プランのタイトル */
  title: string;
  /** プランの詳細説明 */
  description: string;
  /** 釣り船の所在エリア（例: '三浦半島', '館山' など） */
  area: string;
  /** 対象魚種の配列 */
  fishTypes: string[];
  /** 基本料金（1人あたり） */
  price: number;
  /** 最大定員 */
  maxCapacity: number;
  /** 出港時刻（HH:mm形式） */
  departureTime: string;
  /** 帰港時刻（HH:mm形式） */
  returnTime: string;
  /** 集合場所 */
  meetingPlace: string;
  /** 船の画像URL（オプショナル） */
  imageUrl?: string;
  /** 船主ID（外部キー） */
  boatOwnerId: number;
};

/**
 * 検索フィルターの条件を表す型
 */
export interface Filter {
  area: string;
  fishType: string;
  minPrice: number;
  maxPrice: number;
}