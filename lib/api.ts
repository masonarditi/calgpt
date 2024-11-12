import { config } from './config';

export async function sendQuery(query: string) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const endpoint = isDevelopment ? `${config.apiBaseUrl}/proxy` : '/api/chat';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      query,
      limit: 1,
      wishlist: {} 
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Server error');
  }

  return response.json();
} 