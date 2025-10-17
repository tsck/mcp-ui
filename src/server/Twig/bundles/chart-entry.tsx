import React from 'react';
import { createRoot } from 'react-dom/client';
import { Chart, Line } from '@lg-charts/core';

interface ClusterMetrics {
  name: string;
  data: Array<[string, number]>;
}

// Expose a global function to render charts
declare global {
  interface Window {
    renderChart: (containerId: string, data: Array<ClusterMetrics>) => void;
  }
}

window.renderChart = (containerId: string, data: Array<ClusterMetrics>) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(
    <Chart>
      {data.map((item, index) => (
        <Line key={index} name={item.name} data={item.data} />
      ))}
    </Chart>
  );
};

