# Vercel Deployment Instructions

This project has been optimized for Vercel deployment.

## 1. Environment Variables
When deploying to Vercel, you must set the following Environment Variables in the Vercel Dashboard (Settings > Environment Variables):

```
DB_HOST=162.0.215.187
DB_USER=votroiue
DB_PASSWORD=your_namecheap_db_password
DB_NAME=votroiue_courier (Likely needs 'votroiue_' prefix)
DB_PORT=3306
DB_CONNECTION_LIMIT=1 (Recommended for Serverless)
DB_SSL=false (Set to 'true' if Namecheap requires SSL)

JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
EASYSHIP_API_TOKEN=your_easyship_token
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-vercel-app.vercel.app/auth/google/callback
SQUARE_ACCESS_TOKEN=your_square_token
FRONTEND_URL=https://your-frontend-domain.com
```

## 2. Database Connection (Namecheap)
- Ensure your Namecheap hosting allows **Remote MySQL** connections.
- Go to cPanel > Remote MySQL.
- Add `%` (wildcard) to allow connections from Vercel (since Vercel IPs change).
- Or, if possible, find the Vercel IP ranges, but `%` is easier for shared hosting.

## 3. File Uploads
- **Important:** Vercel file system is read-only and ephemeral.
- Uploads to `/uploads` will work temporarily (stored in `/tmp`) but will be deleted after the request or shortly after.
- For permanent file storage, you should integrate AWS S3, Cloudinary, or similar services.

## 4. Deployment
- Install Vercel CLI: `npm i -g vercel`
- Run `vercel` in this directory.
- Or connect your GitHub repository to Vercel and it will auto-deploy.

## 5. API Usage
- The API is available at `/api/v1/...`
- Example: `https://your-app.vercel.app/api/v1/orders`
