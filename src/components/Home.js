import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardMedia, CardActions, CardContent, Typography } from '@mui/material';
import { Favorite, Star } from '@mui/icons-material';
import { firestore } from '../firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

function Home({ user }) {
  const [catImage, setCatImage] = useState(null);
  const [catId, setCatId] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

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

  return (
    <div style={{ padding: 20 }}>
      <Button variant="contained" color="primary" onClick={generateCat}>
        Generate Cat
      </Button>
      {catImage && (
        <Card sx={{ maxWidth: 345, margin: '20px auto' }}>
          <CardMedia
            component="img"
            height="300"
            image={catImage}
            alt="Cat"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Likes: {likes}
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
                  <Favorite /> {isLiked ? 'Unlike' : 'Like'}
                </Button>
                <Button 
                  size="small" 
                  color={isFavorited ? "warning" : "primary"} 
                  onClick={handleFavorite}
                >
                  <Star /> {isFavorited ? 'Unfavorite' : 'Favorite'}
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      )}
    </div>
  );
}

export default Home;
