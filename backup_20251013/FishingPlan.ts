// 型の単一出所は最終的に src/types/index.ts に寄せるが、
// 現状 root の App Router が `@/FishingPlan` を参照しているため
// ランタイムエラー回避のため暫定的にここで型を定義/再輸出する。

export type FishingPlan = {
	id: number;
	title: string;
	description: string;
	area: string;
	fishTypes: string[];
	price: number;
	maxCapacity: number;
	departureTime: string;
	returnTime: string;
	meetingPlace: string;
	imageUrl?: string;
	// 旧仕様・新仕様の両対応
	boatOwnerId?: number;
	boatId?: number;
	weekday?: string;
};

export type Filter = {
	area: string;
	fishType: string;
	minPrice: number;
	maxPrice: number;
};

