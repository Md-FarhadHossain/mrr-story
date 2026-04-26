'use server';

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  const email = formData.get('email');
  if (!email || typeof email !== 'string') {
    return { error: 'Please provide a valid email address.' };
  }

  const apiKey = process.env.CONVERT_KIT_API_KEY;
  const formId = process.env.CONVERT_KIT_FORM_ID;

  if (!apiKey) {
    console.error('ConvertKit API key is missing.');
    return { error: 'Newsletter configuration is missing.' };
  }

  if (!formId) {
    console.error('ConvertKit Form ID is missing.');
    return { error: 'Newsletter is not fully configured (missing Form ID).' };
  }

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        api_key: apiKey,
        email: email 
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('ConvertKit API Error:', errorData);
      
      // Handle "already subscribed" or other known messages if ConvertKit returns them
      if (errorData?.message?.toLowerCase().includes('already')) {
        return { error: 'This email is already subscribed.' };
      }
      
      return { error: 'Failed to subscribe. Please try again later.' };
    }

    return { success: 'Successfully subscribed to the newsletter!' };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
