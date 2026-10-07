import axios from 'axios';
import { TMDB_BASE_URL } from '../utils/constants';
import { capPage } from '../utils/helpers';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
  },
});

// Response interceptor for user-friendly error messages
tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      friendlyMessage = 'Network error. Please check your internet connection.';
    } else {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          friendlyMessage = 'Invalid API key. Please check your TMDb API configuration.';
          break;
        case 404:
          friendlyMessage = 'The requested resource was not found.';
          break;
        case 429:
          friendlyMessage = 'Too many requests. You have exceeded the rate limit. Please try again later.';
          break;
        default:
          friendlyMessage = data?.status_message || error.message || friendlyMessage;
          break;
      }
    }

    return Promise.reject(new Error(friendlyMessage));
  }
);

/**
 * Normalizes signal parameter to AbortSignal instance if available.
 * @param {AbortSignal|{signal: AbortSignal}} signal
 * @returns {AbortSignal|undefined}
 */
const resolveSignal = (signal) => {
  if (signal instanceof AbortSignal) return signal;
  if (signal && typeof signal === 'object' && signal.signal instanceof AbortSignal) {
    return signal.signal;
  }
  return undefined;
};

/**
 * Fetch trending movies for the week.
 * @param {number} page
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export const getTrending = async (page = 1, signal) => {
  const response = await tmdbClient.get('/trending/movie/week', {
    params: {
      page: capPage(page),
    },
    signal: resolveSignal(signal),
  });
  return response.data;
};

/**
 * Search movies by text query with optional year filter.
 * @param {string} query
 * @param {number} page
 * @param {string|number} [year]
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export const searchMovies = async (query, page = 1, year, signal) => {
  let actualYear = year;
  let actualSignal = signal;

  // Handle case where signal is passed as 3rd argument
  if (year instanceof AbortSignal || (year && typeof year === 'object' && 'signal' in year)) {
    actualSignal = resolveSignal(year);
    actualYear = undefined;
  } else {
    actualSignal = resolveSignal(signal);
  }

  const params = {
    query,
    page: capPage(page),
  };

  if (actualYear) {
    params.primary_release_year = actualYear;
  }

  const response = await tmdbClient.get('/search/movie', {
    params,
    signal: actualSignal,
  });
  return response.data;
};

/**
 * Discover movies by genre, release year, or minimum rating.
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {string|number} [options.genre]
 * @param {string|number} [options.year]
 * @param {number} [options.minRating]
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export const discoverMovies = async (
  { page = 1, genre, year, minRating } = {},
  signal
) => {
  const params = {
    page: capPage(page),
  };

  if (genre) {
    params.with_genres = genre;
  }

  if (year) {
    params.primary_release_year = year;
  }

  if (minRating !== undefined && minRating !== null && minRating !== '') {
    params['vote_average.gte'] = minRating;
  }

  const response = await tmdbClient.get('/discover/movie', {
    params,
    signal: resolveSignal(signal),
  });
  return response.data;
};

/**
 * Fetch movie details with credits and videos appended.
 * @param {string|number} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export const getMovieDetails = async (id, signal) => {
  const response = await tmdbClient.get(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,videos',
    },
    signal: resolveSignal(signal),
  });
  return response.data;
};

/**
 * Fetch official movie genre list.
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export const getGenres = async (signal) => {
  const response = await tmdbClient.get('/genre/movie/list', {
    signal: resolveSignal(signal),
  });
  return response.data;
};

export default tmdbClient;
