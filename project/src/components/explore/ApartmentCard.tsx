import React from 'react';
import { Building2, MapPin, Bath, BedDouble, Home, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApartmentCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  imageUrl: string;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  squareMeters,
  imageUrl,
}) => {
  // If any required props are missing, don't render the card
  if (!id || price === undefined) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
          <span className="font-semibold text-primary">${typeof price === 'number' ? price.toLocaleString() : '0'}</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{location}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center">
            <BedDouble className="w-4 h-4 mr-2 text-gray-500" />
            <span>{bedrooms} beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-2 text-gray-500" />
            <span>{bathrooms} baths</span>
          </div>
          <div className="flex items-center">
            <Home className="w-4 h-4 mr-2 text-gray-500" />
            <span>{squareMeters}m²</span>
          </div>
        </div>
        
        <Link
          to={`/apartment/${id}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default ApartmentCard;