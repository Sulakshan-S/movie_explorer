import { useEffect, useRef } from 'react';

/**
 * Custom hook for infinite scrolling using IntersectionObserver.
 * @param {Function} callback Callback when sentinel is in view
 * @param {boolean} hasMore Flag indicating more pages exist
 * @param {boolean} loading Flag indicating request is currently loading
 * @returns {React.RefObject} Ref to attach to sentinel element
 */
export const useInfiniteScroll = (callback, hasMore, loading) => {
  const sentinelRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMore && !loading) {
        callbackRef.current?.();
      }
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading]);

  return sentinelRef;
};

export default useInfiniteScroll;
