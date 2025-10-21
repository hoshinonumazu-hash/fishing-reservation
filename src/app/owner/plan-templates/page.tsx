'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Boat {
  id: string;
  name: string;
}

interface PlanTemplate {
  id: string;
  name: string;
  description?: string;
  fishType: string;
  price: number;
  departureTime: string;
  returnTime: string;
  maxPeople: number;
  boatId: string;
  boat: Boat;
  createdAt: string;
}

export default function PlanTemplatesPage() {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PlanTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fishType: '',
    price: '',
    departureTime: '',
    returnTime: '',
    maxPeople: '',
    boatId: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchBoats();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('/api/owner/plan-templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('テンプレート取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/owner/boats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBoats(data);
      }
    } catch (error) {
      console.error('船舶取得エラー:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingTemplate 
        ? `/api/owner/plan-templates/${editingTemplate.id}`
        : '/api/owner/plan-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingTemplate ? 'テンプレートを更新しました' : 'テンプレートを作成しました');
        setShowForm(false);
        setEditingTemplate(null);
        resetForm();
        fetchTemplates();
      } else {
        const error = await response.json();
        alert(error.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const handleEdit = (template: PlanTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      fishType: template.fishType,
      price: template.price.toString(),
      departureTime: template.departureTime || '',
      returnTime: template.returnTime || '',
      maxPeople: template.maxPeople.toString(),
      boatId: template.boatId
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このテンプレートを削除しますか?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/owner/plan-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('テンプレートを削除しました');
        fetchTemplates();
      } else {
        const error = await response.json();
        alert(error.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      fishType: '',
      price: '',
      departureTime: '',
      returnTime: '',
      maxPeople: '',
      boatId: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">プランテンプレート管理</h1>
            <p className="text-gray-600">よく使うプランをテンプレートとして保存できます</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="quick-action-button !px-6 !py-3 !rounded-lg"
          >
            <i className={`fas ${showForm ? 'fa-times' : 'fa-plus-circle'} !text-2xl !mb-0 mr-2`}></i>
            <span>{showForm ? 'キャンセル' : '新規作成'}</span>
          </button>
        </div>
      </div>

      <div className="info-card mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">テンプレート一覧</h2>
          <p className="text-sm text-gray-600">繰り返し使うプランを登録して、日付指定だけで簡単に追加できます</p>
        </div>

        {showForm && (
          <div className="info-card bg-gradient-to-br from-blue-50 to-white mb-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <i className="fas fa-edit boat-icon !text-xl mr-2"></i>
              {editingTemplate ? 'テンプレート編集' : '新規テンプレート作成'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">テンプレート名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: プランA、半日コース"
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">対象船舶 *</label>
                <select
                  value={formData.boatId}
                  onChange={(e) => setFormData({ ...formData, boatId: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                  disabled={!!editingTemplate}
                >
                  <option value="">選択してください</option>
                  {boats.map(boat => (
                    <option key={boat.id} value={boat.id}>{boat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">魚種 *</label>
                <input
                  type="text"
                  value={formData.fishType}
                  onChange={(e) => setFormData({ ...formData, fishType: e.target.value })}
                  placeholder="例: タイ、アジ"
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">料金(円) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">出港時刻 *</label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">帰港時刻 *</label>
                  <input
                    type="time"
                    value={formData.returnTime}
                    onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">定員 *</label>
                  <input
                    type="number"
                    value={formData.maxPeople}
                    onChange={(e) => setFormData({ ...formData, maxPeople: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">説明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="quick-action-button !px-8 !py-3 !rounded-lg"
                >
                  <i className="fas fa-save !text-xl !mb-0 mr-2"></i>
                  {editingTemplate ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 font-medium transition"
                >
                  <i className="fas fa-times mr-2"></i>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {templates.length === 0 ? (
          <div className="info-card p-12 text-center">
            <div className="boat-icon mb-4">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <p className="text-gray-500 text-lg font-semibold mb-2">まだテンプレートがありません</p>
            <p className="text-gray-400">「新規作成」からテンプレートを登録しましょう</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <div key={template.id} className="info-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <i className="fas fa-ship boat-icon !text-base mr-1"></i>
                      {template.boat.name}
                    </p>
                  </div>
                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <i className="fas fa-fish"></i>
                    {template.fishType}
                  </span>
                </div>

                {template.description && (
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{template.description}</p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4 text-sm bg-gray-50 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-1">料金</p>
                    <p className="font-bold boat-link">¥{template.price.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-1">時間</p>
                    <p className="font-bold text-xs">{template.departureTime}～{template.returnTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-1">定員</p>
                    <p className="font-bold">{template.maxPeople}名</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 boat-link py-2 px-4 rounded-lg border-2 border-current hover:bg-blue-50 text-sm font-medium transition"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 text-sm font-medium transition"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
