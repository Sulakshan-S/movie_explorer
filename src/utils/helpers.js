import {
  POSTER_BASE_URL,
  BACKDROP_BASE_URL,
  PLACEHOLDER_POSTER,
  TMDB_MAX_PAGE,
} from './constants';

/**
 * Extracts 4-digit release year from date string.
 * @param {string|Date} date
 * @returns {string}
 */
export const getYear = (date) => {
  if (!date) return 'N/A';
  const year = String(date).slice(0, 4);
  return year && !isNaN(year) ? year : 'N/A';
};

/**
 * Formats runtime minutes into readable format (e.g. "2h 15m").
 * @param {number} minutes
 * @returns {string}
 */
export const formatRuntime = (minutes) => {
  const minsNum = Number(minutes);
  if (!minsNum || minsNum <= 0) return 'N/A';
  const hours = Math.floor(minsNum / 60);
  const remainingMins = minsNum % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMins}m`;
};

/**
 * Formats movie rating to one decimal place.
 * @param {number|string} vote_average
 * @returns {string}
 */
export const formatRating = (vote_average) => {
  if (vote_average === null || vote_average === undefined || vote_average === '') {
    return 'N/A';
  }
  const rating = Number(vote_average);
  if (isNaN(rating)) return 'N/A';
  return rating.toFixed(1);
};

/**
 * Returns full poster image URL or fallback placeholder.
 * @param {string|null} path
 * @returns {string}
 */
export const getPosterUrl = (path) => {
  if (!path) return PLACEHOLDER_POSTER;
  return `${POSTER_BASE_URL}${path}`;
};

/**
 * Caps usable page number between 1 and max (default TMDB limit 500).
 * @param {number|string} page
 * @param {number} max
 * @returns {number}
 */
export const capPage = (page = 1, max = TMDB_MAX_PAGE) => {
  const parsed = parseInt(page, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  return Math.min(parsed, max);
};

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
