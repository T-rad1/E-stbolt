import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';

const SearchForm: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [roomCount, setRoomCount] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params for search
    const params = new URLSearchParams();
    
    // Add search query if provided
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    
    // Add price range if selected
    if (priceRange && priceRange !== 'Any Price') {
      let priceParam = '';
      switch (priceRange) {
        case 'Under $100,000':
          priceParam = '0-100000';
          break;
        case '$100,000 - $200,000':
          priceParam = '100000-200000';
          break;
        case '$200,000 - $300,000':
          priceParam = '200000-300000';
          break;
        case '$300,000 - $500,000':
          priceParam = '300000-500000';
          break;
        case '$500,000 - $1,000,000':
          priceParam = '500000-1000000';
          break;
        case 'Over $1,000,000':
          priceParam = '1000000-999999999';
          break;
      }
      if (priceParam) {
        params.append('price', priceParam);
      }
    }
    
    // Add room count if selected
    if (roomCount && roomCount !== 'Rooms') {
      const rooms = roomCount.replace(/[^\d]/g, ''); // Extract number
      if (rooms) {
        params.append('rooms', rooms);
      }
    }
    
    // Navigate to explore page with search parameters
    const queryString = params.toString();
    navigate(`/explore${queryString ? `?${queryString}` : ''}`);
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-lg shadow-lg p-4 md:p-6 border border-white/20 dark:border-gray-700/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Query Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, property name..."
            className="pl-10 pr-3 py-3 w-full rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        {/* Price Range */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="pl-10 pr-3 py-3 w-full rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Price Range</option>
            <option value="Under $100,000">Under $100,000</option>
            <option value="$100,000 - $200,000">$100,000 - $200,000</option>
            <option value="$200,000 - $300,000">$200,000 - $300,000</option>
            <option value="$300,000 - $500,000">$300,000 - $500,000</option>
            <option value="$500,000 - $1,000,000">$500,000 - $1,000,000</option>
            <option value="Over $1,000,000">Over $1,000,000</option>
          </select>
        </div>
        
        {/* Room Count */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Home className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <select
            value={roomCount}
            onChange={(e) => setRoomCount(e.target.value)}
            className="pl-10 pr-3 py-3 w-full rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Rooms</option>
            <option value="1">1 Room</option>
            <option value="2">2 Rooms</option>
            <option value="3">3 Rooms</option>
            <option value="4">4 Rooms</option>
            <option value="5+">5+ Rooms</option>
          </select>
        </div>
        
        {/* Search Button */}
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md flex items-center justify-center transition-colors"
        >
          <Search className="w-5 h-5 mr-2" />
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchForm;