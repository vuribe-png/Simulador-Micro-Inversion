
export function formatCurrency(num: number): string {
  if (!isFinite(num)) return 'S/ --';
  return 'S/ ' + num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(num: number): string {
  if (!isFinite(num)) return '--%';
  return (num * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

export function formatNumber(num: number, decimals = 2): string {
  if (!isFinite(num)) return '--';
  return num.toLocaleString('es-PE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
