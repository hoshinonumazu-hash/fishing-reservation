"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Boat = {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  imageUrl: string;
  memo?: string | null;
  recentFish?: string | null;
  allowMultipleBookings?: boolean;
};

export default function EditBoatPage() {
  const router = useRouter();
  const params = useParams();
  const boatId = params.boatId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [boat, setBoat] = useState<Boat | null>(null);
  
  // フォームデータ
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [imageUrl, setImageUrl] = useState("");
  const [recentFish, setRecentFish] = useState(""); // 最近釣れている魚種
  const [memo, setMemo] = useState(""); // 一言メモ
  const [allowMultipleBookings, setAllowMultipleBookings] = useState(true); // 複数予約許可
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 認証チェック
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "BOAT_OWNER") {
      router.push("/login");
      return;
    }

    fetchBoat();
  }, [boatId, router]);

  const fetchBoat = async () => {
    try {
      const res = await fetch(`/api/owner/boats/${boatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setBoat(data);
        setName(data.name);
        setDescription(data.description || "");
        setLocation(data.location);
        setCapacity(data.capacity);
  setImageUrl(data.imageUrl || "");
  setRecentFish(data.recentFish || "");
  setMemo(data.memo || "");
  setAllowMultipleBookings(data.allowMultipleBookings ?? true);
      } else {
        setError("船舶情報の取得に失敗しました");
      }
    } catch (error) {
      console.error("船舶取得エラー:", error);
      setError("船舶情報の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/owner/boats/${boatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          description,
          location,
          capacity,
          imageUrl,
          recentFish,
          memo,
          allowMultipleBookings,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/owner/dashboard");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.message || "更新に失敗しました");
      }
    } catch (error) {
      console.error("更新エラー:", error);
      setError("更新処理中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">船舶が見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">船舶情報編集</h1>
        <p className="text-gray-600">船舶の情報を更新します</p>
      </div>

      <div className="info-card">
        <div className="flex items-center mb-6">
          <div className="boat-icon !text-3xl mr-3">
            <i className="fas fa-edit"></i>
          </div>
          <h2 className="text-2xl font-bold">{name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 船名 */}
            <div>
              <label className="form-label">
                <i className="fas fa-ship mr-2"></i>
                船名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="例: りょうこ丸"
                required
              />
            </div>

            {/* 一言メモ（説明） */}
            <div>
              <label className="form-label">
                <i className="fas fa-align-left mr-2"></i>
                紹介文・プロフィール
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="form-textarea"
                placeholder="船の特徴や設備、おすすめポイントなどを記入してください"
              />
            </div>

            {/* 一言メモ（DBのmemo） */}
            <div>
              <label className="form-label">
                <i className="fas fa-sticky-note mr-2"></i>
                一言メモ
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="form-input"
                placeholder="例: 今週はイナダ好調！"
              />
            </div>

            {/* エリア */}
            <div>
              <label className="form-label">
                <i className="fas fa-map-marker-alt mr-2"></i>
                出港エリア <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                placeholder="例: 沼津市戸田"
                required
              />
            </div>

            {/* 定員 */}
            <div>
              <label className="form-label">
                <i className="fas fa-users mr-2"></i>
                定員 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min="1"
                max="50"
                className="form-input"
                required
              />
            </div>

            {/* 画像URL */}
            <div>
              <label className="form-label">
                <i className="fas fa-image mr-2"></i>
                プロフィール写真URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <i className="fas fa-eye mr-1"></i>
                    プレビュー:
                  </p>
                  <img
                    src={imageUrl}
                    alt="船の画像"
                    className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* 最近釣れている魚種 */}
            <div>
              <label className="form-label">
                <i className="fas fa-fish mr-2"></i>
                最近釣れている魚種
              </label>
              <input
                type="text"
                value={recentFish}
                onChange={(e) => setRecentFish(e.target.value)}
                className="form-input"
                placeholder="例: マダイ、イサキ、アジ"
              />
              <p className="text-xs text-gray-500 mt-1">
                <i className="fas fa-info-circle mr-1"></i>
                カンマ区切りで複数入力可能
              </p>
            </div>

            {/* 複数予約設定 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowMultipleBookings}
                  onChange={(e) => setAllowMultipleBookings(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#457B9D] border-gray-300 rounded focus:ring-2 focus:ring-[#457B9D]"
                />
                <div>
                  <span className="block text-sm font-bold text-[#1D3557]">
                    <i className="fas fa-users-between-lines mr-2"></i>
                    同じ日に複数グループの予約を許可する（相乗りOK）
                  </span>
                  <p className="text-xs text-gray-600 mt-2">
                    <i className="fas fa-info-circle mr-1 text-[#457B9D]"></i>
                    チェックを外すと、1日1組限定（貸切のみ）になります。<br />
                    複数予約を許可する場合、2件目以降の予約は承認待ちとなり、オーナーが承認する必要があります。
                  </p>
                </div>
              </label>
            </div>

            {/* エラー・成功メッセージ */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <p className="text-red-700 flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <p className="text-green-700 flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  更新が完了しました！
                </p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                <i className="fas fa-times mr-2"></i>
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`quick-action-button flex-1 !px-6 !py-3 ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <i className="fas fa-save !text-xl !mb-0 mr-2"></i>
                {isSaving ? "更新中..." : "更新する"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
