export function formatMoney(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0.00';
  }
  
  const rounded = Math.round(num * 100) / 100;
  return rounded.toFixed(2);
}

export function formatMoneyInput(value: string | number): string {
  return formatMoney(value);
}

export function parseMoney(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}