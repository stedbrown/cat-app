import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Header({ user }) {
  const handleLogin = () => {
    signInWithPopup(auth, new GoogleAuthProvider());
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Cat App</Link>
        </Typography>
        {user ? (
          <>
            <Button color="inherit" component={Link} to="/favorites">
              Favorites
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={handleLogin}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;