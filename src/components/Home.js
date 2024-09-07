import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardMedia, CardActions, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { firestore } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import Lightbox from './Lightbox';
import { useTheme } from '../ThemeContext'; // Importa il contesto del tema

function Home({ user }) {
  const { isDarkTheme } = useTheme(); // Usa il contesto per ottenere il tema
  const [catImage, setCatImage] = useState(null);
  const [catId, setCatId] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [topCats, setTopCats] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopCats = async () => {
      setLoading(true);
      try {
        const catsRef = collection(firestore, 'images');
        const topCatsQuery = query(catsRef, orderBy('likes', 'desc'), limit(10));
        const querySnapshot = await getDocs(topCatsQuery);
        const catsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTopCats(catsData);
      } catch (error) {
        console.error("Error fetching top cats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCats();
  }, []);

  useEffect(() => {
    if (catId) {
      const imageRef = doc(firestore, 'images', catId);
      const unsubscribe = onSnapshot(imageRef, (doc) => {
        if (doc.exists()) {
          setLikes(doc.data().likes || 0);
        }
      });

      return () => unsubscribe();
    }
  }, [catId]);

  useEffect(() => {
    if (user && catId) {
      const checkLikeAndFavorite = async () => {
        try {
          const likeRef = doc(firestore, 'images', catId, 'likes', user.uid);
          const likeDoc = await getDoc(likeRef);
          setIsLiked(likeDoc.exists());

          const favoriteRef = doc(firestore, 'favorites', `${user.uid}_${catId}`);
          const favoriteDoc = await getDoc(favoriteRef);
          setIsFavorited(favoriteDoc.exists());
        } catch (error) {
          console.error("Error checking like or favorite status:", error);
        }
      };

      checkLikeAndFavorite();
    }
  }, [user, catId]);

  const generateCat = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.thecatapi.com/v1/images/search');
      const newCatImage = response.data[0].url;
      const newCatId = response.data[0].id;
      setCatImage(newCatImage);
      setCatId(newCatId);

      const imageRef = doc(firestore, 'images', newCatId);
      const imageDoc = await getDoc(imageRef);
      if (!imageDoc.exists()) {
        await setDoc(imageRef, { likes: 0, url: newCatImage });
      }
    } catch (error) {
      console.error("Error generating cat image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (user && catId) {
      try {
        const imageRef = doc(firestore, 'images', catId);
        const likeRef = doc(firestore, 'images', catId, 'likes', user.uid);

        if (isLiked) {
          await updateDoc(imageRef, { likes: increment(-1) });
          await deleteDoc(likeRef);
          setIsLiked(false);
        } else {
          await updateDoc(imageRef, { likes: increment(1) });
          await setDoc(likeRef, { liked: true });
          setIsLiked(true);
        }
      } catch (error) {
        console.error("Error handling like:", error);
      }
    }
  };

  const handleFavorite = async () => {
    if (user && catId) {
      try {
        const favoriteRef = doc(firestore, 'favorites', `${user.uid}_${catId}`);
        if (isFavorited) {
          await deleteDoc(favoriteRef);
        } else {
          await setDoc(favoriteRef, {
            imageUrl: catImage,
            imageId: catId,
            userId: user.uid,
          });
        }
        setIsFavorited(!isFavorited);
      } catch (error) {
        console.error("Error handling favorite:", error);
      }
    }
  };

  const handleImageClick = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: isDarkTheme ? '#121212' : '#f5f5f5', minHeight: '100vh', color: isDarkTheme ? '#ffffff' : '#000000' }}>
      <Typography variant="h3" sx={{ mb: 4, fontStyle: 'italic', color: isDarkTheme ? '#ffffff' : '#000000', animation: 'fadeIn 2s ease-in-out' }}>
        Welcome 😺
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={generateCat}
        sx={{ mb: 4, backgroundColor: '#90caf9', color: isDarkTheme ? '#121212' : '#000000', '&:hover': { backgroundColor: '#64b5f6' } }}
      >
        😺 Generate Cat
      </Button>

      {loading ? (
        <CircularProgress sx={{ color: '#90caf9' }} />
      ) : catImage ? (
        <Card sx={{ maxWidth: 345, mx: 'auto', mb: 4, borderRadius: 12, boxShadow: 3, backgroundColor: isDarkTheme ? '#1e1e1e' : '#ffffff', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
          <CardMedia
            component="img"
            height="300"
            image={catImage}
            alt="Cat"
            onClick={() => handleImageClick(0)}
            sx={{ cursor: 'pointer', borderRadius: 12 }}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              ❤️ Likes: {likes}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            {user && (
              <>
                <Button
                  size="small"
                  color={isLiked ? "secondary" : "primary"}
                  onClick={handleLike}
                  sx={{
                    transition: 'transform 0.2s, background-color 0.2s',
                    '&:hover': {
                      backgroundColor: isLiked ? '#d32f2f' : '#1976d2',
                      transform: 'scale(1.1)',
                    },
                    '&:active': {
                      transform: 'scale(0.9)',
                    },
                  }}
                >
                  {isLiked ? '💔 Unlike' : '❤️ Like'}
                </Button>
                <Button
                  size="small"
                  color={isFavorited ? "secondary" : "primary"}
                  onClick={handleFavorite}
                  sx={{
                    transition: 'transform 0.2s, background-color 0.2s',
                    '&:hover': {
                      backgroundColor: isFavorited ? '#f48fb1' : '#f06292',
                      transform: 'scale(1.1)',
                    },
                    '&:active': {
                      transform: 'scale(0.9)',
                    },
                  }}
                >
                  {isFavorited ? '⭐ Remove from Favorites' : '⭐ Add to Favorites'}
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No cat image available.
        </Typography>
      )}

      <Grid container spacing={2}>
        {topCats.map((cat, index) => (
          <Grid item xs={12} sm={6} md={4} key={cat.id}>
            <Card sx={{ maxWidth: 345, mx: 'auto', mb: 4, borderRadius: 12, boxShadow: 3, backgroundColor: isDarkTheme ? '#1e1e1e' : '#ffffff', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
              <CardMedia
                component="img"
                height="300"
                image={cat.url}
                alt={`Top cat ${index + 1}`}
                onClick={() => handleImageClick(index)}
                sx={{ cursor: 'pointer', borderRadius: 12 }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  ❤️ Likes: {cat.likes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Lightbox
        open={isOpen}
        image={catImage}
        onClose={() => setIsOpen(false)}
        index={photoIndex}
        images={topCats.map(cat => cat.url)}
      />
    </div>
  );
}

export default Home;
