# Deployment Guide

This guide provides step-by-step instructions for deploying your HK Company Finder website to various hosting services.

## 🚀 Quick Start

The website is built with static files (HTML, CSS, JavaScript) and can be deployed to any web hosting service that supports static websites.

## 📁 Files to Deploy

Ensure you have these files ready for deployment:
- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `script.js` - JavaScript functionality
- `api/search.js` - **Required for Vercel**: serverless proxy for HK Companies Registry API (avoids 403/CORS)
- `README.md` - Documentation (optional)

## 🌐 Deployment Options

### Option 1: GitHub Pages (Free)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Source" → "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access Your Site**
   - Your site will be available at: `https://username.github.io/repository-name`
   - It may take a few minutes to become available

### Option 2: Netlify (Free Tier)

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Choose your repository

2. **Configure Build Settings**
   - Build command: Leave empty (not needed for static sites)
   - Publish directory: Leave as default
   - Click "Deploy site"

3. **Custom Domain (Optional)**
   - Go to "Domain settings"
   - Add your custom domain
   - Netlify provides free SSL certificates

### Option 3: Vercel (Free Tier)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository

2. **Deploy**
   - Vercel automatically detects it's a static site and runs the `api/` serverless proxy
   - Ensure the `api/` folder is included (search uses `/api/search` to avoid 403/CORS from the HK API)
   - Click "Deploy"
   - Your site gets a `.vercel.app` domain

3. **Custom Domain**
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Vercel handles SSL automatically

### Option 4: Traditional Web Hosting

1. **Upload Files**
   - Use FTP/SFTP to upload files to your web server
   - Ensure files are in the public HTML directory
   - Maintain the same file structure

2. **Domain Configuration**
   - Point your domain to the hosting server
   - Configure DNS settings as per hosting provider instructions

3. **SSL Certificate**
   - Enable HTTPS for security
   - Most hosting providers offer free Let's Encrypt certificates

## 🔧 Post-Deployment Checklist

- [ ] Test the search functionality
- [ ] Verify responsive design on mobile devices
- [ ] Check that all API calls work correctly
- [ ] Test error handling and loading states
- [ ] Verify modal functionality
- [ ] Check browser console for any errors

## 🌍 Environment Variables

No environment variables are required for this static website. All API endpoints are public and don't require authentication.

## 📱 Testing

After deployment, test the following:

1. **Search Functionality**
   - Try searching for "China" (should return many results)
   - Test with short queries (less than 2 characters)
   - Verify both local and foreign company results

2. **Responsive Design**
   - Test on desktop, tablet, and mobile
   - Check that filters and modals work on all screen sizes

3. **API Integration**
   - Verify both local and foreign company APIs are working
   - Check error handling for network issues

## 🚨 Troubleshooting

### Common Issues

1. **Search Not Working**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check network connectivity

2. **Styling Issues**
   - Ensure all CSS files are uploaded
   - Check that Font Awesome is loading
   - Verify Google Fonts are accessible

3. **Mobile Issues**
   - Test on actual mobile devices
   - Check viewport meta tag
   - Verify CSS media queries

### Debug Steps

1. Open browser developer tools
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API calls
4. Test with different search terms
5. Verify all files are properly uploaded

## 🔒 Security Considerations

- The website doesn't store any user data
- All API calls are made directly from the browser
- No sensitive information is transmitted
- HTTPS is recommended for production

## 📈 Performance Optimization

- Files are already optimized for production
- CSS and JavaScript are minified-ready
- Images use efficient formats
- Responsive design reduces unnecessary downloads

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**
   - Use tools like Google PageSpeed Insights
   - Monitor API response times
   - Check for any user-reported issues

2. **Analytics (Optional)**
   - Add Google Analytics for usage insights
   - Monitor search patterns and popular queries

3. **Customization**
   - Update branding and colors
   - Add your company logo
   - Customize the welcome message

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all files are properly uploaded
4. Test with different browsers and devices

---

**Your HK Company Finder website is now ready to help users search for Hong Kong companies! 🎉**
