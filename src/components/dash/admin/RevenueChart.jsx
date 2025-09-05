'use client';

import React from 'react';
import { Card } from 'antd';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

// mock de dados — troque por fetch/RTK quando tiver
const data = [
  { name: 'Jan', revenue: 12_000 },
  { name: 'Fev', revenue: 16_500 },
  { name: 'Mar', revenue: 14_200 },
  { name: 'Abr', revenue: 18_900 },
  { name: 'Mai', revenue: 20_300 },
  { name: 'Jun', revenue: 22_100 },
  { name: 'Jul', revenue: 21_400 },
  { name: 'Ago', revenue: 24_700 },
  { name: 'Set', revenue: 23_600 },
  { name: 'Out', revenue: 26_900 },
  { name: 'Nov', revenue: 28_100 },
  { name: 'Dez', revenue: 31_500 },
];

export default function RevenueChart({ title = 'Revenue' }) {
  return (
    <Card title={title}>
      {/* wrapper sem foco pra não criar outline */}
      <div style={{ height: 280 }} tabIndex={-1}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `R$ ${v / 1000}k`} />
            <Tooltip formatter={(v) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Remove outline de foco dos elementos do Recharts */}
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
