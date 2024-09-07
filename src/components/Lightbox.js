import React from 'react';
import './Lightbox.css'; // Importa il CSS per il lightbox

const Lightbox = ({ isOpen, imageSrc, onClose, caption }) => {
  if (!isOpen) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img src={imageSrc} alt="Enlarged view" className="lightbox-image" />
        {caption && <p className="lightbox-caption">{caption}</p>}
        <button className="lightbox-close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default Lightbox;
