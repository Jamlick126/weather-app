export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  const API_KEY = process.env.WEATHER_API_KEY;
  const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=5&aqi=yes`;

  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
}