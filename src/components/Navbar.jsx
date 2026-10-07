import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export const Navbar = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const favoritesCount = favorites ? favorites.length : 0;
  const isHomeActive = location.pathname === '/';
  const isFavoritesActive = location.pathname === '/favorites';

  const navLinks = [
    { label: 'Home', path: '/', icon: <HomeIcon />, active: isHomeActive },
    {
      label: 'Favorites',
      path: '/favorites',
      icon: (
        <Badge badgeContent={favoritesCount} color="error">
          <FavoriteIcon />
        </Badge>
      ),
      active: isFavoritesActive,
    },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(18, 24, 41, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.06)',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          {/* Logo & Title */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              gap: 1.2,
            }}
          >
            <MovieIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(45deg, #e50914 30%, #ff8e53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'inline-block' },
              }}
            >
              Movie Explorer
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
              sx={{
                color: isHomeActive ? 'primary.main' : 'text.primary',
                fontWeight: isHomeActive ? 700 : 500,
              }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/favorites"
              startIcon={
                <Badge badgeContent={favoritesCount} color="error">
                  <FavoriteIcon />
                </Badge>
              }
              sx={{
                color: isFavoritesActive ? 'primary.main' : 'text.primary',
                fontWeight: isFavoritesActive ? 700 : 500,
              }}
            >
              Favorites
            </Button>
          </Box>

          {/* Controls: Theme Toggle & User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Desktop User actions */}
            {user && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Chip
                  icon={<AccountCircleIcon />}
                  label={user.username}
                  variant="outlined"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  aria-label="Log out of application"
                >
                  Logout
                </Button>
              </Box>
            )}

            {/* Mobile Hamburger Menu Button */}
            <IconButton
              color="inherit"
              aria-label="Open mobile navigation menu"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            p: 2,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#121829' : '#ffffff',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
          <MovieIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Movie Explorer
          </Typography>
        </Box>

        {user && (
          <Box sx={{ mb: 2, px: 1 }}>
            <Chip
              icon={<AccountCircleIcon />}
              label={user.username}
              variant="outlined"
              sx={{ width: '100%', justifyContent: 'flex-start', py: 2 }}
            />
          </Box>
        )}

        <Divider sx={{ mb: 1 }} />

        <List>
          {navLinks.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={handleDrawerToggle}
                selected={item.active}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 700,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.active ? 'primary.main' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          {user && (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => {
                handleDrawerToggle();
                handleLogout();
              }}
              aria-label="Log out of application"
            >
              Logout
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
