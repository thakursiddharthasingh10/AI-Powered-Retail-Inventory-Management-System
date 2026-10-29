import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  History,
  Truck,
  Building2,
  Users2,
  ShoppingCart,
  Receipt,
  TrendingUp,
  BrainCircuit,
  Bot,
  BarChart3,
  Users,
  ShieldCheck,
  Bell,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { hasRole, isAdmin, isManager, isStaff, isCashier } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight leading-tight">Retail Inventory</h2>
          <span className="text-[11px] text-slate-400 font-medium block">Management System</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
        {/* Dashboard */}
        <div>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </NavLink>
        </div>

        {/* Product Catalog */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Product Catalog
          </div>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Package className="w-4 h-4" />
            <span className="text-sm">Products</span>
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm">Categories</span>
          </NavLink>
        </div>

        {/* Inventory & Warehouses */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Inventory & Warehouses
          </div>
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Boxes className="w-4 h-4" />
            <span className="text-sm">Stock Overview</span>
          </NavLink>
          <NavLink
            to="/inventory/movements"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <History className="w-4 h-4" />
            <span className="text-sm">Movement Ledger</span>
          </NavLink>
          <NavLink
            to="/transfers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Truck className="w-4 h-4" />
            <span className="text-sm">Stock Transfers</span>
          </NavLink>
          <NavLink
            to="/warehouses"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Warehouses & Stores</span>
          </NavLink>
        </div>

        {/* Procurement */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Procurement
          </div>
          <NavLink
            to="/suppliers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Users2 className="w-4 h-4" />
            <span className="text-sm">Suppliers</span>
          </NavLink>
          <NavLink
            to="/purchase-orders"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Receipt className="w-4 h-4" />
            <span className="text-sm">Purchase Orders</span>
          </NavLink>
        </div>

        {/* Point of Sale */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Point of Sale
          </div>
          <NavLink
            to="/pos"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">POS Checkout</span>
          </NavLink>
          <NavLink
            to="/sales"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Receipt className="w-4 h-4" />
            <span className="text-sm">Sales & Invoices</span>
          </NavLink>
        </div>

        {/* AI Intelligence */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            AI Intelligence
          </div>
          <NavLink
            to="/ai/reorder"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <BrainCircuit className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Replenishment Logic</span>
          </NavLink>
          <NavLink
            to="/ai/forecast"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-sm">Demand Forecasting</span>
          </NavLink>
          <NavLink
            to="/ai/assistant"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">Retail AI Copilot</span>
          </NavLink>
        </div>

        {/* Administration */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Administration
          </div>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Executive Reports</span>
          </NavLink>
          {isAdmin() && (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Users & Roles</span>
              </NavLink>
              <NavLink
                to="/audit-logs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm">Security Audit Logs</span>
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
