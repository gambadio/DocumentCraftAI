import mammoth from 'mammoth';
import MarkdownIt from 'markdown-it';
import { DocumentStructure, DocumentElement, ImageElement } from '../types';

const md = new MarkdownIt();

export class FileProcessor {
  static async processFile(file: File): Promise<DocumentStructure> {
    const fileType = file.name.toLowerCase().endsWith('.md') ? 'md' : 'docx';
    
    if (fileType === 'md') {
      return this.processMarkdown(file);
    } else {
      return this.processDocx(file);
    }
  }

  private static async processMarkdown(file: File): Promise<DocumentStructure> {
    const text = await file.text();
    const tokens = md.parse(text, {});
    
    const content: DocumentElement[] = [];
    const images: ImageElement[] = [];
    let position = 0;

    for (const token of tokens) {
      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.substring(1));
        const contentToken = tokens[tokens.indexOf(token) + 1];
        content.push({
          type: 'heading',
          level,
          content: contentToken?.content || '',
          style: this.getHeadingStyle(level)
        });
      } else if (token.type === 'paragraph_open') {
        const contentToken = tokens[tokens.indexOf(token) + 1];
        if (contentToken?.content) {
          // Check for image links
          const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
          let match;
          let paragraphContent = contentToken.content;
          
          while ((match = imageRegex.exec(contentToken.content)) !== null) {
            images.push({
              url: match[2],
              alt: match[1],
              position: position
            });
            paragraphContent = paragraphContent.replace(match[0], `[IMAGE_PLACEHOLDER_${images.length - 1}]`);
          }
          
          content.push({
            type: 'paragraph',
            content: paragraphContent
          });
        }
      }
      position++;
    }

    return {
      content,
      images,
      citations: this.extractCitations(text)
    };
  }

  private static async processDocx(file: File): Promise<DocumentStructure> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    // Convert HTML to our document structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(result.value, 'text/html');
    
    const content: DocumentElement[] = [];
    const images: ImageElement[] = [];
    
    // Process elements and normalize formatting
    const elements = doc.body.children;
    const fontSizes = this.analyzeFontSizes(doc);
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const fontSize = this.getElementFontSize(element);
      const elementType = this.classifyElement(element, fontSize, fontSizes);
      
      if (element.tagName === 'IMG') {
        images.push({
          url: (element as HTMLImageElement).src,
          alt: (element as HTMLImageElement).alt || '',
          position: i
        });
      } else {
        content.push({
          type: elementType.type as any,
          level: elementType.level,
          content: element.textContent || '',
          style: elementType.style
        });
      }
    }

    return {
      content,
      images,
      citations: this.extractCitations(result.value)
    };
  }

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

  private static getElementFontSize(element: Element): string {
    const style = (element as HTMLElement).style;
    return style.fontSize || '16px';
  }

  private static classifyElement(element: Element, fontSize: string, fontSizes: { [key: string]: number }) {
    const text = element.textContent || '';
    const size = parseInt(fontSize);
    
    // Find the most common font size (likely body text)
    const mostCommonSize = parseInt(
      Object.keys(fontSizes).reduce((a, b) => fontSizes[a] > fontSizes[b] ? a : b)
    );
    
    // Classify based on size relative to body text
    if (size > mostCommonSize + 8) {
      return { type: 'heading', level: 1, style: 'title' };
    } else if (size > mostCommonSize + 4) {
      return { type: 'heading', level: 2, style: 'subtitle' };
    } else if (size > mostCommonSize + 2) {
      return { type: 'heading', level: 3, style: 'subheading' };
    } else {
      return { type: 'paragraph', level: undefined, style: 'body' };
    }
  }

  private static getHeadingStyle(level: number): string {
    const styles = {
      1: 'title',
      2: 'subtitle', 
      3: 'subheading',
      4: 'minor-heading',
      5: 'caption',
      6: 'caption'
    };
    return styles[level as keyof typeof styles] || 'body';
  }

  private static extractCitations(text: string) {
    // Simple citation detection - can be enhanced
    const citationRegex = /\([^)]*\d{4}[^)]*\)/g;
    const citations = [];
    let match;
    let position = 0;
    
    while ((match = citationRegex.exec(text)) !== null) {
      citations.push({
        original: match[0],
        harvard: this.convertToHarvard(match[0]),
        position: match.index
      });
    }
    
    return citations;
  }

  private static convertToHarvard(citation: string): string {
    // Basic Harvard conversion - would need more sophisticated parsing
    // This is a simplified example
    const cleaned = citation.replace(/[()]/g, '');
    const parts = cleaned.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
      const author = parts[0];
      const year = parts.find(p => /\d{4}/.test(p));
      return year ? `(${author}, ${year})` : citation;
    }
    
    return citation;
  }
}