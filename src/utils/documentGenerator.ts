import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { DocumentStructure, LayoutStyle, OutputFormat, ProcessingOptions } from '../types';
import { LayoutApplier } from './layoutStyles';
import { ImageProcessor } from './imageProcessor';

export class DocumentGenerator {
  static async generateDocument(
    document: DocumentStructure,
    layoutStyle: LayoutStyle,
    outputFormat: OutputFormat,
    options: ProcessingOptions
  ): Promise<string> {
    const html = await this.generateHTML(document, layoutStyle, options);
    
    if (outputFormat === 'pdf') {
      return this.generatePDF(html, document.title || 'Document');
    } else {
      return this.generateDocx(html, document.title || 'Document');
    }
  }

  private static async generateHTML(
    document: DocumentStructure,
    layoutStyle: LayoutStyle,
    options: ProcessingOptions
  ): Promise<string> {
    const css = LayoutApplier.generateCSS(layoutStyle);
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${document.title || 'Document'}</title>
        <style>${css}</style>
      </head>
      <body>
    `;

    // Add table of contents if requested
    if (options.tableOfContents) {
      html += this.generateTableOfContents(document);
    }

    // Process content
    for (const element of document.content) {
      switch (element.type) {
        case 'heading':
          html += `<h${element.level || 1}>${element.content}</h${element.level || 1}>`;
          break;
        case 'paragraph':
          let content = element.content;
          
          // Replace image placeholders
          const imagePlaceholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
          content = content.replace(imagePlaceholderRegex, (match, index) => {
            const image = document.images[parseInt(index)];
            if (image) {
              return `<img src="${image.url}" alt="${image.alt}" />`;
            }
            return match;
          });
          
          // Apply Harvard citations if requested
          if (options.harvardCitations) {
            for (const citation of document.citations) {
              content = content.replace(citation.original, citation.harvard);
            }
          }
          
          html += `<p>${content}</p>`;
          break;
        case 'image':
          html += `<img src="${element.content}" alt="" />`;
          break;
      }
    }

    html += '</body></html>';
    return html;
  }

  private static generateTableOfContents(document: DocumentStructure): string {
    const headings = document.content.filter(el => el.type === 'heading');
    
    let toc = '<div class="table-of-contents"><h2>Table of Contents</h2>';
    
    headings.forEach((heading, index) => {
      const level = heading.level || 1;
      toc += `
        <div class="toc-entry level-${level}">
          <span>${heading.content}</span>
          <span>${index + 1}</span>
        </div>
      `;
    });
    
    toc += '</div>';
    return toc;
  }

  private static async generatePDF(html: string, filename: string): Promise<string> {
    // Create a temporary iframe to render the HTML
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument!;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use html2canvas to capture the content
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(iframeDoc.body, {
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scale: 2
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

    // Clean up
    document.body.removeChild(iframe);

    // Save the PDF
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    saveAs(pdfBlob, `${filename}.pdf`);
    
    return url;
  }

  private static async generateDocx(html: string, filename: string): Promise<string> {
    // Convert HTML to DOCX using html-to-docx
    const { default: HTMLtoDOCX } = await import('html-to-docx');
    
    const docxBuffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    const blob = new Blob([docxBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = URL.createObjectURL(blob);
    saveAs(blob, `${filename}.docx`);
    
    return url;
  }
}