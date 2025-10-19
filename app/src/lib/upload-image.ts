/**
 * Upload an image file to imgbb
 * Returns the uploaded image URL
 *
 * IMPORTANT: To use this feature, you need to get a free API key from imgbb:
 * 1. Go to https://api.imgbb.com/
 * 2. Sign up for a free account
 * 3. Get your API key
 * 4. Replace the apiKey value below with your actual key
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  // Replace this with your actual imgbb API key from https://api.imgbb.com/
  const apiKey = '4f730ec9f1329bb5aeccc18756719b96';

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();

    if (data.success && data.data && data.data.url) {
      return data.data.url;
    } else {
      throw new Error('Invalid response from image upload service');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}
