import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardMedia, CardActions, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { firestore } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import Lightbox from './Lightbox';

function Home({ user }) {
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
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant="h3" sx={{ mb: 4, fontStyle: 'italic', color: '#333', animation: 'fadeIn 2s ease-in-out' }}>
        Welcome 😺
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={generateCat}
        sx={{ mb: 4, backgroundColor: '#ff5722', color: '#fff', '&:hover': { backgroundColor: '#e64a19' } }}
      >
        😺 Generate Cat
      </Button>

      {loading ? (
        <CircularProgress sx={{ color: '#ff5722' }} />
      ) : catImage ? (
        <Card sx={{ maxWidth: 345, mx: 'auto', mb: 4, borderRadius: 12, boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
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
                  color={isFavorited ? "warning" : "primary"}
                  onClick={handleFavorite}
                  sx={{
                    transition: 'transform 0.2s, background-color 0.2s',
                    '&:hover': {
                      backgroundColor: isFavorited ? '#fbc02d' : '#1976d2',
                      transform: 'scale(1.1)',
                    },
                    '&:active': {
                      transform: 'scale(0.9)',
                    },
                  }}
                >
                  {isFavorited ? '⭐ Unfavorite' : '🌟 Favorite'}
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      ) : null}

      <Grid container spacing={2} sx={{ mt: 4 }}>
        {topCats.map((cat, index) => (
          <Grid item xs={12} sm={6} md={4} key={cat.id}>
            <Card sx={{ maxWidth: 345, mx: 'auto', mb: 4, borderRadius: 12, boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
              <CardMedia
                component="img"
                height="300"
                image={cat.url}
                alt="Cat"
                onClick={() => handleImageClick(index + 1)}
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
        isOpen={isOpen}
        imageSrc={photoIndex === 0 ? catImage : topCats[photoIndex - 1]?.url}
        onClose={() => setIsOpen(false)}
        caption={photoIndex === 0 ? `❤️ Likes: ${likes}` : `❤️ Likes: ${topCats[photoIndex - 1]?.likes}`}
      />
    </div>
  );
}

export default Home;
