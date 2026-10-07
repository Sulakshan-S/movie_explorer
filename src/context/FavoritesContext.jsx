import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext(null);

const FAVORITES_STORAGE_KEY = 'movie_explorer_favorites';

const getInitialFavorites = () => {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to load favorites from localStorage:', error);
    return [];
  }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(getInitialFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  const addFavorite = useCallback((movie) => {
    if (!movie || !movie.id) return;

    setFavorites((prev) => {
      if (prev.some((item) => item.id === movie.id)) {
        return prev;
      }
      // Store essential movie properties so favorites view works offline/without refetch
      const movieData = {
        id: movie.id,
        title: movie.title || 'Untitled',
        poster_path: movie.poster_path || null,
        release_date: movie.release_date || '',
        vote_average: movie.vote_average ?? 0,
      };
      return [...prev, movieData];
    });
  }, []);

  const removeFavorite = useCallback((movieId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== movieId));
  }, []);

  const isFavorite = useCallback(
    (movieId) => {
      return favorites.some((item) => item.id === movieId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (movie) => {
      if (!movie || !movie.id) return;
      if (isFavorite(movie.id)) {
        removeFavorite(movie.id);
      } else {
        addFavorite(movie);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
