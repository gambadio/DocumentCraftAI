# DocumentCraft AI

A sophisticated document formatting and processing tool that transforms poorly formatted documents into professionally styled publications. Built with React, TypeScript, and advanced document processing libraries.

## Overview

DocumentCraft AI solves a common problem with documents exported from AI tools like ChatGPT or poorly formatted Word documents: inconsistent styling, missing semantic structure, and broken formatting. The tool intelligently analyzes document structure, applies professional layouts, and generates publication-ready documents.

## Key Features

### 🔄 Intelligent Document Processing
- **Multi-format Support**: Processes both Markdown (.md) and Word (.docx) files
- **Smart Structure Detection**: Automatically identifies headings, subheadings, and body text based on font size analysis
- **Format Normalization**: Converts inconsistent formatting into proper semantic structure

### 🖼️ Advanced Image Handling
- **URL Image Download**: Automatically downloads images from URLs found in documents
- **Position Preservation**: Maintains original image placement in the final document
- **Format Optimization**: Optimizes images for document output

### 📚 Citation Management
- **Harvard Style Conversion**: Automatically converts citations to Harvard referencing format
- **Citation Detection**: Identifies various citation patterns in source documents
- **Bibliography Integration**: Properly formats citations throughout the document

### 🎨 Professional Layout Styles
- **Business Plan**: Clean, professional layout for corporate documents
- **Academic Paper**: Structured format compliant with academic standards
- **Novel/Book**: Reader-friendly typography optimized for long-form reading
- **Modern Report**: Contemporary design with clean typography
- **Classic Document**: Traditional formatting with timeless appeal

### 🤖 AI-Powered Quality Review
- **GPT-4 Vision Integration**: Uses OpenAI's GPT-4 Vision API to review document formatting
- **Quality Scoring**: Provides numerical quality scores for each page
- **Improvement Suggestions**: Offers specific recommendations for formatting improvements
- **Issue Detection**: Identifies typography, spacing, and layout problems

### 📄 Multiple Output Formats
- **PDF Generation**: High-quality PDF output with proper page breaks
- **Word Document**: Native .docx files with preserved formatting
- **Table of Contents**: Automatic TOC generation from document structure

## Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool and development server

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Beautiful, customizable icons
- **CSS Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with breakpoint optimization

### Document Processing Libraries
- **Mammoth.js**: Converts .docx files to HTML while preserving structure
- **Markdown-it**: Robust Markdown parser with extensible plugin system
- **jsPDF**: Client-side PDF generation with advanced formatting
- **html-to-docx**: Converts HTML to Word documents with styling preservation

### Image Processing
- **html2canvas**: Captures document screenshots for AI review
- **File-saver**: Handles file downloads in the browser
- **JSZip**: Manages compressed file operations

### AI Integration
- **OpenAI GPT-4 Vision API**: Advanced document analysis and quality review
- **Custom Prompt Engineering**: Specialized prompts for document formatting analysis

## How It Works

### 1. Document Upload & Analysis
```typescript
// File processing pipeline
const documentStructure = await FileProcessor.processFile(uploadedFile.file);
```

The system accepts either Markdown or Word documents and performs initial analysis:

- **Markdown Files**: Parsed using markdown-it to extract semantic structure
- **Word Documents**: Converted to HTML using Mammoth, then analyzed for font size patterns
- **Structure Detection**: Identifies headings, paragraphs, images, and other elements

### 2. Font Size Analysis Algorithm
For Word documents with inconsistent formatting:

```typescript
private static analyzeFontSizes(doc: Document): { [key: string]: number } {
  const elements = doc.querySelectorAll('*');
  const fontSizeCount: { [key: string]: number } = {};
  
  elements.forEach(element => {
    const style = window.getComputedStyle(element);
    const fontSize = style.fontSize;
    fontSizeCount[fontSize] = (fontSizeCount[fontSize] || 0) + 1;
  });
  
  return fontSizeCount;
}
```

The algorithm:
1. Analyzes all text elements and their font sizes
2. Identifies the most common font size (body text)
3. Classifies larger fonts as headings based on size differences
4. Assigns semantic meaning (H1, H2, H3, etc.) based on relative sizes

