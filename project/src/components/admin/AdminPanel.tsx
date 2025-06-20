import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Plus, List, Trash2, MapPin, BedDouble, Bath, Maximize, Image as ImageIcon, Pencil, Upload } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { validateEmail } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContext';

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
}

interface Settings {
  title: string;
  description: string;
  admin_name: string;
  admin_email: string;
  homepage_background: string;
}

// Common property features for standardization
const PROPERTY_FEATURES = [
  'Balcony',
  'Garage',
  'Pool',
  'Elevator',
  'Air Conditioning',
  'Heating',
  'Dishwasher',
  'Washer/Dryer',
  'Fireplace',
  'Hardwood Floors',
  'Carpet',
  'Tile Floors',
  'Walk-in Closet',
  'Garden',
  'Patio',
  'Gym/Fitness Center',
  'Security System',
  'Parking',
  'Pet Friendly',
  'Furnished',
  'Unfurnished',
  'High-Speed Internet',
  'Cable/Satellite TV',
  'Storage Unit',
  'Concierge',
  'Doorman',
  'Rooftop Access',
  'Laundry Room',
  'Business Center',
  'Playground'
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    title: '',
    description: '',
    admin_name: '',
    admin_email: '',
    homepage_background: ''
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Loading settings...');
        setIsLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('User error:', userError);
          if (userError.message.includes('JWT') || userError.message.includes('user_not_found')) {
            await handleAuthError();
            return;
          }
          throw userError;
        }

        if (!user) {
          console.error('No user found');
          await handleAuthError();
          return;
        }

        console.log('Current user:', user.email);
        setOriginalEmail(user.email || '');

        // Fetch all settings at once
        const { data: allSettings, error: settingsError } = await supabase
          .from('settings')
          .select('key, value');

        if (settingsError) {
          console.error('Settings error:', settingsError);
          throw settingsError;
        }

        console.log('Fetched settings:', allSettings);

        // Process settings data
        const settingsMap = (allSettings || []).reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>);

        console.log('Settings map:', settingsMap);

        // Update settings state with fetched data
        setSettings({
          title: settingsMap.site_info?.title || 'HomeVista',
          description: settingsMap.site_info?.description || 'Find your dream home with our AI-powered apartment marketplace.',
          admin_name: settingsMap.contact_info?.admin_name || user?.user_metadata?.name || '',
          admin_email: settingsMap.contact_info?.admin_email || user?.email || '',
          homepage_background: settingsMap.homepage_background?.image_url || 'https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg'
        });

        console.log('Settings loaded successfully');
      } catch (err: any) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings: ' + (err.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const deleteOldBackgroundImage = async (imageUrl: string) => {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Check if it's a file from our storage (not an external URL)
      if (imageUrl.includes('supabase') && imageUrl.includes('property-images')) {
        const filePath = `backgrounds/${filename}`;
        
        console.log('Deleting old background image:', filePath);
        
        const { error: deleteError } = await supabase.storage
          .from('property-images')
          .remove([filePath]);

        if (deleteError) {
          console.error('Error deleting old background image:', deleteError);
          // Don't throw error here as it shouldn't prevent new upload
        } else {
          console.log('Successfully deleted old background image');
        }
      }
    } catch (error) {
      console.error('Error in deleteOldBackgroundImage:', error);
      // Don't throw error as it shouldn't prevent new upload
    }
  };

  const handleBackgroundUpload = async () => {
    if (!backgroundImage) return;

    try {
      setUploadingBackground(true);
      setError(null);

      console.log('Starting background upload...');

      // Delete old background image if it exists
      if (settings.homepage_background) {
        await deleteOldBackgroundImage(settings.homepage_background);
      }

      const fileExt = backgroundImage.name.split('.').pop();
      const fileName = `homepage-background.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      // Upload new image to storage
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, backgroundImage, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      console.log('New background URL:', publicUrl);

      // Update settings
      setSettings(prev => ({ ...prev, homepage_background: publicUrl }));
      setBackgroundImage(null);

      // Save to database
      const { error: saveError } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'homepage_background',
            value: { image_url: publicUrl },
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );

      if (saveError) {
        console.error('Save error:', saveError);
        throw saveError;
      }

      // Dispatch event to update homepage
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: { homepage_background: publicUrl } 
      }));

      setSuccess('Background image updated successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (error: any) {
      console.error('Error uploading background:', error);
      setError(error.message || 'Error uploading background image');
    } finally {
      setUploadingBackground(false);
    }
  };

  const showNotification = (message: string, isError: boolean) => {
    if (isError) {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }
    
    // Auto-clear notifications after 5 seconds
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  };

  const saveSettings = async () => {
    try {
      setIsSavingSettings(true);
      setError(null);
      setSuccess(null);

      console.log('Starting settings save...');
      console.log('Settings to save:', settings);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error during save:', userError);
        if (userError.message.includes('JWT') || userError.message.includes('user_not_found')) {
          await handleAuthError();
          return;
        }
        throw userError;
      }

      if (!user) {
        console.error('No user during save');
        await handleAuthError();
        return;
      }

      if (!settings.admin_email) {
        throw new Error('Email is required');
      }

      try {
        validateEmail(settings.admin_email);
      } catch (emailError: any) {
        throw new Error(emailError.message);
      }

      console.log('Saving site info...');
      // Save site info (title and description)
      const { data: siteInfoResult, error: siteInfoError } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'site_info',
            value: {
              title: settings.title,
              description: settings.description
            },
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        )
        .select();

      if (siteInfoError) {
        console.error('Site info error:', siteInfoError);
        throw siteInfoError;
      }

      console.log('Site info save result:', siteInfoResult);

      console.log('Saving contact info...');
      // Save contact info (name and email)
      const { data: contactInfoResult, error: contactInfoError } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'contact_info',
            value: {
              admin_name: settings.admin_name.trim(),
              admin_email: settings.admin_email.trim()
            },
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        )
        .select();

      if (contactInfoError) {
        console.error('Contact info error:', contactInfoError);
        throw contactInfoError;
      }

      console.log('Contact info save result:', contactInfoResult);

      console.log('Updating user metadata...');
      // Update user metadata with the new name (this doesn't require re-authentication)
      if (settings.admin_name.trim() !== user?.user_metadata?.name) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { 
            name: settings.admin_name.trim(),
            role: 'admin' // Preserve the admin role
          }
        });

        if (metadataError) {
          console.warn('Could not update user metadata:', metadataError);
          // Don't throw error here as the main settings were saved
        }
      }

      // Wait a moment for the database to process
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify the data was saved by fetching it back
      console.log('Verifying saved data...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['site_info', 'contact_info']);

      if (verifyError) {
        console.error('Verification error:', verifyError);
        throw new Error('Settings may not have been saved properly');
      }

      console.log('Verification data:', verifyData);

      // Check if the data matches what we tried to save
      const verifyMap = (verifyData || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      const savedTitle = verifyMap.site_info?.title;
      const savedDescription = verifyMap.site_info?.description;
      const savedName = verifyMap.contact_info?.admin_name;
      const savedEmail = verifyMap.contact_info?.admin_email;

      console.log('Verification check:');
      console.log('Expected title:', settings.title, 'Saved title:', savedTitle);
      console.log('Expected description:', settings.description, 'Saved description:', savedDescription);
      console.log('Expected name:', settings.admin_name.trim(), 'Saved name:', savedName);
      console.log('Expected email:', settings.admin_email.trim(), 'Saved email:', savedEmail);

      if (savedTitle !== settings.title || 
          savedDescription !== settings.description ||
          savedName !== settings.admin_name.trim() ||
          savedEmail !== settings.admin_email.trim()) {
        throw new Error('Settings verification failed - data may not have been saved correctly');
      }

      // Handle email change separately if needed
      const emailChanged = settings.admin_email.trim() !== originalEmail;
      
      if (emailChanged) {
        // For email changes, we'll show a different message
        showNotification(
          `Settings saved successfully! Note: Email change from ${originalEmail} to ${settings.admin_email} has been recorded in the system settings. To update your login email, please contact your system administrator.`,
          false
        );
      } else {
        showNotification('Settings saved successfully!', false);
      }

      // Dispatch event to update navbar
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: { title: settings.title } 
      }));

      console.log('Settings save completed successfully');

    } catch (error: any) {
      console.error('Error saving settings:', error);
      showNotification(error.message || 'Error saving settings', true);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
          <p>{success}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Site Title</label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Site Description</label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Name</label>
          <input
            type="text"
            value={settings.admin_name}
            onChange={(e) => setSettings({ ...settings, admin_name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Email</label>
          <input
            type="email"
            value={settings.admin_email}
            onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            This email will be stored in system settings. To change your login email, contact your system administrator.
          </p>
        </div>

        {/* Homepage Background Image Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Homepage Background Image</label>
          
          {settings.homepage_background && (
            <div className="mb-4">
              <img
                src={settings.homepage_background}
                alt="Current homepage background"
                className="w-full h-32 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">Current background image</p>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackgroundImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            
            {backgroundImage && (
              <button
                onClick={handleBackgroundUpload}
                disabled={uploadingBackground}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {uploadingBackground ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Replace
                  </>
                )}
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Note: Uploading a new image will permanently replace the current background image.
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={isSavingSettings}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSavingSettings ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

const AddProperty = () => {
  const [property, setProperty] = useState<Partial<Property>>({
    title: '',
    description: '',
    price: 0,
    location: '',
    images: [],
    bedrooms: 1,
    bathrooms: 1,
    size: 0,
    amenities: [],
    type: 'apartment',
    year_built: new Date().getFullYear()
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages(e.target.files);
      
      // Create preview URLs for selected images
      const previews = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const removeImage = (index: number) => {
    if (images) {
      const dt = new DataTransfer();
      Array.from(images).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setImages(dt.files);
      
      // Update preview images
      const newPreviews = previewImages.filter((_, i) => i !== index);
      setPreviewImages(newPreviews);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  useEffect(() => {
    // Update property amenities when features change
    setProperty(prev => ({ ...prev, amenities: selectedFeatures }));
  }, [selectedFeatures]);

  useEffect(() => {
    // Cleanup preview URLs when component unmounts
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      
      if (images) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `properties/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      // Create property with image URLs
      const { error: insertError } = await supabase
        .from('properties')
        .insert([{
          ...property,
          images: imageUrls,
          amenities: selectedFeatures,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      // Reset form
      setProperty({
        title: '',
        description: '',
        price: 0,
        location: '',
        images: [],
        bedrooms: 1,
        bathrooms: 1,
        size: 0,
        amenities: [],
        type: 'apartment',
        year_built: new Date().getFullYear()
      });
      setImages(null);
      setPreviewImages([]);
      setSelectedFeatures([]);
      setError(null);
    } catch (err: any) {
      console.error('Error adding property:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Add New Property</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={property.title}
              onChange={(e) => setProperty({ ...property, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              required
              value={property.location}
              onChange={(e) => setProperty({ ...property, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              required
              min="0"
              value={property.price}
              onChange={(e) => setProperty({ ...property, price: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Size (sqft)</label>
            <input
              type="number"
              required
              min="0"
              value={property.size}
              onChange={(e) => setProperty({ ...property, size: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
            <input
              type="number"
              required
              min="0"
              value={property.bedrooms}
              onChange={(e) => setProperty({ ...property, bedrooms: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
            <input
              type="number"
              required
              min="0"
              step="0.5"
              value={property.bathrooms}
              onChange={(e) => setProperty({ ...property, bathrooms: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={property.type}
              onChange={(e) => setProperty({ ...property, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <input
              type="number"
              required
              min="1800"
              max={new Date().getFullYear()}
              value={property.year_built}
              onChange={(e) => setProperty({ ...property, year_built: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            rows={4}
            value={property.description}
            onChange={(e) => setProperty({ ...property, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Property Features Checklist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Property Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PROPERTY_FEATURES.map((feature) => (
              <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
          {selectedFeatures.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Selected features: {selectedFeatures.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          
          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Adding Property...' : 'Add Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

const EditProperty = ({ property, onClose, onSave }: { property: Property; onClose: () => void; onSave: () => void }) => {
  const [editedProperty, setEditedProperty] = useState<Property>(property);
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(property.amenities || []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  useEffect(() => {
    // Update property amenities when features change
    setEditedProperty(prev => ({ ...prev, amenities: selectedFeatures }));
  }, [selectedFeatures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrls = [...editedProperty.images];

      if (images) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `properties/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          ...editedProperty,
          images: imageUrls,
          amenities: selectedFeatures,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id);

      if (updateError) throw updateError;

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error updating property:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Property</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={editedProperty.title}
                onChange={(e) => setEditedProperty({ ...editedProperty, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                required
                value={editedProperty.location}
                onChange={(e) => setEditedProperty({ ...editedProperty, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                required
                min="0"
                value={editedProperty.price}
                onChange={(e) => setEditedProperty({ ...editedProperty, price: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Size (sqft)</label>
              <input
                type="number"
                required
                min="0"
                value={editedProperty.size}
                onChange={(e) => setEditedProperty({ ...editedProperty, size: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input
                type="number"
                required
                min="0"
                value={editedProperty.bedrooms}
                onChange={(e) => setEditedProperty({ ...editedProperty, bedrooms: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={editedProperty.bathrooms}
                onChange={(e) => setEditedProperty({ ...editedProperty, bathrooms: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={editedProperty.type}
                onChange={(e) => setEditedProperty({ ...editedProperty, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Year Built</label>
              <input
                type="number"
                required
                min="1800"
                max={new Date().getFullYear()}
                value={editedProperty.year_built}
                onChange={(e) => setEditedProperty({ ...editedProperty, year_built: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              rows={4}
              value={editedProperty.description}
              onChange={(e) => setEditedProperty({ ...editedProperty, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Property Features Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Property Features</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {PROPERTY_FEATURES.map((feature) => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Images</label>
            <div className="grid grid-cols-4 gap-4 mt-2">
              {editedProperty.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...editedProperty.images];
                      newImages.splice(index, 1);
                      setEditedProperty({ ...editedProperty, images: newImages });
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Add More Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ListProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProperties(properties.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting property:', err);
      alert('Error deleting property: ' + err.message);
    }
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Manage Properties</h2>
      
      <div className="space-y-4">
        {properties.map((property) => (
          <div key={property.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <BedDouble className="w-4 h-4 mr-1" />
                    {property.bedrooms} beds
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.bathrooms} baths
                  </div>
                  <div className="flex items-center">
                    <Maximize className="w-4 h-4 mr-1" />
                    {property.size} sqft
                  </div>
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  ${property.price.toLocaleString()}
                </div>
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Features: {property.amenities.join(', ')}
                    </p>
                  </div>
                )}
                {property.images.length > 0 && (
                  <div className="mt-4 flex space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="h-20 w-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProperty(property)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProperty && (
        <EditProperty
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={fetchProperties}
        />
      )}
    </div>
  );
};

const AdminPanel = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === `/admin${path}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
          <nav className="space-y-2">
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <Link
              to="/admin/add"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/add') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Add Property</span>
            </Link>
            <Link
              to="/admin/list"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/list') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
              <span>List Properties</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          <Routes>
            <Route index element={<AdminSettings />} />
            <Route path="add" element={<AddProperty />} />
            <Route path="list" element={<ListProperties />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;