# BridgeMind Express API

A clean and simple Express.js API server for handling beta signups and competition registrations.

## Features

- ✅ TypeScript support
- ✅ MongoDB integration with Mongoose
- ✅ Rate limiting for abuse prevention
- ✅ CORS configuration
- ✅ SendGrid email integration
- ✅ Error handling middleware
- ✅ Request logging with Morgan
- ✅ Security headers with Helmet

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- SendGrid account (optional, for email notifications)

## Installation

1. Navigate to the express-api directory:
```bash
cd express-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/bridgemind
PORT=3001
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:3000
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@bridgemind.com
```

## Development

Run the development server with hot-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Production

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Beta Signups
- `POST /api/beta-signups` - Register for beta access
  ```json
  {
    "email": "user@example.com",
    "experience": "intermediate",
    "goal": "career change",
    "referrer": "social media",
    "referrerOther": "Twitter"
  }
  ```
- `GET /api/beta-signups` - Get total count of beta signups
- `GET /api/beta-signups/stats` - Get detailed statistics

### Competition Signups
- `POST /api/competition-signups` - Register for competition
  ```json
  {
    "email": "user@example.com",
    "acceptedRules": true,
    "campaign": "1k-subs"
  }
  ```
- `GET /api/competition-signups` - Get total count
- `GET /api/competition-signups/stats` - Get detailed statistics

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Default: 5 requests per 10 minutes per IP address
- Configurable via environment variables

## Error Handling

The API provides consistent error responses:
- `400` - Bad Request (validation errors)
- `403` - Forbidden (origin not allowed)
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Security

- CORS protection with configurable origins
- Helmet.js for security headers
- Input validation and sanitization
- Rate limiting per IP address
- MongoDB injection prevention

## Project Structure

```
express-api/
├── src/
│   ├── config/         # Database configuration
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.ts       # Main server file
├── dist/               # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run start:dev` - Start development server without nodemon

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/bridgemind |
| `ALLOWED_ORIGIN` | CORS allowed origin | http://localhost:3000 |
| `SENDGRID_API_KEY` | SendGrid API key | - |
| `SENDGRID_FROM_EMAIL` | From email address | - |
| `SENDGRID_FROM_NAME` | From name | BridgeMind |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 600000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 5 |

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or your cloud instance is accessible
- Check the `MONGODB_URI` in your `.env` file
- Verify network connectivity to MongoDB server

### CORS Issues
- Update `ALLOWED_ORIGIN` in `.env` to match your frontend URL
- For development, you can set it to `*` (not recommended for production)

### Email Not Sending
- Verify SendGrid API key is correct
- Check SendGrid account status and sending limits
- Emails fail silently to prevent API disruption

## License

ISC



