"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  phoneNumber: string;
  name: string | null;
  role: string;
  approvalStatus: string;
  createdAt: string;
};

export default function AdminAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    if (!window.confirm(`本当に「${userName || "このユーザー"}」を削除しますか？`)) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("ユーザーを削除しました");
      fetchAllUsers();
    } else {
      alert("ユーザーの削除に失敗しました");
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      alert(status === "APPROVED" ? "承認しました" : "拒否しました");
      fetchAllUsers();
    } else {
      alert("ステータス更新に失敗しました");
    }
  };

  const getRoleLabel = (role: string) => ({ CUSTOMER: "顧客", BOAT_OWNER: "船オーナー", ADMIN: "管理者" }[role] || role);
  const getRoleColor = (role: string) => ({ CUSTOMER: "text-blue-600 bg-blue-50", BOAT_OWNER: "text-purple-600 bg-purple-50", ADMIN: "text-red-600 bg-red-50" }[role] || "text-gray-600 bg-gray-50");
  const getApprovalLabel = (status: string) => ({ PENDING: "承認待ち", APPROVED: "承認済み", REJECTED: "拒否" }[status] || status);
  const getApprovalColor = (status: string) => ({ PENDING: "text-yellow-600 bg-yellow-50", APPROVED: "text-green-600 bg-green-50", REJECTED: "text-gray-600 bg-gray-100" }[status] || "text-gray-600 bg-gray-50");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#1D3557] mb-4">
        <i className="fas fa-users mr-2 text-[#457B9D]"></i>
        アカウント管理
      </h1>
      <p className="text-lg text-gray-600 mb-8">全ユーザーアカウント（全{users.length}件）</p>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-500">読み込み中...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500">ユーザーがいません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">ユーザー名</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">メールアドレス</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">ロール</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">承認ステータス</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">登録日</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{user.name || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>{getRoleLabel(user.role)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.role === "BOAT_OWNER" ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getApprovalColor(user.approvalStatus)}`}>{getApprovalLabel(user.approvalStatus)}</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold text-gray-500 bg-gray-100">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString("ja-JP")}</td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-red-600 hover:text-red-800 font-semibold"><i className="fas fa-trash mr-1"></i>削除</button>
                        {user.role === "BOAT_OWNER" && user.approvalStatus !== "APPROVED" && (
                          <button onClick={() => handleUpdateStatus(user.id, "APPROVED")} className="ml-2 text-green-600 hover:text-green-800 font-semibold"><i className="fas fa-check mr-1"></i>承認する</button>
                        )}
                        {user.role === "BOAT_OWNER" && user.approvalStatus === "APPROVED" && (
                          <button onClick={() => handleUpdateStatus(user.id, "REJECTED")} className="ml-2 text-gray-600 hover:text-gray-800 font-semibold"><i className="fas fa-ban mr-1"></i>承認取り消し</button>
                        )}
                        <button
                          onClick={async () => {
                            const newPassword = window.prompt("新しいパスワードを入力してください（6文字以上）");
                            if (!newPassword || newPassword.length < 6) {
                              alert("パスワードは6文字以上で入力してください");
                              return;
                            }
                            const token = localStorage.getItem("token");
                            const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ newPassword }),
                            });
                            if (res.ok) {
                              alert("パスワードをリセットしました");
                            } else {
                              alert("パスワードリセットに失敗しました");
                            }
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <i className="fas fa-key mr-1"></i>パスワードリセット
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
