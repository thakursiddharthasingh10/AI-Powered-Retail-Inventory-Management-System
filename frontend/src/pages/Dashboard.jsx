import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  Warehouse,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { reportsApi, inventoryApi } from '../services/api';
import Badge from '../components/Badge';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      reportsApi.getDashboardMetrics(),
      inventoryApi.getLowStock()
    ])
      .then(([metricsRes, lowStockRes]) => {
        const m = metricsRes?.data !== undefined ? metricsRes.data : metricsRes;
        setMetrics(m);
        const ls = Array.isArray(lowStockRes?.data) 
          ? lowStockRes.data 
          : (Array.isArray(lowStockRes) ? lowStockRes : []);
        setLowStockItems(ls);
      })
      .catch((err) => console.error('Failed to load dashboard metrics', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const chartData = metrics?.topSellingProducts?.map(p => ({
    name: p.productName.length > 18 ? p.productName.substring(0, 18) + '...' : p.productName,
    unitsSold: p.unitsSold,
    revenue: p.totalSales
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Retail Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-warehouse inventory status, POS sales volume, and AI decision alerts
          </p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2 self-start sm:self-auto border-slate-200 hover:bg-slate-50 text-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Row 1: Stock Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-12 rounded inline-block" /> : (metrics?.totalProducts || 0)}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Catalog SKUs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-16 rounded inline-block" /> : (metrics?.totalInventoryUnits?.toLocaleString() || 0)}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Inventory Units</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-10 rounded inline-block" /> : (metrics?.lowStockCount || 0)}
            </div>
            <div className="text-xs text-amber-600 font-medium">Low-Stock SKUs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-8 rounded inline-block" /> : (metrics?.outOfStockCount || 0)}
            </div>
            <div className="text-xs text-red-600 font-medium">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 2: Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-20 rounded inline-block" /> : `₹${Number(metrics?.salesToday || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-500 font-medium">Today's Sales Revenue</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-24 rounded inline-block" /> : `₹${Number(metrics?.salesThisMonth || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-500 font-medium">Monthly Sales Revenue</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-24 rounded inline-block" /> : `₹${Number(metrics?.totalRevenue || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-500 font-medium">All-Time Cumulative Revenue</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? <span className="animate-pulse bg-slate-200 h-7 w-24 rounded inline-block" /> : `₹${Number(metrics?.inventoryCostValuation || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-500 font-medium">Inventory Cost Valuation</div>
          </div>
        </div>
      </div>

      {/* Analytics & Warning Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Products Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top-Selling Products by Units</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by historical units sold</p>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Package className="w-8 h-8 mb-2 stroke-1" />
                <span className="text-xs">No sales transaction data available</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} textAnchor="end" stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip 
                    formatter={(val, name) => [name === 'unitsSold' ? `${val} units` : `₹${Number(val).toLocaleString()}`, name === 'unitsSold' ? 'Units Sold' : 'Revenue']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="unitsSold" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Low Stock Replenishment Warnings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Low Stock Replenishment Alerts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Items currently at or below safety reorder levels</p>
            </div>
            <Link to="/ai/reorder" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Replenishment AI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-3 text-right">Reorder Level</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <span>All product stocks are within healthy thresholds.</span>
                    </td>
                  </tr>
                ) : (
                  lowStockItems.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {inv.product?.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {inv.warehouse?.code || inv.warehouse?.name}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${inv.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {inv.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {inv.product?.reorderLevel}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={inv.quantity === 0 ? 'danger' : 'warning'}>
                          {inv.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Stock Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Double-Entry Stock Ledger Movements</h2>
            <p className="text-xs text-slate-500 mt-0.5">Immutable audit trail of inventory debits and credits</p>
          </div>
          <Link to="/inventory/movements" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Warehouse</th>
                <th className="py-2.5 px-3">Movement Type</th>
                <th className="py-2.5 px-3 text-right">Delta</th>
                <th className="py-2.5 px-3 text-right">Balance After</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!metrics?.recentMovements || metrics.recentMovements.length === 0) ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span>No recent stock movements recorded.</span>
                  </td>
                </tr>
              ) : (
                metrics.recentMovements.slice(0, 8).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                      {m.productSku}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-xs">
                      {m.productName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {m.warehouseName}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={
                        m.movementType === 'PURCHASE_RECEIPT' || m.movementType === 'ADJUSTMENT_IN' || m.movementType === 'TRANSFER_IN' 
                          ? 'success' 
                          : (m.movementType === 'SALE_DEDUCTION' || m.movementType === 'ADJUSTMENT_OUT' || m.movementType === 'TRANSFER_OUT' ? 'danger' : 'info')
                      }>
                        {m.movementType}
                      </Badge>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${m.quantityChanged > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {m.balanceAfter}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">
                      {m.reason || 'Standard operation'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {m.actorUsername || 'system'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
