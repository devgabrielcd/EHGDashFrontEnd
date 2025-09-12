'use client';

import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function RevenueChartClient({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(v) => [v, 'Users added']} />
        <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
