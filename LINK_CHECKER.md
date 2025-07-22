# Link Checker Documentation

This project uses a simple, reliable Python-based link checking system to ensure all links work before deployment.

## 🚀 Quick Start

### Local Testing (Recommended before commits)

```bash
# Fast check (internal links only)
npm run check-links-fast

# Full check (internal + external links)
npm run check-links

# Direct Python usage with options
python3 scripts/check-links.py --internal-only --verbose
```

### First Time Setup

1. Ensure Python 3 is installed
2. Install the link checker:
   ```bash
   pip3 install linkchecker
   # OR
   pip3 install -r requirements.txt
   ```
3. Run your first check:
   ```bash
   npm run check-links-fast
   ```

## 🔄 Automated Checks

### GitHub Actions

The link checker runs automatically on:
- Every push to `main` or `master` branch
- Every pull request
- Weekly on Sundays at 2 AM UTC

You can see the results in the GitHub Actions tab of your repository.

### What Gets Checked

#### Internal Links ✅
- All links between pages on your site
- Relative links
- Anchor links within pages
- Images and other resources

#### External Links ⚠️
- Links to external websites
- Social media links (with exceptions for rate-limited sites)
- External resources and APIs

#### Common Issues 🔍
- Double protocols (`hhttps://` instead of `https://`)
- Localhost links in production files
- Unclosed href attributes
- Malformed URLs

## 📊 Understanding Results

### ✅ Success
```
🎉 All link checks passed!
Your website is ready for deployment.
```

### ❌ Failure Examples
```
❌ index.html: Found broken internal links
❌ index.html: Found doubled protocol (hhttps/hhttp)
⚠️ Some external links may be broken (non-critical)
```

## 🛠 Advanced Usage

### Command Line Options

```bash
# Internal links only (faster)
python3 scripts/check-links.py --internal-only

# Verbose output for debugging
python3 scripts/check-links.py --verbose

# Both options
python3 scripts/check-links.py --internal-only --verbose
```

### Manual Server Testing

```bash
# Start local server
npm run serve

# In another terminal, test specific URLs
curl -I http://localhost:8080/index.html
```

## 🚨 Troubleshooting

### Common Issues

1. **"Python3 not found"**
   - Install Python 3: https://python.org
   - On macOS: `brew install python3`
   - On Ubuntu: `sudo apt-get install python3`

2. **"linkchecker not found"**
   - Install: `pip3 install linkchecker`
   - Or: `pip3 install -r requirements.txt`
   - Ensure pip3 is in your PATH

3. **Port 8080 already in use**
   - Kill existing processes: `lsof -ti:8080 | xargs kill`
   - The script will detect and reuse existing servers

4. **External links timing out**
   - This is often normal for social media sites
   - The build won't fail on external link issues
   - Use `--internal-only` for faster testing

5. **"404 Not Found" for GitHub repositories**
   - Some repository links may be outdated or private
   - Check if the repositories exist or have been moved
   - External link issues don't fail the CI build

### GitHub Actions Failures

If the GitHub Action fails:

1. Check the Actions tab for detailed logs
2. Run the same check locally: `npm run check-links`
3. Fix any broken links found
4. Commit and push the fixes

## 📝 Best Practices

### Before Committing
```bash
# Quick check before commit
npm run check-links-fast

# If adding many external links
npm run check-links
```

### Before Deploying
- Ensure GitHub Actions pass
- Test critical external links manually
- Check that all redirect pages work

### Maintaining Links
- Review external links monthly
- Update outdated URLs promptly
- Use the weekly automated checks to catch issues early

## 🔧 Configuration

### Excluding Links

To exclude specific domains from external link checking, edit `.github/workflows/link-checker.yml`:

```yaml
--exclude "problematic-site.com" \
--exclude "another-site.com" \
```

### Changing Check Frequency

Edit the cron schedule in `.github/workflows/link-checker.yml`:

```yaml
schedule:
  # Daily at 3 AM UTC
  - cron: '0 3 * * *'
```

## 📖 How It Works

1. **Local Server**: Starts Python HTTP server on port 8080
2. **LinkChecker**: Uses the mature `linkchecker` Python package
3. **Internal Check**: Crawls all HTML files for broken internal links
4. **External Check**: Tests external URLs (with timeout and threading limits)
5. **Common Issues**: Scans for typical problems like doubled protocols
6. **Cleanup**: Shuts down server and reports results

The system uses the established `linkchecker` package (10+ years mature) instead of custom solutions, making it more reliable and easier to maintain.

## 🆘 Getting Help

If you encounter issues:

1. Run with `--verbose` flag for detailed output
2. Check the troubleshooting section above
3. Open an issue in the repository
4. Contact the maintainers at edu@tinyML.org 