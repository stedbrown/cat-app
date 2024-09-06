import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { Grid, Card, CardMedia } from '@mui/material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function Favorites({ user }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(firestore, 'favorites'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newFavorites = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFavorites(newFavorites);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Favorite Cats</h2>
      <Grid container spacing={2}>
        {favorites.map((favorite) => (
          <Grid item xs={12} sm={6} md={4} key={favorite.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={favorite.imageUrl}
                alt="Favorite Cat"
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Favorites;