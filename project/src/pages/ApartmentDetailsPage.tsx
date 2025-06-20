import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, BedDouble, Bath, Maximize, Calendar, Heart, Share, Check, Image, Bot } from 'lucide-react';
import ApartmentMap from '../components/apartment/ApartmentMap';
import SimilarApartments from '../components/apartment/SimilarApartments';
import ApartmentImageGallery from '../components/apartment/ApartmentImageGallery';
import NotFoundPage from './NotFoundPage';
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

const ApartmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'photos' | 'floorPlan' | 'map'>('photos');
  const [showContactForm, setShowContactForm] = useState(false);
  const [apartment, setApartment] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setApartment(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id]);
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Update document title
    if (apartment) {
      document.title = `${apartment.title} | HomeVista`;
    }
    
    return () => {
      document.title = 'HomeVista';
    };
  }, [apartment]);

  const handleSmartAssistantClick = () => {
    if (!apartment) return;

    // Create a simple user-facing message
    const userMessage = `${apartment.title} details sent to Smart Assistant.`;

    // Create comprehensive property context for the AI (hidden from user)
    const propertyContext = {
      title: apartment.title,
      location: apartment.location,
      price: apartment.price,
      type: apartment.type,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      size: apartment.size,
      year_built: apartment.year_built,
      amenities: apartment.amenities,
      description: apartment.description,
      images: apartment.images
    };

    // Store both the user message and the full context
    sessionStorage.setItem('smartAssistantUserMessage', userMessage);
    sessionStorage.setItem('smartAssistantPropertyContext', JSON.stringify(propertyContext));
    
    // Navigate to the Smart Assistant page
    navigate('/smart-assistant');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  
  if (!apartment) {
    return <NotFoundPage />;
  }
  
  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Top Navigation */}
      <div className="bg-gray-100 py-3 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
            <span className="mx-2 text-gray-500">/</span>
            
            <Link to="/explore" className="text-gray-600 hover:text-blue-600">Explore</Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-blue-600 font-medium truncate">{apartment.title}</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{apartment.title}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-1" />
                <span>{apartment.location}</span>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-4 border-b">
              <div className="flex">
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'photos' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab('photos')}
                >
                  Photos
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'floorPlan' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab('floorPlan')}
                >
                  Floor Plan
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'map' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab('map')}
                >
                  Map
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === 'photos' && (
                <ApartmentImageGallery images={apartment.images} />
              )}
              
              {activeTab === 'floorPlan' && (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Floor Plan Visualization</h3>
                  <p className="text-gray-600 mb-4">
                    Use our AI Floor Plan Generator to visualize this apartment layout.
                  </p>
                  <Link 
                    to="/ai-floor-plan" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {t('apartment.viewFloorPlan')}
                  </Link>
                </div>
              )}
              
              {activeTab === 'map' && (
                <ApartmentMap coordinates={apartment.coordinates} title={apartment.title} />
              )}
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{apartment.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BedDouble className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700 font-medium">Bedrooms</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{apartment.bedrooms}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Bath className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700 font-medium">Bathrooms</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{apartment.bathrooms}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Maximize className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700 font-medium">Size</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{apartment.size} sqft</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700 font-medium">Year Built</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{apartment.year_built}</p>
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('apartment.features')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {apartment.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center py-2">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Similar Listings */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('apartment.similarListings')}
              </h2>
              <SimilarApartments currentId={apartment.id} />
            </div>
          </div>
          
          {/* Sidebar - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-blue-600">
                    ${apartment.price.toLocaleString()}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <Share className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Est. ${Math.round(apartment.price / 240).toLocaleString()} /mo</p>
              </div>
              
              {/* Smart Assistant Button */}
              <button
                onClick={handleSmartAssistantClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium mb-4 transition-colors flex items-center justify-center"
              >
                <Bot className="w-5 h-5 mr-2" />
                Talk to Smart Assistant
              </button>
              
              {/* Contact Form Toggle */}
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium mb-4 transition-colors"
              >
                {t('apartment.contact')}
              </button>
              
              {/* Contact Form */}
              {showContactForm && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Send a Message</h3>
                  <form>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your email"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="I'm interested in this property..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetailsPage;