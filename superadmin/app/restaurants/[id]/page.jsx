'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Shell from '../../../components/Shell';

const STATUS_OPTIONS = ['trial', 'active', 'suspended', 'cancelled'];

export default function RestaurantDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [tab, setTab] = useState('overview');
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'cashier' });
  const [saving, setSaving] = useState(false);
  const [subForm, setSubForm] = useState({});

  function h() { return { Authorization: `Bearer ${localStorage.getItem('saToken')}` }; }

  async function load() {
    const [detail, planRes] = await Promise.all([
      axios.get(`/api/superadmin/restaurants/${id}`, { headers: h() }),
      axios.get('/api/superadmin/plans', { headers: h() }),
    ]);
    setData(detail.data);
    setPlans(planRes.data.plans);
    setSubForm({
      status: detail.data.subscription?.status || 'trial',
      planId: detail.data.subscription?.plan_id?._id || '',
    });
  }

  useEffect(() => { load(); }, [id]);

  async function updateSub(e) {
    e.preventDefault();
    await axios.patch(`/api/superadmin/restaurants/${id}/subscription`, subForm, { headers: h() });
    load();
  }

  async function addStaff(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`/api/superadmin/restaurants/${id}/staff`, newStaff, { headers: h() });
      setNewStaff({ name: '', phone: '', role: 'cashier' });
      load();
    } finally { setSaving(false); }
  }

  async function removeStaff(staffId) {
    if (!confirm('Remove this staff member?')) return;
    await axios.delete(`/api/superadmin/staff/${staffId}`, { headers: h() });
    load();
  }

  if (!data) return <Shell><p className="text-slate-400">Loading...</p></Shell>;

  const { restaurant, subscription, staff, stats } = data;

  return (
    <Shell>
      <button onClick={() => router.back()} className="text-slate-400 text-sm mb-4 hover:text-white">← Back</button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
          style={{ background: restaurant.brand_color || '#1e293b', color: restaurant.accent_color || '#fff' }}>
          {restaurant.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-slate-400 text-sm">/{restaurant.slug}</p>
        </div>
        <div className="ml-auto flex gap-2 text-sm">
          <a href={`http://localhost:3002/${restaurant.slug}`} target="_blank"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition">
            View Landing ↗
          </a>
          <a href={`http://localhost:3004?restaurantId=${restaurant._id}`} target="_blank"
            className="px-4 py-2 bg-violet-700 hover:bg-violet-600 rounded-xl transition">
            View Dashboard ↗
          </a>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400">Customers</p>
          <p className="text-2xl font-bold text-blue-400">{stats.customerCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400">Transactions</p>
          <p className="text-2xl font-bold text-green-400">{stats.txCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400">Staff Members</p>
          <p className="text-2xl font-bold text-violet-400">{staff.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2">
        {['overview', 'subscription', 'staff'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === t ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-sm max-w-lg">
          {[
            ['Points per PKR 100', restaurant.points_per_100],
            ['Reward Threshold', `${restaurant.reward_threshold} pts`],
            ['Reward Description', restaurant.reward_description],
            ['Brand Color', restaurant.brand_color],
            ['Created', new Date(restaurant.createdAt).toLocaleDateString()],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'subscription' && (
        <form onSubmit={updateSub} className="max-w-md space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Plan</label>
              <select value={subForm.planId} onChange={(e) => setSubForm({ ...subForm, planId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none">
                <option value="">No plan</option>
                {plans.map((p) => <option key={p._id} value={p._id}>{p.name} — ₨{p.price_monthly}/mo</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select value={subForm.status} onChange={(e) => setSubForm({ ...subForm, status: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <button type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition">
              Update Subscription
            </button>
          </div>
        </form>
      )}

      {tab === 'staff' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-800">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s._id} className="border-b border-slate-800">
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-slate-400">{s.phone}</td>
                    <td className="px-5 py-3 capitalize text-slate-300">{s.role}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => removeStaff(s._id)}
                        className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </td>
                  </tr>
                ))}
                {!staff.length && (
                  <tr><td colSpan={4} className="text-center text-slate-500 py-6">No staff yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={addStaff} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-sm text-slate-300">Add Staff Member</h3>
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Name" required value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
              <input placeholder="+92..." required value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
              <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="bg-violet-600 hover:bg-violet-500 px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Staff'}
            </button>
          </form>
        </div>
      )}
    </Shell>
  );
}
