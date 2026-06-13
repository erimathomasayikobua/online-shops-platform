export const generateSalesData = () => {
  return [
    { name: 'May 12', sales: 45000, orders: 32000, visitors: 22000 },
    { name: 'May 13', sales: 52000, orders: 38000, visitors: 28000 },
    { name: 'May 14', sales: 48000, orders: 35000, visitors: 25000 },
    { name: 'May 15', sales: 61000, orders: 42000, visitors: 32000 },
    { name: 'May 16', sales: 55000, orders: 39000, visitors: 29000 },
    { name: 'May 17', sales: 58000, orders: 41000, visitors: 31000 },
    { name: 'May 18', sales: 72000, orders: 48000, visitors: 38000 },
  ];
};

export const generateChannelData = () => {
  return [
    { name: 'Website', value: 62, amount: 773389.01, color: '#4F46E5' },
    { name: 'Mobile App', value: 24, amount: 299530.92, color: '#F59E0B' },
    { name: 'Marketplace', value: 9, amount: 112324.38, color: '#10B981' },
    { name: 'Others', value: 5, amount: 62801.19, color: '#8B5CF6' },
  ];
};
