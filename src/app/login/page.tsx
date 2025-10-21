"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Header from "@/components/Header";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.status === 200) {
        setSuccess(true);
        // localStorageに保存
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        if (res.data.user && res.data.user.name) {
          localStorage.setItem('userName', res.data.user.name);
        } else {
          localStorage.removeItem('userName');
        }
        if (res.data.user && res.data.user.email) {
          localStorage.setItem('userEmail', res.data.user.email);
        } else {
          localStorage.removeItem('userEmail');
        }
        if (res.data.user && res.data.user.phone) {
          localStorage.setItem('userPhone', res.data.user.phone);
        } else {
          localStorage.removeItem('userPhone');
        }
        if (res.data.user && res.data.user.role) {
          localStorage.setItem('role', res.data.user.role);
        } else {
          localStorage.removeItem('role');
        }

        // ログイン成功後、トップページへリダイレクト
        setTimeout(() => {
          router.push('/');
          // ページリロードしてHeaderを更新
          window.location.href = '/';
        }, 500);
      } else {
        setError(res.data.message || "ログインに失敗しました。");
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
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
            ログイン
          </button>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">ログイン成功（仮）</p>}
          <div className="text-center mt-4">
            <Link href="/register" className="text-blue-600 hover:underline">
              新規登録はこちら
            </Link>
          </div>
          </form>
        </div>
      </div>
    </>
  );
}
