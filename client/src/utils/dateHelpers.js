import { format, parseISO, isValid, startOfMonth, endOfMonth } from 'date-fns';

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, pattern) : '';
};

export const formatDateShort = (date) => formatDate(date, 'MMM d');

export const formatMonthYear = (date) => formatDate(date, 'MMMM yyyy');

export const toInputDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, 'yyyy-MM-dd') : '';
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    startDate: startOfMonth(now).toISOString(),
    endDate: endOfMonth(now).toISOString(),
  };
};
