import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

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

interface SimilarApartmentsProps {
  currentId: string;
}

const SimilarApartments: React.FC<SimilarApartmentsProps> = ({ currentId }) => {
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fetch current property
        const { data: currentData, error: currentError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', currentId)
          .single();

        if (currentError) throw currentError;
        if (!currentData) return;

        setCurrentProperty(currentData);

        // Fetch similar properties
        const { data: similarData, error: similarError } = await supabase
          .from('properties')
          .select('*')
          .neq('id', currentId)
          .or(`price.gte.${currentData.price * 0.8},price.lte.${currentData.price * 1.2}`)
          .limit(3);

        if (similarError) throw similarError;
        setSimilarProperties(similarData || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentId]);

  if (loading || !currentProperty || similarProperties.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {similarProperties.map((property) => (
        <div 
          key={property.id} 
          className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Image */}
          <Link to={`/apartments/${property.id}`}>
            <div className="relative h-40">
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          
          {/* Content */}
          <div className="p-4">
            <div className="flex justify-between mb-2">
              <p className="text-lg font-bold text-blue-600">${property.price.toLocaleString()}</p>
              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                <Maximize className="w-4 h-4" />
                <span>{property.size} sqft</span>
              </div>
            </div>
            
            <Link to={`/apartments/${property.id}`}>
              <h3 className="text-base font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
            </Link>
            
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <p className="truncate">{property.location}</p>
            </div>
            
            <div className="flex justify-between text-xs text-gray-600 mt-3 pt-3 border-t">
              <div>Beds: {property.bedrooms}</div>
              <div>Baths: {property.bathrooms}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimilarApartments;