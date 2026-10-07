import { useState, useCallback } from 'react';

/**
 * Custom hook to safely sync state with localStorage.
 * @param {string} key
 * @param {any} initialValue
 * @returns {[any, Function]}
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined) return initialValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error parsing localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error saving localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
};

export default useLocalStorage;
