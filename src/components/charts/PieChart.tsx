import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Category } from '../../types';

type PieChartProps = {
  data: Array<{
    name: string;
    value: number;
    category?: Category;
  }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
};

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FF6B6B', '#6A7FDB', '#F7C59F', '#2D3047'
];

export default function PieChart({ 
  data, 
  title, 
  height = 300, 
  showLegend = true,
  formatValue = (value) => `${value.toFixed(2)}`
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-700">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => {
              // Use category color if available, otherwise use default colors
              const color = entry.category?.color 
                ? entry.category.color.replace('bg-', '') 
                : COLORS[index % COLORS.length];
              
              // Convert Tailwind color classes to hex
              const getHexColor = (colorClass: string) => {
                const colorMap: Record<string, string> = {
                  'red-500': '#EF4444',
                  'red-600': '#DC2626',
                  'blue-500': '#3B82F6',
                  'blue-600': '#2563EB',
                  'green-500': '#10B981',
                  'green-600': '#059669',
                  'yellow-500': '#F59E0B',
                  'purple-500': '#8B5CF6',
                  'pink-500': '#EC4899',
                  'indigo-500': '#6366F1',
                  'teal-500': '#14B8A6',
                  'orange-500': '#F97316',
                  'gray-500': '#6B7280',
                  'gray-600': '#4B5563',
                };
                
                return colorMap[colorClass] || COLORS[index % COLORS.length];
              };
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getHexColor(color)}
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}