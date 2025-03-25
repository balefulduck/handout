# GrowGuide / Handout Project Documentation

## 1. Project Overview
- **Project Name**: GrowGuide / Handout
- **Project Vision**: A modern web application serving as a digital handout for grow-workshop participants, allowing them to access learning materials, document their growing process, and seek support.
- **Live Demo**: https://www.drc420.team (Login with username: 'workshop', password: 'drc')
- **Primary Users**: Workshop participants and internal team members

## 2. Technical Architecture

### 2.1 Technology Stack
- **Frontend**: Next.js 15.1.7, React 19.0.0
- **Styling**: Tailwind CSS 3.4.1
- **Authentication**: NextAuth.js
- **Database**: SQLite with Better-SQLite3
- **Additional Libraries**:
  - Headless UI
  - Chart.js
  - Framer Motion
  - HTML2Canvas & jsPDF (for PDF generation)
  - Nodemailer (for email notifications)

### 2.2 Project Structure
- **/src/app**: Core application pages and API routes
  - **/(auth)**: Authentication related pages
  - **/admin**: Admin dashboard and management interfaces
  - **/api**: Backend API endpoints
  - **/drc-info**: Dr. Cannabis information pages
  - **/plants**: Plant journal functionality
  - **/help**: Help and support system
- **/src/components**: Reusable UI components
- **/src/data**: Data models and database interactions
- **/src/lib**: Utility libraries and helpers
- **/src/utils**: Utility functions

## 3. Key Features

### 3.1 Digital Handout
- Workshop information
- Growing guides and resources
- Dr. Cannabis Lexicon with terms like:
  - Lichtplan (Light schedule)
  - Lichtzyklus (Light cycle)
  - Luftfeuchtigkeit (Humidity)
  - pH
  - Temperatur (Temperature)

### 3.2 Plant Journal
- Personalized plant tracking
- Growth documentation
- Visual timeline
- Harvesting records

### 3.3 Help & Support System
- Direct communication with workshop facilitators
- Problem reporting and resolution
- Knowledge base

## 4. User Flows

### 4.1 Authentication Flow
- User login
- First-time user onboarding
- Seed selection process
- Dashboard entry

### 4.2 Plant Journaling Flow
- Creating a new plant record
- Documenting growth phases
- Adding day entries
- Harvesting process

### 4.3 Information Access Flow
- Navigating the Dr. Cannabis Lexicon
- Accessing phase-specific information
- Searching for specific terms

## 5. Recent Architecture Changes

### 5.1 DRC Info Page Restructuring
- Moved from a single dynamic [term] page with JSON data to individual static pages
- Created a component-based architecture with shared UI elements
- Implemented a directory structure where each term has its own folder with page.js
- Maintained the dynamic [term] route as a fallback for terms without dedicated pages

### 5.2 Navigation Pattern Changes
- Centralized back navigation in the ContextMenu component
- Consistent back button positioning in the top-left of navigation bar
- Removed individual back buttons from plant detail pages
- Improved UI consistency following mobile-first design patterns

### 5.3 File Upload Functionality (Temporarily Disabled)
- Current limitation: Vercel serverless environment has read-only filesystem
- File upload UI and processing code preserved in comments
- Future implementation plan: Use cloud storage (AWS S3, Cloudinary, or Vercel Blob Storage)

## 6. Development Guide

### 6.1 Local Development Setup
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Run development server
npm run dev
```

### 6.2 Build and Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### 6.3 Common Issues and Solutions
- File system limitations in Vercel deployments
- Authentication configuration requirements
- Database migration process

## 7. Contribution Guidelines
- Code style and formatting standards
- Pull request process
- Testing requirements

## 8. Future Development Roadmap
- Reimplement file upload functionality with cloud storage
- Expand the Dr. Cannabis Lexicon with additional terms
- Enhance plant journaling with analytics
- Mobile app development

## 9. Contact Information
- Project maintainers
- Support channels
