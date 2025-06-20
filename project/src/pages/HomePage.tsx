import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Building2, Search, Shield, Star, Users, ChevronRight, DollarSign, Home, Compass, Ruler, Bot } from 'lucide-react';
import FeaturedApartments from '../components/home/FeaturedApartments';
import SearchForm from '../components/home/SearchForm';
import { supabase } from '../utils/supabaseClient';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('Any Price');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [backgroundImage, setBackgroundImage] = useState('https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg');
  
  // Hero search form state
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const priceRanges = [
    'Any Price',
    'Under $100,000',
    '$100,000 - $200,000',
    '$200,000 - $300,000',
    '$300,000 - $500,000',
    '$500,000 - $1,000,000',
    'Over $1,000,000'
  ];

  // Load background image from settings
  useEffect(() => {
    const loadBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'homepage_background')
          .single();

        if (data?.value?.image_url) {
          setBackgroundImage(data.value.image_url);
        }
      } catch (error) {
        console.error('Error loading background image:', error);
      }
    };

    loadBackgroundImage();

    // Listen for settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail.homepage_background) {
        setBackgroundImage(event.detail.homepage_background);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  // Handle hero search form submission
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Add search query if provided
    if (heroSearchQuery.trim()) {
      params.append('q', heroSearchQuery.trim());
    }
    
    // Add price range if selected and not default
    if (selectedPrice && selectedPrice !== 'Any Price') {
      let priceParam = '';
      switch (selectedPrice) {
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
    
    // Navigate to explore page with search parameters
    const queryString = params.toString();
    navigate(`/explore${queryString ? `?${queryString}` : ''}`);
  };

  const cards = [
    {
      title: "Search Property from Anywhere",
      description: "Find your dream property from our extensive database of listings across multiple locations.",
      icon: Search,
      content: (
        <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/50">
          <SearchForm />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Compass className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Browse Locations</h4>
              <p className="text-gray-600 dark:text-gray-300">Explore properties in your desired neighborhoods</p>
            </div>
            <div className="text-center">
              <Home className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Property Types</h4>
              <p className="text-gray-600 dark:text-gray-300">Filter by apartments, houses, or commercial spaces</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Price Range</h4>
              <p className="text-gray-600 dark:text-gray-300">Find properties within your budget</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Create 2D Floor Plans with AI Assistance",
      description: "Design your dream home with our AI-powered tool that generates detailed 2D floor plans based on your specifications.",
      icon: Ruler,
      content: (
        <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Floor Plan Generator</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Transform your ideas into reality with our advanced AI floor plan generator. Simply input your requirements and watch as our AI creates detailed, professional 2D floor plans.
              </p>
              <div className="space-y-4">
                <Link
                  to="/smart-assistant"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
                >
                  <Bot className="mr-2 w-5 h-5" />
                  Launch Smart Assistant
                </Link>
                <Link
                  to="/ai-floor-plan"
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Advanced Designer
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100/80 dark:bg-gray-700/60 backdrop-blur-sm p-4 rounded-lg text-center border border-white/20 dark:border-gray-600/50">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">2D Plans</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Detailed floor layouts</p>
              </div>
              <div className="bg-gray-100/80 dark:bg-gray-700/60 backdrop-blur-sm p-4 rounded-lg text-center border border-white/20 dark:border-gray-600/50">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Smart Chat</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered assistance</p>
              </div>
              <div className="bg-gray-100/80 dark:bg-gray-700/60 backdrop-blur-sm p-4 rounded-lg text-center border border-white/20 dark:border-gray-600/50">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Measurements</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Precise dimensions</p>
              </div>
              <div className="bg-gray-100/80 dark:bg-gray-700/60 backdrop-blur-sm p-4 rounded-lg text-center border border-white/20 dark:border-gray-600/50">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Export</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Multiple formats</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Buy and Sell Awesome Property",
      description: "Whether you're buying or selling, we make the process smooth and efficient.",
      icon: Building2,
      content: (
        <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Buyers</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Verified Listings</h4>
                    <p className="text-gray-600 dark:text-gray-300">All properties are thoroughly vetted</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Star className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Premium Selection</h4>
                    <p className="text-gray-600 dark:text-gray-300">Access to exclusive properties</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Sellers</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Wide Reach</h4>
                    <p className="text-gray-600 dark:text-gray-300">Connect with qualified buyers</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Market Analysis</h4>
                    <p className="text-gray-600 dark:text-gray-300">Get optimal pricing insights</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <img 
            src={backgroundImage}
            alt="Modern City Skyline"
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 dark:from-black/60 dark:to-black/40"></div>
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-7xl font-bold text-white mb-6">
            Buy & Sell Property Here
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-3xl">
            Need a perfect place to live right now? Here's the best offer for you! Amazing house with the most comfort layout is fully equipped with everything needed.
          </p>
          
          {/* Hero Search Form */}
          <form onSubmit={handleHeroSearch} className="w-full max-w-4xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-white/20 dark:border-gray-700/50">
                <div className="flex-none bg-blue-500 p-4 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <input
                  type="text"
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  placeholder="Enter Location, Property Name, or Description"
                  className="flex-grow px-6 py-4 text-gray-700 dark:text-white bg-transparent focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Price Range Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                  className="w-full md:w-48 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-lg shadow-xl text-gray-700 dark:text-white border border-white/20 dark:border-gray-700/50"
                >
                  <span className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    {selectedPrice}
                  </span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${showPriceDropdown ? 'rotate-90' : ''}`} />
                </button>

                {showPriceDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg shadow-xl border border-white/20 dark:border-gray-700/50">
                    {priceRanges.map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => {
                          setSelectedPrice(range);
                          setShowPriceDropdown(false);
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-white"
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="flex-none bg-blue-500 px-8 py-4 rounded-lg text-white font-semibold hover:bg-blue-600 transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedCard(index)}
                  className={`cursor-pointer transition-all duration-300 p-8 rounded-lg shadow-lg border dark:border-gray-600 ${
                    selectedCard === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/90 dark:bg-black/40 backdrop-blur-md hover:shadow-xl border-white/20 dark:border-gray-700/50'
                  }`}
                >
                  <Icon className={`w-12 h-12 mb-4 ${
                    selectedCard === index ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <h3 className={`text-2xl font-bold mb-4 ${
                    selectedCard === index ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>{card.title}</h3>
                  <p className={selectedCard === index ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}>
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Card Content */}
          {selectedCard !== null && (
            <div className="mt-8 transition-all duration-300 animate-fade-in">
              {cards[selectedCard].content}
            </div>
          )}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Properties</h2>
            <p className="text-gray-600 dark:text-gray-400">Discover our selection of the finest properties available</p>
          </div>
          <FeaturedApartments />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                We Are Ready to Protect Your Property
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Our comprehensive property management solutions ensure your investment is well-protected and profitable.
              </p>
              <Link to="/learn-more" className="inline-flex items-center text-gray-900 hover:text-primary-dark dark:text-white dark:hover:text-primary-DEFAULT">
                Learn More <ChevronRight className="ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-white/20 dark:border-gray-700/50">
                <Shield className="w-12 h-12 text-gray-900 dark:text-white mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">High Security</h3>
                <p className="text-gray-600 dark:text-gray-300">Advanced security systems and 24/7 monitoring services.</p>
              </div>
              <div className="p-6 bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-white/20 dark:border-gray-700/50">
                <Star className="w-12 h-12 text-gray-900 dark:text-white mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Certified Platform</h3>
                <p className="text-gray-600 dark:text-gray-300">Licensed and certified real estate platform you can trust.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Let's Talk</h2>
              <p className="text-gray-400 mb-8">
                Ready to find your dream property? Get in touch with our expert team today.
              </p>
              <div className="space-y-4">
                <div className="hover:transform hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-400">Address</p>
                  <p className="text-white">123 Property Street, Real Estate City</p>
                </div>
                <div className="hover:transform hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-400">Email</p>
                  <p className="text-white">contact@realestate.com</p>
                </div>
                <div className="hover:transform hover:-translate-y-1 transition-transform duration-300">
                  <p className="text-gray-400">Phone</p>
                  <p className="text-white">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            <div>
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-300"
                />
                <button className="w-full px-4 py-3 bg-primary-DEFAULT hover:bg-primary-dark rounded-lg transition-all duration-300 transform hover:scale-105">
                  Subscribe to Newsletter
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;