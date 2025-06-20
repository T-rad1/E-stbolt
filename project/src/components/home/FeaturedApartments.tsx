import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Maximize, Plus } from 'lucide-react';
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
  created_at?: string;
  updated_at?: string;
}

const FeaturedApartments: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      console.log('Fetching properties from Supabase');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase client initialized:', !!supabase);
      
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(`Database error: ${supabaseError.message}`);
      }

      console.log('Fetched properties:', data);
      setProperties(data || []);
    } catch (err) {
      console.error('Error in fetchProperties:', err);
      
      // Provide more specific error messages
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the database. Please check your internet connection and try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading properties.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure the component is mounted
    const timeoutId = setTimeout(() => {
      fetchProperties();
    }, 100);

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('properties_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'properties' 
        }, 
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchProperties(); // Refresh the data when changes occur
        }
      )
      .subscribe();

    // Cleanup subscription and timeout
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button 
          onClick={fetchProperties}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-300">
        <p>No properties available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <div 
          key={property.id} 
          className="bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50"
        >
          <div className="relative">
            <img 
              src={property.images[0] || 'https://via.placeholder.com/400x300'} 
              alt={property.title} 
              className="w-full h-52 object-cover"
            />
            <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full shadow-md hover:bg-white/90 dark:hover:bg-black/70 transition-all duration-300">
              <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between mb-2">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">${property.price.toLocaleString()}</p>
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <Maximize className="w-4 h-4" />
                <span className="text-white dark:text-gray-200">{property.size} sqft</span>
              </div>
            </div>
            
            <Link to={`/apartments/${property.id}`}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {property.title}
              </h3>
            </Link>
            
            <div className="flex items-center mb-3 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <p className="text-sm truncate text-white dark:text-gray-200">{property.location}</p>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="text-white dark:text-gray-200">Bedrooms: {property.bedrooms}</div>
              <div className="text-white dark:text-gray-200">Bathrooms: {property.bathrooms}</div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50/80 dark:bg-black/30 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-600/50 flex justify-between">
            <Link 
              to={`/apartments/${property.id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              View Details
            </Link>
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex items-center text-sm">
              <Plus className="w-4 h-4 mr-1" />
              Compare
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedApartments;