import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Order } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalyticsProps {
  orders: Order[];
}

const COLORS = ['#A8A29E', '#2563EB', '#16A34A', '#E8622A'];

const Analytics: React.FC<AnalyticsProps> = ({ orders }) => {
  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED').length;

  const hourlyData = [
    { hour: '11am', orders: 12 },
    { hour: '12pm', orders: 25 },
    { hour: '1pm',  orders: 32 },
    { hour: '2pm',  orders: 18 },
    { hour: '5pm',  orders: 22 },
    { hour: '6pm',  orders: 38 },
    { hour: '7pm',  orders: 45 },
    { hour: '8pm',  orders: 34 },
    { hour: '9pm',  orders: 15 },
  ];

  const statusData = [
    { name: 'Pending',  value: orders.filter(o => o.status === 'PENDING').length },
    { name: 'Preparing',value: orders.filter(o => o.status === 'PREPARING').length },
    { name: 'Ready',    value: orders.filter(o => o.status === 'READY').length },
    { name: 'Delivered',value: completedOrders },
  ].filter(d => d.value > 0);

  const exportPDF = () => {
    const input = document.getElementById('analytics-report');
    if (!input) return;
    html2canvas(input, { scale: 2, backgroundColor: '#F7F3EE' }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Atot_Report.pdf');
    });
  };

  const stats = [
    { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, trend: '+12.5%', up: true },
    { label: 'Orders Delivered', value: completedOrders.toString(), trend: '+4.2%', up: true },
    { label: 'Avg Order Value', value: `ETB ${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, trend: '-1.2%', up: false },
    { label: 'Active Orders', value: activeOrders.toString(), trend: undefined, up: true },
  ];

  return (
    <div id="analytics-report" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 800, margin: 0 }}>Performance Report</h2>
          <p style={{ fontSize: '13px', color: '#78716C', margin: '4px 0 0', fontWeight: 500 }}>Real-time operations & revenue analytics</p>
        </div>
        <button className="dashboard-btn primary" onClick={exportPDF}>
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* Stats */}
      <div className="analytics-grid">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
            {stat.trend && (
              <div className={`stat-trend ${stat.up ? 'up' : 'down'}`}>
                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.trend} vs yesterday
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Hourly Traffic</h3>
          </div>
          <ResponsiveContainer width="100%" height="82%">
            <BarChart data={hourlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E1" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#78716C', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#78716C', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1.5px solid #EDE8E1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontFamily: 'DM Sans' }}
                itemStyle={{ color: '#E8622A', fontWeight: 700 }}
                cursor={{ fill: 'rgba(232,98,42,0.06)' }}
              />
              <Bar dataKey="orders" fill="#E8622A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Distribution</h3>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="82%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1.5px solid #EDE8E1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', fontWeight: 600, fontFamily: 'DM Sans' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#A8A29E', fontSize: '13px', fontWeight: 600 }}>
              No order data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
