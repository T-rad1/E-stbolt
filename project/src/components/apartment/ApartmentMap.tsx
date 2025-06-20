import React from 'react';
import { MapPin } from 'lucide-react';

interface ApartmentMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  title: string;
}

const ApartmentMap: React.FC<ApartmentMapProps> = ({ coordinates, title }) => {
  // For a real implementation, you would use Google Maps API or similar
  // This is a placeholder for the actual map implementation
  return (
    <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <p className="text-gray-600">
            Location: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Interactive map would be displayed here with Google Maps or similar service
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApartmentMap;