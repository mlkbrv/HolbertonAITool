export function isInstagramInput(value: string): boolean {
  const s = value.trim();
  if (!s) return false;
  if (/instagram\.com/i.test(s)) return true;
  if (/^@[A-Za-z0-9._]{1,30}$/.test(s)) return true;
  return /^[A-Za-z0-9._]{1,30}$/.test(s) && !s.includes(' ');
}
