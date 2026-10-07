import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scrolling using IntersectionObserver.
 * @param {Function} callback Callback when sentinel is in view
 * @param {boolean} hasMore Flag indicating more pages exist
 * @param {boolean} isLoading Flag indicating request is pending
 * @returns {React.RefObject} Ref to attach to sentinel element
 */
export const useInfiniteScroll = (callback, hasMore, isLoading) => {
  const observerRef = useRef(null);

  const sentinelRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [callback, hasMore, isLoading]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return sentinelRef;
};

export default useInfiniteScroll;
