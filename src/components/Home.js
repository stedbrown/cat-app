import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardMedia, CardActions, CardContent, Typography, Grid } from '@mui/material';
import { Favorite, Star } from '@mui/icons-material';
import { firestore } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import Lightbox from './Lightbox'; // Importa il componente Lightbox

function Home({ user }) {
  const [catImage, setCatImage] = useState(null);
  const [catId, setCatId] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [topCats, setTopCats] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchTopCats = async () => {
      const catsRef = collection(firestore, 'images');
      const topCatsQuery = query(catsRef, orderBy('likes', 'desc'), limit(10));
      const querySnapshot = await getDocs(topCatsQuery);
      const catsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopCats(catsData);
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
      const likeRef = doc(firestore, 'images', catId, 'likes', user.uid);
      getDoc(likeRef).then((docSnapshot) => {
        setIsLiked(docSnapshot.exists());
      });

      const favoriteRef = doc(firestore, 'favorites', `${user.uid}_${catId}`);
      getDoc(favoriteRef).then((docSnapshot) => {
        setIsFavorited(docSnapshot.exists());
      });
    }
  }, [user, catId]);

  const generateCat = async () => {
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
  };

  const handleLike = async () => {
    if (user && catId) {
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
    }
  };

  const handleFavorite = async () => {
    if (user && catId) {
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
    }
  };

  const handleImageClick = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h3" className="animated-text">
        Welcome to Cat Gallery 😺
      </Typography>

      <Button variant="contained" color="primary" onClick={generateCat}>
        😺 Generate Cat
      </Button>

      {catImage && (
        <Card sx={{ maxWidth: 345, margin: '20px auto' }}>
          <CardMedia
            component="img"
            height="300"
            image={catImage}
            alt="Cat"
            onClick={() => handleImageClick(0)}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              ❤️ Likes: {likes}
            </Typography>
          </CardContent>
          <CardActions>
            {user && (
              <>
                <Button 
                  size="small" 
                  color={isLiked ? "secondary" : "primary"} 
                  onClick={handleLike}
                >
                  {isLiked ? '💔 Unlike' : '❤️ Like'}
                </Button>
                <Button 
                  size="small" 
                  color={isFavorited ? "warning" : "primary"} 
                  onClick={handleFavorite}
                >
                  {isFavorited ? '⭐ Unfavorite' : '🌟 Favorite'}
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      )}

      <Grid container spacing={2} style={{ marginTop: 20 }}>
        {topCats.map((cat, index) => (
          <Grid item xs={12} sm={6} md={4} key={cat.id}>
            <Card sx={{ maxWidth: 345, margin: '20px auto' }}>
              <CardMedia
                component="img"
                height="300"
                image={cat.url}
                alt="Cat"
                onClick={() => handleImageClick(index + 1)}
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

      {/* Lightbox per visualizzare l'immagine ingrandita */}
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
