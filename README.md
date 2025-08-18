# HK Company Finder

A modern, responsive web application for searching companies registered in Hong Kong using the Companies Registry API.

## 🌟 Features

- **Dual API Integration**: Searches both local and foreign companies simultaneously
- **Real-time Search**: Instant results with live API calls
- **Advanced Filtering**: Filter by source (Local/Foreign) and sort by various criteria
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Company Details**: Click on any company to view comprehensive information
- **Deduplication**: Smart merging of results from both APIs
- **Error Handling**: Graceful error handling with retry functionality

## 🚀 Live Demo

The website is ready for deployment on any web hosting service. Simply upload the files to your web server.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter font family (Google Fonts)
- **Responsive Design**: Mobile-first approach with CSS media queries

## 📁 Project Structure

```
Hong-Kong-Company-Search-Web/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality and API integration
├── README.md           # Project documentation
└── .gitattributes      # Git configuration
```

## 🔌 API Integration

The application integrates with two Hong Kong Companies Registry APIs:

### Local Companies API
```
https://data.cr.gov.hk/cr/api/api/v1/api_builder/json/local/search
```

### Foreign Companies API
```
https://data.cr.gov.hk/cr/api/api/v1/api_builder/json/foreign/search
```

### API Parameters
- `query[0][key1]`: Field name (Comp_name for local, Corp_name_full for foreign)
- `query[0][key2]`: Search operator (begins_with)
- `query[0][key3]`: Search query (minimum 2 characters)
- `format`: Response format (json)

## 🎯 Key Features

### Search Functionality
- Minimum 2 character search requirement
- Real-time search as you type
- Parallel API calls for faster results
- Smart deduplication of results

### Company Information Display
- Company name (English and Chinese if available)
- Business Registration Number (BRN)
- Registered office address
- Company type
- Incorporation/registration dates
- Place of incorporation
- Additional corporate information

### Filtering and Sorting
- Filter by source (All, Local, Foreign)
- Sort by company name, business number, or source
- Real-time filtering without page reload

### User Experience
- Loading states with animated spinner
- Error handling with retry options
- Responsive design for all devices
- Accessible interface with proper ARIA labels
- Modal dialogs for detailed information

## 🚀 Deployment

### Option 1: Static Web Hosting
1. Upload all files to your web hosting service
2. Ensure the domain points to the uploaded files
3. The application will work immediately

### Option 2: GitHub Pages
1. Push the code to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the main branch as source
4. Your site will be available at `https://username.github.io/repository-name`

### Option 3: Netlify/Vercel
1. Connect your GitHub repository
2. Deploy automatically on push
3. Get a custom domain and SSL certificate

## 🔧 Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- Update the color scheme by changing CSS custom properties
- Adjust responsive breakpoints in media queries

### Functionality
- Modify `script.js` to add new features
- Extend the API integration for additional data sources
- Add new filtering or sorting options

### Content
- Update company information display in the modal
- Modify the welcome section content
- Customize footer information

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Privacy and Security

- No user data is stored or logged
- All searches are performed in real-time
- No cookies or tracking mechanisms
- HTTPS recommended for production deployment

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Known Issues

- API rate limiting may affect search performance during high traffic
- Some company records may have incomplete information
- Chinese text display depends on browser font support

## 🔮 Future Enhancements

- Search history and bookmarks
- Export functionality (CSV, PDF)
- Advanced search filters
- Company comparison tools
- Offline caching for better performance
- Multi-language support (Traditional Chinese, Simplified Chinese)
- Company financial information integration
- Map integration for company addresses

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API endpoints are accessible
3. Test with different search terms
4. Check network connectivity

## 🙏 Acknowledgments

- Hong Kong Companies Registry for providing the API
- Font Awesome for the icon library
- Google Fonts for the Inter font family
- The open-source community for inspiration and tools

---

**Built with ❤️ for the Hong Kong business community**
