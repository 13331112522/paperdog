# PaperDog AI Research Aggregator

## Project Overview
PaperDog is an AI-powered research paper aggregation system that automatically collects, analyzes, and presents the latest AI and computer vision research papers from top sources like arXiv and HuggingFace. Built on Cloudflare Workers with Cloudflare KV storage for serverless deployment.

## Architecture
- **Backend**: Cloudflare Workers (Serverless)
- **Storage**: Cloudflare KV (Distributed Key-Value)
- **AI Models**: OpenRouter API (GPT-4o, Gemini, Claude)
- **Frontend**: Server-side rendered HTML with Bootstrap 5
- **Deployment**: Global CDN via Cloudflare

## Key Features

### 🧠 AI-Powered Analysis
- **Intelligent Paper Analysis**: 500-word summaries using GPT-4o and Gemini
- **Relevance Scoring**: 1-10 scale automatic scoring
- **Technical Depth Assessment**: beginner/intermediate/advanced
- **Smart Categorization**: Automated topic classification
- **Chinese Translation**: Complete Chinese analysis including abstracts

### 📊 Smart Curation
- **Top 10 Daily**: Only highest-scoring papers archived daily
- **Date-Based Indexing**: Browse papers by specific dates
- **Advanced Search**: Full-text search with filters
- **Export System**: JSON, CSV, Markdown, BibTeX formats
- **RSS Feed**: Automated RSS generation

### 👥 User Experience
- **Visitor Tracking**: Privacy-compliant visitor statistics
- **Dual-Column Layout**: Papers list + detailed view
- **Translation Toggle**: Chinese/English language switching
- **Responsive Design**: Mobile-optimized interface

## File Structure

```
target/
├── functions/              # Cloudflare Workers functions
│   └── worker.js          # Main worker entry point
├── src/                   # Core source code
│   ├── config.js          # Configuration constants
│   ├── handlers.js        # Route handlers
│   ├── paper-analyzer.js  # AI analysis logic
│   ├── paper-scraper.js   # Web scraping logic
│   ├── paper-scoring.js   # Scoring algorithms
│   ├── blog-generator.js  # Content generation
│   ├── templates.js       # HTML templates
│   ├── dual-column-templates.js # Main UI template
│   ├── archive-manager.js # Archive system
│   ├── archive-exporter.js # Export functionality
│   ├── archive-handlers.js # Archive API handlers
│   ├── archive-templates.js # Archive UI templates
│   ├── visitor-counter.js # Visitor tracking
│   └── utils.js           # Utility functions
├── test-all-features.js   # Comprehensive test suite
└── wrangler.toml         # Cloudflare Workers config
```

## API Endpoints

### Paper Endpoints
- `GET /` - Main page with top 10 papers
- `GET /api/papers` - List papers (limit=10 default)
- `GET /api/papers/:date` - Papers by date
- `GET /api/papers/:id` - Specific paper
- `POST /api/update` - Manual paper update
- `GET /api/search?q=query` - Search papers

### Archive Endpoints
- `GET /api/archive/dates` - Available archive dates
- `GET /api/archive/:date` - Archive by date
- `GET /api/archive/export` - Export archives
- `GET /api/archive/export/formats` - Available formats
- `GET /api/archive/statistics` - Archive statistics

### Utility Endpoints
- `GET /feed` - RSS feed
- `GET /about` - About page
- `GET /archive` - Archive browser
- `GET /categories` - Paper categories

## Configuration

### Environment Variables
```env
OPENROUTER_API_KEY=your_openrouter_api_key
ADMIN_TOKEN=your_admin_token_for_archive_creation
```

### Model Configuration
- **Analysis Model**: `openai/gpt-4o-mini`
- **Summary Model**: `google/gemini-2.0-flash-001`
- **Translation Model**: `google/gemini-2.0-flash-001`

### Scoring System
- **Relevance Score**: 1-10 scale
- **Technical Depth**: beginner/intermediate/advanced
- **Categories**: computer_vision, machine_learning, nlp, etc.

## Translation System

### Chinese Language Support
- **Complete Translation**: Abstracts, analysis, dates, sources, UI elements
- **Smart Fallback**: English content with Chinese labels when translations unavailable
- **Bilingual Interface**: Headers and buttons show both languages
- **Dynamic Switching**: Real-time language toggle

### Translation Fields
- `chinese_abstract`: Chinese translation of paper abstract
- `chinese_introduction`: Chinese research background
- `chinese_innovations`: Chinese innovation description
- `chinese_experiments`: Chinese experiment details
- `chinese_insights`: Chinese insights and future directions

## Archive System

### Storage Strategy
- **Top 10 Daily**: Only highest-scoring papers archived
- **1-Year TTL**: Automatic cleanup of old archives
- **Metadata Tracking**: Categories, sources, scores, dates
- **Compression**: Large exports automatically compressed

### Export Formats
- **JSON**: Complete data with full analysis
- **CSV**: Structured data for spreadsheets
- **Markdown**: Human-readable with formatting
- **BibTeX**: Academic citation format

## Development Guidelines

### Code Style
- **ES6 Modules**: Modern JavaScript with import/export
- **Async/Await**: Consistent async patterns
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Structured logging with prefixes

### Testing
- **Mock Environment**: Comprehensive test suite with mocks
- **Feature Tests**: Automated testing of all functionality
- **Error Scenarios**: Edge case and error condition testing

### Deployment
- **Cloudflare Workers**: Serverless deployment
- **Global CDN**: Worldwide edge locations
- **KV Storage**: Distributed key-value storage
- **Environment Variables**: Secure configuration management

## Recent Updates

### Translation Enhancement (Latest)
- **Complete Chinese Support**: Full bilingual interface
- **Chinese Abstract Generation**: AI-generated Chinese abstracts
- **Smart Fallback System**: Graceful degradation for missing translations
- **Enhanced UI**: Visual language indicators and bilingual labels

### Archive System (Previous)
- **Top 10 Limitation**: Enforced 10-paper daily limit
- **Random Tie-Breaking**: Fair selection for identical scores
- **Export Functionality**: Multiple format exports with filters
- **Enhanced Navigation**: Archive and about page integration

### Core Features (Initial)
- **AI Analysis**: GPT-4o and Gemini integration
- **Visitor Tracking**: Privacy-compliant visitor statistics
- **Responsive Design**: Mobile-optimized interface
- **RSS Feed**: Automated content syndication

## Common Issues & Solutions

### Translation Issues
- **Problem**: Only titles translated, content remains English
- **Solution**: Complete Chinese translation system implemented
- **Status**: ✅ RESOLVED

### Paper Limit Issues
- **Problem**: Too many papers displayed on mainpage
- **Solution**: Enforced top 10 limitation with random tie-breaking
- **Status**: ✅ RESOLVED

### Archive Issues
- **Problem**: Export functionality not working properly
- **Solution**: Comprehensive error handling and validation
- **Status**: ✅ RESOLVED

## Future Enhancements

### Planned Features
- **User Accounts**: Personal paper collections and preferences
- **Advanced Filters**: More sophisticated search and filtering
- **Email Notifications**: Daily digest subscriptions
- **Mobile App**: Native mobile application

### Technical Improvements
- **Caching Optimization**: Enhanced caching strategies
- **Rate Limiting**: Improved API rate limiting
- **Analytics**: Detailed usage analytics
- **A/B Testing**: Feature experimentation framework

## Contact & Support

For issues, feature requests, or contributions, please refer to the project's GitHub repository or contact the development team through appropriate channels.

---

**Last Updated**: September 2025
**Version**: 2.0 (Post-Translation Enhancement)
**Status**: Production Ready ✅