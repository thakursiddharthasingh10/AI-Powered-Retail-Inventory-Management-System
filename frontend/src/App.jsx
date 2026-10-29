import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import POS from './pages/POS';
import SalesHistory from './pages/SalesHistory';
import Warehouses from './pages/Warehouses';
import Transfers from './pages/Transfers';
import Reports from './pages/Reports';
import AiForecast from './pages/AiForecast';
import AiReorder from './pages/AiReorder';
import AiAssistant from './pages/AiAssistant';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Authenticated Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* All authenticated users */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Catalog & Inventory: ADMIN, MANAGER, INVENTORY_STAFF */}
        <Route
          path="products"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF']}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="categories"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF']}>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF']}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/movements"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF']}>
              <StockMovements />
            </ProtectedRoute>
          }
        />

        {/* Warehouses & Transfers */}
        <Route
          path="warehouses"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
              <Warehouses />
            </ProtectedRoute>
          }
        />
        <Route
          path="transfers"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF']}>
              <Transfers />
            </ProtectedRoute>
          }
        />

        {/* Suppliers & Procurement */}
        <Route
          path="suppliers"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
              <PurchaseOrders />
            </ProtectedRoute>
          }
        />

        {/* Sales & POS: ADMIN, MANAGER, CASHIER */}
        <Route
          path="pos"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CASHIER']}>
              <POS />
            </ProtectedRoute>
          }
        />
        <Route
          path="sales"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CASHIER']}>
              <SalesHistory />
            </ProtectedRoute>
          }
        />

        {/* Analytics & Reports: ADMIN, MANAGER */}
        <Route
          path="reports"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* AI Intelligence Suite: ADMIN, MANAGER */}
        <Route
          path="ai/forecast"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
              <AiForecast />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai/reorder"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
              <AiReorder />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai/assistant"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF', 'ROLE_CASHIER']}>
              <AiAssistant />
            </ProtectedRoute>
          }
        />

        {/* Admin Only System Modules */}
        <Route
          path="users"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}