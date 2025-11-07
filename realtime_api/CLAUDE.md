# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **weather and air quality dashboard** MVP project that displays real-time weather information and fine dust (미세먼지) levels for the user's location in Korea.

**Tech Stack**: Pure HTML5 + CSS3 + Vanilla JavaScript (no frameworks, no build tools, no backend server)

**Deployment**: Static website deployable to GitHub Pages, Netlify, or Vercel

## Project Structure

```
realtime_api/
├── initial.md          # Project specification and API documentation
├── index.html          # Main HTML file (to be created)
├── style.css           # Styling (to be created)
└── script.js           # JavaScript logic (to be created)
```

## API Integration Architecture

### 1. Location Detection Flow
- Use browser's native `navigator.geolocation.getCurrentPosition()` to get user's latitude/longitude
- Handle permission denial gracefully with a default fallback location

### 2. Weather Data Flow
- **Primary API**: OpenWeatherMap API
- Endpoint: `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=kr`
- Fetch current weather (temperature, humidity, wind speed, weather condition, icon)
- Free tier: 1,000 calls/day

### 3. Air Quality Data Flow
- **Primary API**: Korea Environment Corporation (한국환경공단) AirKorea API
- Endpoint: `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty`
- Fetch PM10 and PM2.5 levels with station-based measurements
- Requires converting lat/lon to nearest monitoring station name
- Free, unlimited usage (public data)

### 4. Data Update Strategy
- Auto-refresh every 10 minutes using `setInterval()`
- Manual refresh button for immediate updates

## Development Workflow

### Initial Setup
1. Create `index.html`, `style.css`, `script.js` files
2. Register for API keys:
   - OpenWeatherMap: https://openweathermap.org/ (instant)
   - Public Data Portal: https://www.data.go.kr/ (1 day approval)

### Local Development
- No build process required - just open `index.html` in a browser
- Use Live Server extension in VS Code for auto-reload during development
- Test with browser dev tools console for API responses

### Testing
- Test geolocation permission prompt handling
- Verify API responses with different locations
- Test responsive design on mobile devices
- Check error handling for network failures and API errors

## Key Implementation Details

### CORS Handling
- OpenWeatherMap supports CORS by default
- Public Data Portal APIs may require CORS proxy or server-side calls
- For MVP, consider alternative approach: use JSONP if available, or set up simple CORS proxy

### API Key Security
- **Never commit API keys to Git**
- Use environment variables or separate config file (add to `.gitignore`)
- For static deployment, consider using Netlify/Vercel environment variables with serverless functions

### Air Quality Grade Display
Display PM2.5/PM10 levels with color coding:
- Good (0-30): Blue
- Moderate (31-80): Green
- Unhealthy (81-150): Yellow
- Very Unhealthy (151+): Red

## Deployment

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
# Enable GitHub Pages in repository settings
```

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli
# Deploy
netlify deploy --prod
```

## Common Issues

### Geolocation Not Working
- HTTPS required (localhost is exempt)
- User must grant permission
- Fallback to default coordinates (Seoul: 37.5665, 126.9780)

### API Rate Limits
- OpenWeatherMap free tier: 60 calls/minute, 1000 calls/day
- Implement client-side caching to reduce unnecessary calls
- Use `localStorage` to cache responses for 10 minutes

### Korean Character Encoding
- Ensure `<meta charset="UTF-8">` in HTML
- Use `lang=kr` parameter in OpenWeatherMap API for Korean weather descriptions

## MVP Feature Checklist

Essential features for MVP:
- [ ] Get user location via Geolocation API
- [ ] Display current temperature and weather condition
- [ ] Display PM10 and PM2.5 levels
- [ ] Show weather icon
- [ ] Color-code air quality levels
- [ ] Auto-refresh every 10 minutes
- [ ] Responsive design for mobile

Post-MVP enhancements (see initial.md section 7):
- 5-day weather forecast
- Location search functionality
- Favorite locations
- Push notifications for poor air quality
