// format a number as currency based on the user's preference
export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// just the number with commas, no currency symbol
export const formatNumber = (amount) => {
  return new Intl.NumberFormat('en-KE').format(amount || 0);
};
