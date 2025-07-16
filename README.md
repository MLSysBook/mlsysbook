# MLSysBook Landing Site

This repository contains the source code for the [MLSysBook.github.io](https://MLSysBook.github.io) landing site, which serves as the central hub for the Machine Learning Systems educational initiative.

## 🏗️ Repository Structure

```
MLSysBook.github.io/
├── index.html               # Main landing page (beautiful, conversion-focused)
├── kits/
│   └── index.html           # Redirects to Kits repository
├── labs/
│   └── index.html           # Redirects to Labs repository
├── tinytorch/
│   └── index.html           # Redirects to TinyTorch repository
└── book/
    └── index.html           # Redirects to external book site
```

## 🎨 Design Philosophy

- **Main Landing Page**: Beautiful, informative, conversion-focused design that showcases the book and resources
- **Subdirectory Pages**: Simple redirect pages for direct access to specific resources
- **Mobile-First**: Responsive design that works on all devices
- **Accessibility**: Proper semantic HTML and ARIA attributes

## 🚀 Deployment

This site is automatically deployed via GitHub Pages. When you push changes to this repository, they will be available at `https://MLSysBook.github.io`.

### GitHub Pages Configuration

Ensure your repository settings have:
- **Source**: Deploy from a branch
- **Branch**: `main` (or your default branch)
- **Folder**: `/ (root)`

## 🛠️ Development

### Local Development
1. Clone this repository
2. Open `index.html` in your browser
3. For subdirectory pages, navigate to `/kits/`, `/labs/`, etc.

### Making Changes

#### Main Landing Page
- Edit `index.html` for the main landing page
- The design uses pure CSS (no external dependencies)
- Responsive breakpoints: 768px, 1024px

#### Redirect Pages
Each subdirectory contains an `index.html` with:
- Automatic redirect via `meta http-equiv="refresh"`
- Fallback manual link
- Consistent styling with the main site

### Customization

#### Changing Redirect Destinations
Edit the `meta http-equiv="refresh"` tag in each `index.html`:

```html
<meta http-equiv="refresh" content="0; url=https://your-new-url.com" />
```

#### Styling
- Main styles are in the `<style>` tag of each HTML file
- Color scheme: Purple gradient (`#667eea` to `#764ba2`)
- Typography: System fonts for optimal performance

## 📁 File Organization

- `index.html` - Main landing page with comprehensive information
- `kits/index.html` - Redirect to hardware kits repository
- `labs/index.html` - Redirect to labs and exercises repository  
- `tinytorch/index.html` - Redirect to TinyTorch project repository
- `book/index.html` - Redirect to external book website

## 🔗 External Dependencies

- GitHub profile images (loaded from GitHub's CDN)
- No external CSS or JavaScript libraries
- All assets are self-contained for optimal performance

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Load Time**: < 2 seconds on 3G
- **Bundle Size**: < 50KB total

## 🤝 Contributing

1. Fork this repository
2. Make your changes
3. Test locally by opening `index.html` in a browser
4. Submit a pull request

## 📞 Support

For questions about this landing site:
- Open an [issue](https://github.com/MLSysBook/org/issues)
- Contact: [contact@mlsysbook.ai](mailto:contact@mlsysbook.ai)

For questions about the Machine Learning Systems book and resources:
- Visit [mlsysbook.ai](https://mlsysbook.ai)
- Join [GitHub Discussions](https://github.com/orgs/mlsysbook/discussions)