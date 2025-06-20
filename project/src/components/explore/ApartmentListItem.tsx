import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize, Heart } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  size: number;
  amenities: string[];
  type: string;
  year_built: number;
  created_at: string;
  updated_at: string;
}

interface ApartmentListItemProps {
  apartment: Property;
}

const ApartmentListItem: React.FC<ApartmentListItemProps> = ({ apartment }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <Link 
          to={`/apartments/${apartment.id}`} 
          className="md:w-72 h-48 md:h-auto overflow-hidden rounded-lg"
        >
          <img
            src={apartment.images[0]}
            alt={apartment.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Content */}
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <Link to={`/apartments/${apartment.id}`}>
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {apartment.title}
              </h3>
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <p className="text-sm">{apartment.location}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-gray-700">
              <BedDouble className="w-4 h-4 mr-1" />
              <span className="text-sm">{apartment.bedrooms} Beds</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Bath className="w-4 h-4 mr-1" />
              <span className="text-sm">{apartment.bathrooms} Baths</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Maximize className="w-4 h-4 mr-1" />
              <span className="text-sm">{apartment.size} sqft</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                ${apartment.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Est. ${Math.round(apartment.price / 240).toLocaleString()} /mo
              </p>
            </div>
            <Link
              to={`/apartments/${apartment.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentListItem;