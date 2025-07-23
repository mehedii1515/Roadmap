# Deployment Guide: Vercel + Render

## 🚀 Quick Deployment Steps

### 1. Backend Deployment (Render)

1. **Push your code to GitHub** (make sure both frontend and backend folders are committed)

2. **Sign up at [render.com](https://render.com)**

3. **Create a new Web Service**:
   - Connect your GitHub repository
   - Select the `backend` folder
   - Choose Python environment

4. **Configure Build & Start Commands**:
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn roadmap_backend.wsgi:application`

5. **Set Environment Variables**:
   ```
   SECRET_KEY=your-secret-key-here-make-it-random-and-long
   DEBUG=False
   FRONTEND_URL=https://your-app-name.vercel.app
   ```

6. **Deploy** - Render will automatically build and deploy your backend

### 2. Frontend Deployment (Vercel)

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import your project**:
   - Connect GitHub repository
   - Select the `frontend` folder
   - Vercel will auto-detect React

3. **Set Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com/api
   ```

4. **Deploy** - Vercel will automatically build and deploy

### 3. Update Configuration

After deployment, update these files with your actual URLs:

1. **Backend** (`backend/roadmap_backend/settings.py`):
   ```python
   ALLOWED_HOSTS = [
       'your-actual-backend-name.onrender.com',
       # ... other hosts
   ]
   
   CORS_ALLOWED_ORIGINS = [
       "https://your-actual-frontend-name.vercel.app",
       # ... other origins
   ]
   ```

2. **Frontend** (`frontend/vercel.json`):
   ```json
   "env": {
     "REACT_APP_API_URL": "https://your-actual-backend-name.onrender.com/api"
   }
   ```

## 🔧 Important Notes

- **Database**: SQLite will work but the database will reset on each deployment on Render's free tier
- **Static Files**: Handled by WhiteNoise middleware
- **CORS**: Configured to allow your frontend domain
- **Security**: Production security settings enabled

## 🎯 URLs After Deployment

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-app-name.onrender.com/api`
- **Admin Panel**: `https://your-app-name.onrender.com/admin`

## 🛠️ Troubleshooting

1. **CORS Errors**: Make sure FRONTEND_URL environment variable is set correctly
2. **Static Files**: Ensure WhiteNoise is in MIDDLEWARE
3. **Database**: Run migrations via Render console if needed
4. **Logs**: Check Render logs for backend issues, Vercel logs for frontend

## 📱 Testing

After deployment, test:
- [ ] Homepage loads
- [ ] User registration/login works
- [ ] Roadmap items display
- [ ] Voting functionality
- [ ] Comments system
- [ ] Responsive design

Your application will be live and accessible worldwide! 🌍
