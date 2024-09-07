import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Header({ user }) {
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
    <AppBar position="static" sx={{ backgroundColor: '#ff5722' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ flexGrow: 1, textAlign: 'left', fontFamily: 'Roboto, sans-serif' }}
        >
          <Link 
            to="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              marginLeft: '20px',  // Spazio a sinistra per desktop
              fontSize: '1.5rem'   // Adatta la dimensione del testo
            }}
          >
            🐈Cat App
          </Link>
        </Typography>
        {user ? (
          <>
            <Button 
              color="inherit" 
              component={Link} 
              to="/favorites"
              sx={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Favorites
            </Button>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button 
            color="inherit" 
            onClick={handleLogin}
            sx={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
