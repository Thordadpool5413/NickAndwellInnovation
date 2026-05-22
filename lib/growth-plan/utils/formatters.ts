export function currency(value: number) { return `$${value.toLocaleString()}`; }
export function number(value: number) { return value.toLocaleString(); }
export function percent(value: number) { return `${value}%`; }
export function badgeTone(value: number) { return value > 0.7 ? 'green' : value > 0.4 ? 'amber' : 'red'; }
export function formatCurrency(value: number) { return `$${value.toLocaleString()}`; }
export function formatPercent(value: number) { return `${value}%`; }

