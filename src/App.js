import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { auth } from './firebase';
import Header from './components/Header';
import Home from './components/Home';
import Favorites from './components/Favorites';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <Header user={user} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/favorites" element={<Favorites user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;