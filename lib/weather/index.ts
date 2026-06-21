import { WeatherData } from '@/types'

export async function fetchWeather(city: string): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  if (!apiKey) return getMockWeather(city)

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return getMockWeather(city)
    const data = await res.json()
    return {
      city: data.name,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].main,
      humidity: data.main.humidity,
    }
  } catch {
    return getMockWeather(city)
  }
}

function getMockWeather(city: string): WeatherData {
  return { city, temp: 18, feels_like: 16, description: 'partly cloudy', icon: 'Clouds', humidity: 72 }
}

export function getWeatherEmoji(icon: string): string {
  const map: Record<string, string> = {
    Clear: '☀️', Clouds: '⛅', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
  }
  return map[icon] || '🌤️'
}
