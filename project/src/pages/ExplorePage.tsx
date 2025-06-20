import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, X, SlidersHorizontal, MapPin, Grid, List } from 'lucide-react';
import ApartmentListItem from '../components/explore/ApartmentListItem';
import { supabase } from '../utils/supabaseClient';

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

const ExplorePage: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [roomCount, setRoomCount] = useState<number | null>(null);
  const [bathCount, setBathCount] = useState<number | null>(null);
  const [minSize, setMinSize] = useState<number | null>(null);
  
  // Data state
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Parse URL query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Handle search query
    const queryParam = params.get('q');
    if (queryParam) {
      setSearchTerm(queryParam);
      setIsSearchActive(true);
    }
    
    // Handle location param (for backward compatibility)
    const locationParam = params.get('location');
    if (locationParam && !queryParam) {
      setSearchTerm(locationParam);
      setIsSearchActive(true);
    }
    
    // Handle price range
    const priceParam = params.get('price');
    if (priceParam) {
      const [min, max] = priceParam.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        setPriceRange([min, max]);
      }
    }
    
    // Handle room count
    const roomsParam = params.get('rooms');
    if (roomsParam && !isNaN(Number(roomsParam))) {
      setRoomCount(Number(roomsParam));
    }
  }, [location.search]);
  
  // Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  // Perform search when search term or filters change
  useEffect(() => {
    if (isSearchActive && searchTerm.trim()) {
      performSearch();
    } else if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearchActive(false);
    }
  }, [searchTerm, properties, priceRange, roomCount]);

  const performSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      
      // Search in database with case-insensitive partial matching
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let results = data || [];

      // Apply additional filters
      results = results.filter((property) => {
        // Price range filter
        const matchesPrice = 
          property.price >= priceRange[0] && property.price <= priceRange[1];
        
        // Room count filter
        const matchesRooms = 
          roomCount === null || property.bedrooms === roomCount;
        
        // Bathroom count filter
        const matchesBaths = 
          bathCount === null || property.bathrooms === bathCount;
        
        // Size filter
        const matchesSize = 
          minSize === null || property.size >= minSize;
        
        return matchesPrice && matchesRooms && matchesBaths && matchesSize;
      });

      setSearchResults(results);
      setIsSearchActive(true);
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get filtered properties (either search results or all properties with filters)
  const getDisplayProperties = () => {
    if (isSearchActive) {
      return searchResults;
    }

    return properties.filter((property) => {
      // Price range filter
      const matchesPrice = 
        property.price >= priceRange[0] && property.price <= priceRange[1];
      
      // Room count filter
      const matchesRooms = 
        roomCount === null || property.bedrooms === roomCount;
      
      // Bathroom count filter
      const matchesBaths = 
        bathCount === null || property.bathrooms === bathCount;
      
      // Size filter
      const matchesSize = 
        minSize === null || property.size >= minSize;
      
      return matchesPrice && matchesRooms && matchesBaths && matchesSize;
    });
  };

  const displayProperties = getDisplayProperties();
  
  // Update URL when filters change
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('q', searchTerm);
    
    if (priceRange[0] > 0 || priceRange[1] < 2000000) {
      params.append('price', `${priceRange[0]}-${priceRange[1]}`);
    }
    
    if (roomCount !== null) params.append('rooms', roomCount.toString());
    if (bathCount !== null) params.append('baths', bathCount.toString());
    if (minSize !== null) params.append('minSize', minSize.toString());
    
    navigate(`/explore?${params.toString()}`);
  };
  
  // Handle filter application
  const applyFilters = () => {
    updateUrlParams();
    setShowFilters(false);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 2000000]);
    setRoomCount(null);
    setBathCount(null);
    setMinSize(null);
    setIsSearchActive(false);
    setSearchResults([]);
    navigate('/explore');
    setShowFilters(false);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL immediately
    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    navigate(`/explore?${params.toString()}`, { replace: true });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Search Header */}
      <div className="bg-white py-4 border-b sticky top-16 md:top-20 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-2xl w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by property name, location, or description..."
                className="pl-10 pr-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchActive(false);
                    setSearchResults([]);
                    navigate('/explore');
                  }}
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Filter Button & View Toggle */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
              </button>
              
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 ${
                    viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                {/* Bedrooms Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={roomCount === null ? '' : roomCount}
                    onChange={(e) => setRoomCount(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="0">Studio</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>
                
                {/* Bathrooms Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={bathCount === null ? '' : bathCount}
                    onChange={(e) => setBathCount(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1 Bathroom</option>
                    <option value="2">2 Bathrooms</option>
                    <option value="3">3 Bathrooms</option>
                    <option value="4">4+ Bathrooms</option>
                  </select>
                </div>
                
                {/* Min Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Size (sqft)
                  </label>
                  <input
                    type="number"
                    value={minSize === null ? '' : minSize}
                    onChange={(e) => setMinSize(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min Size"
                  />
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                <span>Search: "{searchTerm}"</span>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchActive(false);
                    setSearchResults([]);
                    navigate('/explore');
                  }}
                  className="ml-1 text-blue-800 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {(priceRange[0] > 0 || priceRange[1] < 2000000) && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                <span>Price: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}</span>
                <button 
                  onClick={() => setPriceRange([0, 2000000])}
                  className="ml-1 text-blue-800 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {roomCount !== null && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                <span>Bedrooms: {roomCount === 0 ? 'Studio' : `${roomCount} Bed${roomCount > 1 ? 's' : ''}`}</span>
                <button 
                  onClick={() => setRoomCount(null)}
                  className="ml-1 text-blue-800 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {bathCount !== null && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                <span>Bathrooms: {bathCount} Bath{bathCount > 1 ? 's' : ''}</span>
                <button 
                  onClick={() => setBathCount(null)}
                  className="ml-1 text-blue-800 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {minSize !== null && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                <span>Min Size: {minSize} sqft</span>
                <button 
                  onClick={() => setMinSize(null)}
                  className="ml-1 text-blue-800 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Results Count */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-700">
            {isSearchActive ? (
              <>
                Showing <span className="font-semibold">{displayProperties.length}</span> results for "{searchTerm}"
              </>
            ) : (
              <>
                Showing <span className="font-semibold">{displayProperties.length}</span> apartments
              </>
            )}
          </p>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Sort by:</span>
            <select className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Newest</option>
              <option>Price (Low to High)</option>
              <option>Price (High to Low)</option>
              <option>Size (Largest)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {displayProperties.length > 0 ? (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="relative h-48">
                      <img 
                        src={property.images[0] || 'https://via.placeholder.com/400x300'} 
                        alt={property.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <p className="text-lg font-bold text-blue-600">${property.price.toLocaleString()}</p>
                        <span className="text-sm text-gray-500">{property.size} sqft</span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 mb-2">{property.title}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{property.location}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{property.bedrooms} beds</span>
                        <span>{property.bathrooms} baths</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {viewMode === 'list' && (
              <div className="space-y-4">
                {displayProperties.map((property) => (
                  <ApartmentListItem key={property.id} apartment={property} />
                ))}
              </div>
            )}
            
            {viewMode === 'map' && (
              <div className="flex items-center justify-center h-[calc(100vh-240px)] min-h-[400px] bg-gray-100 rounded-lg">
                <p className="text-gray-600">Map view is currently unavailable</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            {isSearchActive ? (
              <>
                <p className="text-gray-600 text-lg mb-4">No properties found for "{searchTerm}"</p>
                <p className="text-gray-500 mb-4">Try adjusting your search terms or filters</p>
              </>
            ) : (
              <p className="text-gray-600 text-lg mb-4">No apartments found matching your criteria</p>
            )}
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              {isSearchActive ? 'Clear Search' : 'Reset Filters'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;