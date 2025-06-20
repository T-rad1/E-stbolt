import { supabase } from './supabaseClient';

export const dbClient = {
  supabase,

  insertProperty: async (property: any) => {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        images: property.images || [],
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        amenities: property.amenities || [],
        type: property.type,
        year_built: property.year_built
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateProperty: async (property: any) => {
    const { data, error } = await supabase
      .from('properties')
      .update({
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        images: property.images || [],
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        amenities: property.amenities || [],
        type: property.type,
        year_built: property.year_built,
        updated_at: new Date().toISOString()
      })
      .eq('id', property.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteProperty: async (id: string) => {
    try {
      console.log('Starting deletion process for property:', id);

      // Get property details first
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching property:', fetchError);
        throw new Error('Failed to fetch property details');
      }

      if (!property) {
        throw new Error('Property not found');
      }

      console.log('Found property:', property);

      // Delete images from storage if they exist
      if (property.images && property.images.length > 0) {
        for (const imageUrl of property.images) {
          try {
            // Extract filename from URL
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const filePath = `properties/${filename}`;

            console.log('Attempting to delete image:', filePath);

            const { error: storageError } = await supabase.storage
              .from('property-images')
              .remove([filePath]);

            if (storageError) {
              console.error('Error deleting image:', storageError);
              throw new Error(`Failed to delete image: ${filePath}`);
            }

            console.log('Successfully deleted image:', filePath);
          } catch (err) {
            console.error('Error processing image deletion:', err);
            throw new Error('Failed to delete one or more images');
          }
        }
      }

      // Delete property from database
      console.log('Deleting property from database:', id);
      const { data, error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .select();

      if (deleteError) {
        console.error('Error deleting property from database:', deleteError);
        throw new Error('Failed to delete property from database');
      }

      // Re-fetch to verify deletion
      const { data: checkData, error: checkError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id);

      if (checkError) {
        console.error('Error verifying deletion:', checkError);
        throw new Error('Failed to verify property deletion');
      }

      if (checkData && checkData.length > 0) {
        console.error('Property still exists after deletion attempt');
        throw new Error('Property still exists after deletion');
      }

      console.log('Property deletion completed successfully');
      return true;
    } catch (error) {
      console.error('Property deletion failed:', error);
      throw error;
    }
  },

  getPropertyById: async (id: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  getAllProperties: async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  searchProperties: async (query: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`location.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};