### 3. Image Processing Pipeline
```typescript
static async downloadImages(images: ImageElement[]): Promise<ImageElement[]> {
  const processedImages: ImageElement[] = [];
  
  for (const image of images) {
    if (image.url.startsWith('http')) {
      const response = await fetch(image.url);
      const blob = await response.blob();
      processedImages.push({ ...image, blob });
    }
  }
  
  return processedImages;
}
```

### 4. Citation Conversion
The Harvard citation converter:
1. Detects citation patterns using regex
2. Extracts author names and publication years
3. Reformats according to Harvard style guidelines
4. Maintains citation positioning in the document

### 5. Layout Application
Each layout style defines:
- **Typography**: Font families, sizes, and weights
- **Spacing**: Line height, paragraph spacing, margins
- **Colors**: Text colors and accent colors
- **Page Layout**: Margins, columns, headers/footers

```typescript
export const layoutConfigs: Record<LayoutStyle, LayoutConfig> = {
  academic: {
    fonts: {
      title: 'Times New Roman, serif',
      heading: 'Times New Roman, serif',
      body: 'Times New Roman, serif'
    },
    spacing: {
      lineHeight: 2.0,
      paragraphSpacing: 0,
      sectionSpacing: 18
    },
    // ... more configuration
  }
}
```

### 6. AI Quality Review Process
1. **Document Rendering**: Creates visual representation of each page
2. **Screenshot Capture**: Uses html2canvas to capture page images
3. **GPT-4 Vision Analysis**: Sends images to OpenAI API with specialized prompts
4. **Quality Assessment**: Receives detailed feedback on formatting quality
5. **Improvement Suggestions**: Provides actionable recommendations

## File Structure

```
src/
├── components/           # React components (future expansion)
├── types/
│   └── index.ts         # TypeScript type definitions
├── utils/
│   ├── fileProcessor.ts     # Document parsing and analysis
│   ├── imageProcessor.ts    # Image download and processing
│   ├── layoutStyles.ts      # Layout configurations and CSS generation
│   ├── documentGenerator.ts # PDF/DOCX generation
│   └── aiReviewer.ts       # AI-powered quality review
├── App.tsx              # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## Configuration

### Environment Variables
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Supported File Types
- **Input**: `.md` (Markdown), `.docx` (Microsoft Word)
- **Output**: `.pdf` (Portable Document Format), `.docx` (Microsoft Word)

## Processing Options

### Table of Contents Generation
- Automatically scans document for headings (H1-H6)
- Generates hierarchical table of contents
- Includes page numbers and proper indentation
- Supports multiple heading levels

### Harvard Citation Style
- Converts in-text citations to Harvard format: (Author, Year)
- Handles various input citation formats
- Maintains citation positioning in text
- Supports multiple authors and publication years

### Image Download & Embedding
- Fetches images from HTTP/HTTPS URLs
- Converts to base64 for embedding
- Maintains aspect ratios and positioning
- Handles download failures gracefully

### AI Quality Review
- Analyzes typography consistency
- Checks spacing and alignment
- Reviews image placement
- Evaluates overall layout quality
- Provides numerical quality scores (1-10)
- Offers specific improvement suggestions

## Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Performance Considerations

- **File Size Limits**: Optimized for documents up to 50MB
- **Image Processing**: Concurrent download with fallback handling
- **Memory Management**: Efficient blob handling and cleanup
- **Processing Time**: Typical documents process in 10-30 seconds

## Security Features

- **Client-Side Processing**: All document processing happens in the browser
- **No Server Storage**: Files are not uploaded to external servers
- **API Key Protection**: OpenAI API key stored securely in environment variables
- **CORS Handling**: Proper cross-origin resource sharing for image downloads

## Future Enhancements

- **Batch Processing**: Multiple document processing
- **Custom Layout Editor**: User-defined layout styles
- **Advanced Citation Formats**: APA, MLA, Chicago styles
- **Collaborative Features**: Real-time document sharing
- **Cloud Integration**: Google Drive, Dropbox connectivity
- **Template Library**: Pre-built document templates

## Development

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with proper TypeScript types
4. Add comprehensive tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For technical support or feature requests, please open an issue on the GitHub repository.