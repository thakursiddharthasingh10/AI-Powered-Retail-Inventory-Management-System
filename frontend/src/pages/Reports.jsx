import React, { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, TrendingUp, PieChart, BarChart2 } from 'lucide-react';
import { reportsApi } from '../services/api';

export const Reports = () => {
  const [salesReport, setSalesReport] = useState(null);
  const [valuationReport, setValuationReport] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const loadReports = () => {
    setLoading(true);
    Promise.all([
      reportsApi.getSalesReport({ startDate, endDate }),
      reportsApi.getInventoryValuation()
    ]).then(([salesRes, valRes]) => {
      const s = salesRes?.data !== undefined ? salesRes.data : salesRes;
      if (s) setSalesReport(s);
      const v = Array.isArray(valRes?.data) ? valRes.data : (Array.isArray(valRes) ? valRes : []);
      if (v) setValuationReport(v);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    if (!salesReport || !salesReport.sales) return;
    const headers = ['Invoice Number', 'Date', 'Cashier', 'Customer', 'Subtotal', 'Tax', 'Discount', 'Total Amount', 'Payment Method'];
    const rows = salesReport.sales.map(s => [
      s.invoiceNumber,
      s.saleDate,
      s.cashierUser?.fullName || 'Cashier',
      `"${s.customerName}"`,
      s.subtotal,
      s.taxAmount,
      s.discountAmount,
      s.totalAmount,
      s.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `retail_sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>Executive Business Analytics</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Financial accounting metrics distinguishing Gross Sales, COGS, Tax, and true Gross Operating Profit
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-secondary">
          <Download size={16} /> Export CSV Report
        </button>
      </div>

      {/* Date Filter */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Calendar size={18} color="var(--text-muted)" />
          <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Accounting Period:</span>
          <input
            type="date"
            className="form-input"
            style={{ width: '170px' }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            style={{ width: '170px' }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid-cols-4">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-label">Gross Merchandise Value</div>
            <div className="kpi-value">₹{Number(salesReport?.grossSalesValue || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <div className="kpi-label">Cost of Goods Sold (COGS)</div>
            <div className="kpi-value">₹{Number(salesReport?.costOfGoodsSold || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="kpi-label">Estimated Gross Profit</div>
            <div className="kpi-value">₹{Number(salesReport?.estimatedGrossProfit || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <PieChart size={24} />
          </div>
          <div>
            <div className="kpi-label">Gross Profit Margin %</div>
            <div className="kpi-value">{salesReport?.profitMarginPct || 0}%</div>
          </div>
        </div>
      </div>

      {/* Tax & Net Revenue Cards */}
      <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '12px' }}>Revenue & Tax Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span>Gross Sales (Before Tax & Discounts):</span>
              <strong style={{ color: 'var(--primary)' }}>₹{Number(salesReport?.grossSalesValue || 0).toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span>Total Discounts Granted:</span>
              <span style={{ color: 'var(--danger)' }}>-₹{Number(salesReport?.totalDiscounts || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span>Total GST Taxes Collected:</span>
              <span style={{ color: 'var(--accent)' }}>+₹{Number(salesReport?.totalTaxesCollected || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, paddingTop: '4px' }}>
              <span>Net Cash & Digital Revenue Inflow:</span>
              <span style={{ color: 'var(--success)' }}>₹{Number(salesReport?.netRevenue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '12px' }}>Operational Statistics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span>Total Invoices Processed:</span>
              <strong>{salesReport?.totalTransactions || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span>Total Merchandise Units Sold:</span>
              <strong>{salesReport?.totalUnitsSold || 0} units</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span>Average Basket Size:</span>
              <strong>
                ₹{salesReport?.totalTransactions > 0 
                  ? (Number(salesReport.netRevenue) / salesReport.totalTransactions).toFixed(2) 
                  : '0.00'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Inventory Valuation */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>
          Physical Warehouse Inventory Valuation (Cost vs Retail Basis)
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Warehouse Facility</th>
                <th>Distinct SKUs</th>
                <th>Total Units</th>
                <th>Cost-Basis Valuation</th>
                <th>Retail-Basis Valuation</th>
                <th>Unrealized Potential Margin</th>
              </tr>
            </thead>
            <tbody>
              {valuationReport.map((row) => (
                <tr key={row.warehouseId}>
                  <td style={{ fontWeight: 600 }}>{row.warehouseName} ({row.warehouseCode})</td>
                  <td>{row.skuCount}</td>
                  <td>{Number(row.totalUnits).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(row.costValuation).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(row.retailValuation).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                    ₹{Number(row.potentialGrossMargin).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
