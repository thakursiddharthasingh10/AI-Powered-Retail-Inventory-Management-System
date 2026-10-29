import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, RefreshCw, Calendar, CheckCircle2, AlertCircle, 
  Sparkles, Layers, ArrowRight, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { productsApi, aiApi } from '../services/api';

export const AiForecast = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [horizonDays, setHorizonDays] = useState(14);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productsApi.getActive().then((res) => {
      const prods = Array.isArray(res?.data) 
        ? res.data 
        : (Array.isArray(res) ? res : (Array.isArray(res?.data?.data) ? res.data.data : []));

      if (prods.length > 0) {
        setProducts(prods);
        setSelectedProductId(prods[0].id);
      }
    }).catch(err => {
      console.error('Failed to load active products', err);
    });
  }, []);

  const fetchForecast = (prodId, horizon) => {
    if (!prodId) return;
    setLoading(true);
    setError('');
    aiApi.generateForecast({
      productId: Number(prodId),
      horizonDays: Number(horizon),
      modelPreference: 'LINEAR_REGRESSION'
    })
      .then((res) => {
        const data = res?.data !== undefined ? res.data : res;
        setForecastData(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to generate demand forecast');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchForecast(selectedProductId, horizonDays);
    }
  }, [selectedProductId, horizonDays]);

  const chartPoints = forecastData?.forecastPoints?.map(p => ({
    date: p.date.substring(5), // MM-DD
    predicted: p.predictedQuantity,
    lower: p.lowerBound,
    upper: p.upperBound
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            AI Demand Forecasting Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Time-series demand projections using ordinary least-squares regression with chronological holdout validation.
          </p>
        </div>
        <button 
          onClick={() => fetchForecast(selectedProductId, horizonDays)} 
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2 self-start sm:self-auto border-slate-300 hover:bg-slate-50 text-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Recalculate Projections</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Bar: Product & Horizon Selection */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider shrink-0">
            Target Product:
          </label>
          <select
            className="input text-sm flex-1 font-medium bg-slate-50 border-slate-300"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.sku}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider shrink-0">
            Forecast Horizon:
          </span>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[7, 14, 30].map((h) => (
              <button
                key={h}
                onClick={() => setHorizonDays(h)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  horizonDays === h
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {h} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {forecastData?.totalPredictedDemand !== undefined ? `${forecastData.totalPredictedDemand} u` : '—'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Projected Demand</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {forecastData?.mae !== undefined ? `${forecastData.mae} u` : '—'}
            </div>
            <div className="text-xs text-emerald-600 font-medium">Regression Model MAE</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {forecastData?.rmse !== undefined ? `${forecastData.rmse} u` : '—'}
            </div>
            <div className="text-xs text-indigo-600 font-medium">Model RMSE Accuracy</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {forecastData?.baselineMae !== undefined ? `${forecastData.baselineMae} u` : '—'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Naive Baseline MAE</div>
          </div>
        </div>
      </div>

      {/* Interactive Forecast Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Projected Daily Demand Curve ({horizonDays}-Day Horizon) with 95% Confidence Bounds
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Predicted daily volume based on 30-day historical transaction velocity
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            {forecastData?.modelName || 'Linear Regression Time-Series'}
          </span>
        </div>

        <div className="h-80">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-medium text-slate-600">Fitting time-series regression parameters...</p>
            </div>
          ) : chartPoints.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">No forecast points generated for this product.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartPoints} margin={{ top: 15, right: 25, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" label={{ value: 'Units', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val, name) => [
                    `${val} units`, 
                    name === 'predicted' ? 'Predicted Demand' : (name === 'upper' ? 'Upper 95% Bound' : 'Lower 95% Bound')
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="upper" stroke="#93c5fd" strokeDasharray="4 4" name="Upper 95% Bound" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="predicted" stroke="#2563eb" strokeWidth={3} name="Predicted Daily Demand" activeDot={{ r: 6, fill: '#2563eb' }} />
                <Line type="monotone" dataKey="lower" stroke="#cbd5e1" strokeDasharray="4 4" name="Lower 95% Bound" dot={false} strokeWidth={1.5} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Methodology Notes */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900 font-semibold">Evaluation Methodology:</strong>{' '}
            {forecastData?.confidenceInterpretation || 
              'Model fitted across historical daily sales transactions using chronological train/test splitting to eliminate lookahead bias.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiForecast;
