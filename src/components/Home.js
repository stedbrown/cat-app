import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardMedia, CardActions, CardContent, Typography } from '@mui/material';
// Importa solo ciò che utilizzi
import { firestore } from '../firebase';
// Rimuovi importazioni non utilizzate
// import { Favorite, Star } from '@mui/icons-material';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // Importa lo stile per la lightbox

function Home({ user }) {
  const [catImage, setCatImage] = useState(null);
  const [catId, setCatId] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [topCats, setTopCats] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Carica le prime 10 immagini con più like
    const fetchTopCats = async () => {
      const imagesRef = firestore.collection('images');
      const snapshot = await imagesRef.orderBy('likes', 'desc').limit(10).get();
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopCats(cats);
    };
    fetchTopCats();
  }, []);

  useEffect(() => {
    if (catId) {
      const imageRef = firestore.collection('images').doc(catId);
      const unsubscribe = imageRef.onSnapshot((doc) => {
        if (doc.exists) {
          setLikes(doc.data().likes || 0);
        }
      });

      return () => unsubscribe();
    }
  }, [catId]);

  useEffect(() => {
    if (user && catId) {
      const likeRef = firestore.collection('images').doc(catId).collection('likes').doc(user.uid);
      likeRef.get().then((docSnapshot) => {
        setIsLiked(docSnapshot.exists);
      });

      const favoriteRef = firestore.collection('favorites').doc(`${user.uid}_${catId}`);
      favoriteRef.get().then((docSnapshot) => {
        setIsFavorited(docSnapshot.exists);
      });
    }
  }, [user, catId]);

  const generateCat = async () => {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    const newCatImage = response.data[0].url;
    const newCatId = response.data[0].id;
    setCatImage(newCatImage);
    setCatId(newCatId);

    const imageRef = firestore.collection('images').doc(newCatId);
    const imageDoc = await imageRef.get();
    if (!imageDoc.exists) {
      await imageRef.set({ likes: 0, url: newCatImage });
    }
  };

  const handleLike = async () => {
    if (user && catId) {
      const imageRef = firestore.collection('images').doc(catId);
      const likeRef = firestore.collection('images').doc(catId).collection('likes').doc(user.uid);

      if (isLiked) {
        await imageRef.update({ likes: firestore.FieldValue.increment(-1) });
        await likeRef.delete();
        setIsLiked(false);
      } else {
        await imageRef.update({ likes: firestore.FieldValue.increment(1) });
        await likeRef.set({ liked: true });
        setIsLiked(true);
      }
    }
  };

  const handleFavorite = async () => {
    if (user && catId) {
      const favoriteRef = firestore.collection('favorites').doc(`${user.uid}_${catId}`);

      if (isFavorited) {
        await favoriteRef.delete();
      } else {
        await favoriteRef.set({
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
      <Typography variant="h3" className="animated-text">
        Welcome to Cat Gallery 😺
      </Typography>
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
            onClick={() => setIsOpen(true)}
            style={{ cursor: 'pointer' }}
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
                  ❤️ {isLiked ? 'Unlike' : 'Like'}
                </Button>
                <Button 
                  size="small" 
                  color={isFavorited ? "warning" : "primary"} 
                  onClick={handleFavorite}
                >
                  ⭐ {isFavorited ? 'Unfavorite' : 'Favorite'}
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      )}
      {isOpen && (
        <Lightbox
          mainSrc={catImage}
          onCloseRequest={() => setIsOpen(false)}
          imageCaption={`❤️ Likes: ${likes}`}
        />
      )}
      <div>
        <Typography variant="h5" style={{ fontStyle: 'italic' }}>
          Top 10 Cats by Likes
        </Typography>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {topCats.map((cat) => (
            <Card key={cat.id} sx={{ maxWidth: 345 }}>
              <CardMedia
                component="img"
                height="200"
                image={cat.url}
                alt="Cat"
                onClick={() => {
                  setCatImage(cat.url);
                  setLikes(cat.likes);
                  setCatId(cat.id);
                  setIsOpen(true);
                }}
                style={{ cursor: 'pointer' }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Likes: {cat.likes}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
