export function pickArray(json: any, keys: string[]): any[] {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== 'object') return [];
  
  for (const key of keys) {
    if (Array.isArray(json[key])) {
      return json[key];
    }
  }
  
  // Last resort: search values
  for (const val of Object.values(json)) {
    if (Array.isArray(val)) {
      return val;
    }
  }
  
  return [];
}

export function pickObject(json: any, keys: string[]): any {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return json;
  
  for (const key of keys) {
    if (json[key] && typeof json[key] === 'object' && !Array.isArray(json[key])) {
      return json[key];
    }
  }
  
  return json; // fallback to root
}

export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
