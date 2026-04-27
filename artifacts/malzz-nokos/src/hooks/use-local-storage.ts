import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Custom specialized hooks for the app
export interface ProfileData {
  name: string;
  photoBase64: string | null;
}

export function useProfile() {
  return useLocalStorage<ProfileData>("malzz:profile", { name: "Pengguna", photoBase64: null });
}

export interface OrderItem {
  id: string;
  number: string;
  serviceName: string;
  status: string;
  createdAt: string;
}

export function useOrderHistory() {
  return useLocalStorage<OrderItem[]>("malzz:orders", []);
}

export interface DepositItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export function useDepositHistory() {
  return useLocalStorage<DepositItem[]>("malzz:deposits", []);
}

export interface WithdrawItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export function useWithdrawHistory() {
  return useLocalStorage<WithdrawItem[]>("malzz:withdraws", []);
}
