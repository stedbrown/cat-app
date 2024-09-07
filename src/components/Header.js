import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../ThemeContext'; // Importa il contesto
import { WbSunny as SunIcon, NightsStay as MoonIcon } from '@mui/icons-material';

function Header({ user }) {
  const { isDarkTheme, toggleTheme } = useTheme(); // Usa il contesto

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: isDarkTheme ? '#333' : '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif', fontWeight: 'bold', color: isDarkTheme ? '#fff' : '#333' }}
        >
          <Link 
            to="/" 
            style={{ 
              color: isDarkTheme ? '#fff' : '#333', 
              textDecoration: 'none', 
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}
          >
            🐈 Cat App
          </Link>
        </Typography>
        {user ? (
          <>
            <Button 
              color="inherit" 
              component={Link} 
              to="/favorites"
              sx={{ fontFamily: 'Roboto, sans-serif', color: isDarkTheme ? '#fff' : '#333', marginRight: '20px' }}
            >
              Favorites
            </Button>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ fontFamily: 'Roboto, sans-serif', color: '#ff5722' }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button 
            color="inherit" 
            onClick={handleLogin}
            sx={{ fontFamily: 'Roboto, sans-serif', color: '#ff5722' }}
          >
            Login
          </Button>
        )}
        <IconButton onClick={toggleTheme} sx={{ color: isDarkTheme ? '#fff' : '#000' }}>
          {isDarkTheme ? <SunIcon /> : <MoonIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
