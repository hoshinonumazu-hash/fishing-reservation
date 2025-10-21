// 釣り船予約サイト - 型定義
// docs/REQUIREMENTS_DRAFT.md のデータモデルに基づく

// ユーザーロール
export type UserRole = 'user' | 'owner' | 'admin';

// 予約ステータス
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// ユーザー（釣り客・船オーナー・管理者）
export interface User {
  id: string;           // UUID
  email: string;        // ログインID（一意）
  password: string;     // ハッシュ化済み
  name: string;         // 氏名
  phone?: string;       // 電話番号（予約時必須）
  role: UserRole;       // 権限
  isActive: boolean;    // 有効/無効
  createdAt: Date;
  updatedAt: Date;
}

// 船舶
export interface Boat {
  id: string;           // UUID
  name: string;         // 船名
  ownerId: string;      // User.id（船長）
  area: string;         // エリア（三浦半島等）
  contact: string;      // 連絡先
  description?: string; // 紹介文
  imageUrl?: string;    // 船の写真
  isActive: boolean;    // 営業中/休業中
  createdAt: Date;
  updatedAt: Date;
}

// 釣りプラン
export interface FishingPlan {
  id: string;           // UUID
  boatId: string;       // Boat.id
  title: string;        // プラン名
  description: string;  // 説明
  fishTypes: string[];  // 対象魚種
  price: number;        // 料金（円）
  maxCapacity: number;  // 定員
  departureTime: string; // 出船時間（HH:mm）
  returnTime: string;   // 帰港時間（HH:mm）
  meetingPlace: string; // 集合場所
  availableDays: string[]; // 実施曜日
  date?: string;        // 実施日（ISO文字列）
  imageUrl?: string;    // プラン画像
  isActive: boolean;    // 公開/非公開
  createdAt: Date;
  updatedAt: Date;
}

// 予約
export interface Booking {
  id: string;           // UUID
  planId: string;       // FishingPlan.id
  userId: string;       // User.id
  bookingDate: Date;    // 予約日
  headcount: number;    // 参加人数
  status: BookingStatus;
  customerName: string; // 予約者名
  customerPhone: string; // 連絡先（必須）
  specialRequests?: string; // 特記事項
  totalAmount: number;  // 合計金額
  createdAt: Date;
  updatedAt: Date;
}

// API レスポンス型
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// プラン検索パラメータ
export interface PlanSearchParams {
  fishType?: string;    // 魚種フィルタ
  area?: string;        // エリアフィルタ
  date?: string;        // 日付フィルタ（YYYY-MM-DD）
  boatName?: string;    // 船名検索
  minPrice?: number;    // 最低料金
  maxPrice?: number;    // 最高料金
  page?: number;        // ページ番号
  limit?: number;       // 件数（デフォルト20）
}

// プラン検索結果
export interface PlanSearchResult {
  plans: FishingPlan[];
  total: number;
  page: number;
  totalPages: number;
}

// プラン詳細（船情報含む）
export interface PlanDetail extends FishingPlan {
  boat: Boat;
  availableSlots: number; // 空き状況
}

// 予約作成リクエスト
export interface CreateBookingRequest {
  planId: string;
  bookingDate: string;  // YYYY-MM-DD
  headcount: number;
  customerName: string;
  customerPhone: string; // 電話番号必須
  specialRequests?: string;
}

// マイページ用予約情報
export interface MyBooking extends Booking {
  plan: FishingPlan;
  boat: Boat;
}

// フィルター状態
export interface SearchFilters {
  fishType: string;
  date: string;
  boatName: string;
  area: string;
  minPrice: number;
  maxPrice: number;
}
