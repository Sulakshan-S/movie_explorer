import { POSTER_BASE_URL, BACKDROP_BASE_URL, PLACEHOLDER_POSTER } from './constants';

/**
 * Returns complete image URL or fallback placeholder.
 * @param {string|null} path
 * @param {'poster'|'backdrop'} type
 * @returns {string}
 */
export const getImageUrl = (path, type = 'poster') => {
  if (!path) return PLACEHOLDER_POSTER;
  const baseUrl = type === 'backdrop' ? BACKDROP_BASE_URL : POSTER_BASE_URL;
  return `${baseUrl}${path}`;
};

/**
 * Formats date string to localized format.
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
