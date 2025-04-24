import { createClient } from '@supabase/supabase-js'


// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'products')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, bucket: string = 'products'): Promise<string | null> {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Based on the RLS policies in your Supabase dashboard
    // Try different folders that have public access policies
    const filePath = `public/${fileName}`; // Using 'public' folder which typically has less restrictive policies

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // If there's an error with the 'public' folder, try a different folder
      console.error('Error uploading to public folder, trying alternative folder...');
      
      // Try an alternative folder from the RLS policies in your screenshot
      const alternativeFilePath = `fifhysk_0/${fileName}`;
      const alternativeUpload = await supabase.storage
        .from(bucket)
        .upload(alternativeFilePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (alternativeUpload.error) {
        console.error('Error uploading image to alternative folder:', alternativeUpload.error);
        return null;
      }
      
      // Get public URL for the alternative path
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(alternativeFilePath);
        
      return publicUrl;
    }

    // Get public URL for the original path
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage function:', error);
    return null;
  }
}

/**
 * Uploads multiple images to Supabase Storage and returns an array of public URLs
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name (default: 'products')
 * @returns Array of public URLs of the uploaded files
 */
export async function uploadMultipleImages(files: File[], bucket: string = 'products'): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, bucket));
    const results = await Promise.all(uploadPromises);
    
    // Filter out any null results (failed uploads)
    return results.filter((url): url is string => url !== null);
  } catch (error) {
    console.error('Error in uploadMultipleImages function:', error);
    return [];
  }
}
