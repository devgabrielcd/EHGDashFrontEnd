'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, Select, Space } from 'antd';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? 'http://localhost:8000';

const PERIOD_OPTIONS = [
  { label: 'Last 3 months', value: '3' },
  { label: 'Last 6 months', value: '6' },
  { label: 'Last 12 months', value: '12' },
  { label: 'Last 24 months', value: '24' },
  { label: 'YTD', value: 'ytd' },
];

function monthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
function buildLastNMonths(n) {
  const now = new Date();
  const startAnchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(startAnchor.getUTCFullYear(), startAnchor.getUTCMonth() - i, 1));
    months.push({
      key: monthKey(d),
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getUTCFullYear(),
      count: 0,
    });
  }
  return months;
}
function buildYTDMonths() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const lastMonthIndex = now.getUTCMonth(); // 0..11
  const months = [];
  for (let m = 0; m <= lastMonthIndex; m++) {
    const d = new Date(Date.UTC(year, m, 1));
    months.push({
      key: monthKey(d),
      label: d.toLocaleString('default', { month: 'short' }),
      year,
      count: 0,
    });
  }
  return months;
}

export default function RevenueChart({
  title = 'Clients Added',
  initialCompany = 'all',
  showCompanyFilter = true,
  initialPeriod = '12', // '3' | '6' | '12' | '24' | 'ytd'
}) {
  const [companyOptions, setCompanyOptions] = useState([{ label: 'All', value: 'all' }]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(initialCompany);

  const [period, setPeriod] = useState(initialPeriod);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Carregar empresas
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCompaniesLoading(true);
        const res = await fetch(`${API_BASE}/company/list/`, { cache: 'no-store' });
        const json = res.ok ? await res.json() : [];
        if (!alive) return;

        const opts = Array.isArray(json)
          ? json.filter((c) => c?.id && c?.name).map((c) => ({ label: c.name, value: String(c.id) }))
          : [];
        setCompanyOptions([{ label: 'All', value: 'all' }, ...opts]);

        const validValues = new Set(['all', ...opts.map((o) => o.value)]);
        setSelectedCompany((prev) => (validValues.has(String(prev)) ? String(prev) : 'all'));
      } catch (e) {
        console.error('Erro ao carregar empresas:', e);
        setCompanyOptions([{ label: 'All', value: 'all' }]);
        setSelectedCompany('all');
      } finally {
        if (alive) setCompaniesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [initialCompany]);

  // 2) URL de dados
  const url = useMemo(() => {
    if (selectedCompany && selectedCompany !== 'all') {
      return `${API_BASE}/sheets/sheet-data/?company=${encodeURIComponent(selectedCompany)}`;
    }
    return `${API_BASE}/sheets/sheet-data/`;
  }, [selectedCompany]);

  // 3) Fetch
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(url, { cache: 'no-store' });
        const json = res.ok ? await res.json() : [];
        if (!alive) return;
        setRows(Array.isArray(json) ? json : []);
      } catch (e) {
        console.error('Erro ao buscar sheet-data:', e);
        if (!alive) return;
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [url]);

  // 4) Agregação por período
  const series = useMemo(() => {
    const base =
      period === 'ytd'
        ? buildYTDMonths()
        : buildLastNMonths(Number.isNaN(Number(period)) ? 12 : Number(period));

    const indexByKey = new Map(base.map((m, i) => [m.key, i]));
    for (const r of rows) {
      const dt = r?.datetime ? new Date(r.datetime) : null;
      if (!dt || Number.isNaN(dt.getTime())) continue;
      const key = monthKey(dt);
      const idx = indexByKey.get(key);
      if (idx !== undefined) base[idx].count += 1;
    }

    return base.map((m, i, arr) => {
      const showYear = i === 0 || arr[i - 1].year !== m.year;
      const label = showYear ? `${m.label} ${m.year}` : m.label;
      return { name: label, count: m.count };
    });
  }, [rows, period]);

  // 5) Título dinâmico opcional
  const computedTitle =
    period === 'ytd' ? `${title} (YTD)` : `${title} (last ${period} months)`;

  return (
    <Card
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>{computedTitle}</span>
          <Space>
            <Select
              value={period}
              onChange={setPeriod}
              options={PERIOD_OPTIONS}
              style={{ width: 150 }}
            />
            {showCompanyFilter && (
              <Select
                value={selectedCompany}
                onChange={setSelectedCompany}
                options={companyOptions}
                loading={companiesLoading}
                style={{ width: 200 }}
              />
            )}
          </Space>
        </Space>
      }
    >
      <div style={{ height: 280 }} tabIndex={-1}>
        {loading ? (
          <div style={{ padding: 12 }}>Carregando gráfico...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Users added']} labelFormatter={(l) => l} />
              <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <style jsx global>{`
        .recharts-wrapper:focus,
        .recharts-surface:focus,
        .recharts-layer:focus {
          outline: none !important;
        }
      `}</style>
    </Card>
  );
}
