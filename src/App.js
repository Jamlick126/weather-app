import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplets, Eye, Gauge, Sunrise, Sunset, Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Zap } from 'lucide-react';
import logo from './logo.svg';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchWeatherByLocation();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => {
    e.preventDefault();
    setInstallPrompt(e);
    setShowInstallButton(true);
  };
  
  window.addEventListener('beforeinstallprompt', handler);
  
  return () => window.removeEventListener('beforeinstallprompt', handler);

  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setInstallPrompt(null);
  };

  const fetchWeatherByLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchWeather(`${latitude},${longitude}`);
        },
        () => {
          // Fallback to default city if location access is denied
          fetchWeather('Nairobi');
        }
      );
    } else {
      fetchWeather('Nairobi');
    }
  };

  const fetchWeather = async (query) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `/api/weather?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('City not found');
      
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWeatherIcon = (condition, size = 24) => {
    const code = condition?.code || 1000;
    const iconProps = { size, className: "text-white" };
    
    if (code === 1000) return <Sun {...iconProps} />;
    if ([1003, 1006, 1009].includes(code)) return <Cloud {...iconProps} />;
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return <CloudRain {...iconProps} />;
    if ([1066, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return <CloudSnow {...iconProps} />;
    if ([1150, 1153, 1168, 1171].includes(code)) return <CloudDrizzle {...iconProps} />;
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return <Zap {...iconProps} />;
    return <Cloud {...iconProps} />;
  };

  const getBackgroundGradient = () => {
    if (!weather) return 'from-teal-500 via-cyan-600 to-teal-800';
    
    const isDay = weather.current.is_day;
    const condition = weather.current.condition.code;
    
    if (isDay) {
      if (condition === 1000) return 'from-teal-500 via-cyan-600 to-teal-800';
      if ([1003, 1006, 1009].includes(condition)) return 'from-teal-500 via-cyan-600 to-teal-800';
      if ([1063, 1180, 1183, 1186, 1189, 1192, 1195].includes(condition)) return 'from-teal-600 via-cyan-700 to-teal-900';
      return 'from-teal-500 via-cyan-600 to-teal-800';
    } else {
      return 'from-teal-900 via-cyan-900 to-teal-950';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Weather Forecast</h1>
          <p className="text-white text-opacity-90">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        {/* Install Button */}
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            className="absolute top-0 right-0 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-all backdrop-blur-md flex items-center space-x-2 text-sm"
          >
            <span className="text-white font-medium">📱 Install App</span>
          </button>
        )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for a city..."
              className="w-full px-6 py-4 pr-14 rounded-full bg-white bg-opacity-20 backdrop-blur-md text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-lg"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-40 p-3 rounded-full transition-all"
            >
              <Search className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-white text-xl">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4">Loading weather data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-white bg-red-500 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-xl">{error}</p>
          </div>
        )}

        {/* Weather Display */}
        {weather && !loading && (
          <div className="space-y-6">
            {/* Current Weather Card */}
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="text-white" size={24} />
                  <h2 className="text-3xl font-bold text-white">{weather.location.name}, {weather.location.country}</h2>
                </div>
                <div className="text-white text-right text-sm opacity-90">
                  <p>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>Local: {weather.location.localtime.split(' ')[1]}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Temperature Display */}
                <div className="flex items-center justify-center md:justify-start space-x-6">
                  <div className="bg-white bg-opacity-20 p-6 rounded-2xl">
                    {getWeatherIcon(weather.current.condition, 64)}
                  </div>
                  <div>
                    <div className="text-7xl font-bold text-white">{Math.round(weather.current.temp_c)}°</div>
                    <p className="text-2xl text-white text-opacity-90 mt-2">{weather.current.condition.text}</p>
                    <p className="text-white text-opacity-80">Feels like {Math.round(weather.current.feelslike_c)}°</p>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wind className="text-white" size={20} />
                      <span className="text-white text-opacity-80 text-sm">Wind</span>
                    </div>
                    <p className="text-white text-2xl font-semibold">{weather.current.wind_kph} km/h</p>
                    <p className="text-white text-opacity-70 text-sm">{weather.current.wind_dir}</p>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="text-white" size={20} />
                      <span className="text-white text-opacity-80 text-sm">Humidity</span>
                    </div>
                    <p className="text-white text-2xl font-semibold">{weather.current.humidity}%</p>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="text-white" size={20} />
                      <span className="text-white text-opacity-80 text-sm">Visibility</span>
                    </div>
                    <p className="text-white text-2xl font-semibold">{weather.current.vis_km} km</p>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gauge className="text-white" size={20} />
                      <span className="text-white text-opacity-80 text-sm">Pressure</span>
                    </div>
                    <p className="text-white text-2xl font-semibold">{weather.current.pressure_mb} mb</p>
                  </div>
                </div>
              </div>

              {/* Sun Times */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 rounded-xl p-4 flex items-center space-x-3">
                  <Sunrise className="text-yellow-300" size={32} />
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Sunrise</p>
                    <p className="text-white text-xl font-semibold">{weather.forecast.forecastday[0].astro.sunrise}</p>
                  </div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-4 flex items-center space-x-3">
                  <Sunset className="text-orange-400" size={32} />
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Sunset</p>
                    <p className="text-white text-xl font-semibold">{weather.forecast.forecastday[0].astro.sunset}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">5-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weather.forecast.forecastday.map((day, index) => (
                  <div key={index} className="bg-white bg-opacity-10 rounded-xl p-4 text-center hover:bg-teal-500 hover:bg-opacity-30 transition-all border border-transparent hover:border-teal-300">
                    <p className="text-white font-semibold mb-2">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <div className="flex justify-center my-3">
                      {getWeatherIcon(day.day.condition, 32)}
                    </div>
                    <p className="text-white text-opacity-90 text-sm mb-2">{day.day.condition.text}</p>
                    <div className="flex justify-center space-x-2 text-white">
                      <span className="font-semibold">{Math.round(day.day.maxtemp_c)}°</span>
                      <span className="text-opacity-60">{Math.round(day.day.mintemp_c)}°</span>
                    </div>
                    <p className="text-white text-opacity-70 text-xs mt-2">
                      <Droplets size={12} className="inline" /> {day.day.daily_chance_of_rain}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white text-opacity-70">
          <p className="text-sm">Powered by WeatherAPI.com</p>
        </div>
      </div>
    </div>
  );
};

export default App;
