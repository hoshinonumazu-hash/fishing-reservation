"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [boatName, setBoatName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!email || !password || !name || !phone || !role || (role === "BOAT_OWNER" && !boatName)) {
      setError("全ての項目を入力してください。");
      return;
    }
    try {
      const res = await axios.post("/api/auth/register", { email, password, name, phone, role, boatName: role === "BOAT_OWNER" ? boatName : undefined });
      if (res.status === 201) {
        setSuccess(true);
        // 登録成功後、ログインページへリダイレクト
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(res.data.message || "登録に失敗しました。");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("サーバーエラーが発生しました。");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">新規登録</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">ユーザー種別</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="CUSTOMER">お客様として登録</option>
              <option value="BOAT_OWNER">釣り船オーナーとして登録</option>
            </select>
          </div>
          {role === "BOAT_OWNER" && (
            <div>
              <label className="block text-sm font-medium mb-1">釣り船名</label>
              <input
                type="text"
                value={boatName}
                onChange={e => setBoatName(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="例: カルモア丸"
                required={role === "BOAT_OWNER"}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">氏名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="山田 太郎"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">電話番号</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="090-1234-5678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="パスワード"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            新規登録
          </button>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">登録成功！ログインページへ移動します...</p>}
          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">
              ログインはこちら
            </Link>
          </div>
          </form>
        </div>
      </div>
  );
}
