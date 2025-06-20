import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ApartmentImageGalleryProps {
  images: string[];
}

const ApartmentImageGallery: React.FC<ApartmentImageGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };
  
  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };
  
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto';
  };
  
  // If there's only one image, show it full width
  if (images.length === 1) {
    return (
      <div 
        className="w-full h-96 rounded-lg overflow-hidden cursor-pointer"
        onClick={() => openLightbox(0)}
      >
        <img 
          src={images[0]} 
          alt="Apartment" 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Image */}
        <div 
          className="md:col-span-2 h-96 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <img 
            src={images[0]} 
            alt="Apartment Main" 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
        
        {/* Thumbnail Images */}
        {images.slice(1).map((image, index) => (
          <div 
            key={index}
            className="h-48 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openLightbox(index + 1)}
          >
            <img 
              src={image} 
              alt={`Apartment ${index + 1}`} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
      
      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            className="absolute left-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={prevImage}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <img 
            src={images[currentIndex]} 
            alt={`Apartment ${currentIndex}`} 
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          
          <button 
            className="absolute right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={nextImage}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <div className="absolute bottom-4 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ApartmentImageGallery;