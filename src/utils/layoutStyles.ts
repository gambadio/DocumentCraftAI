import { LayoutStyle } from '../types';

export interface LayoutConfig {
  fonts: {
    title: string;
    heading: string;
    body: string;
  };
  spacing: {
    lineHeight: number;
    paragraphSpacing: number;
    sectionSpacing: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  pageLayout: {
    margins: string;
    columns: number;
    headerFooter: boolean;
  };
}

export const layoutConfigs: Record<LayoutStyle, LayoutConfig> = {
  business: {
    fonts: {
      title: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    },
    spacing: {
      lineHeight: 1.4,
      paragraphSpacing: 12,
      sectionSpacing: 24
    },
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      text: '#1e293b'
    },
    pageLayout: {
      margins: '2.5cm',
      columns: 1,
      headerFooter: true
    }
  },
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
    colors: {
      primary: '#000000',
      secondary: '#333333',
      text: '#000000'
    },
    pageLayout: {
      margins: '2.54cm',
      columns: 1,
      headerFooter: true
    }
  },
  novel: {
    fonts: {
      title: 'Garamond, serif',
      heading: 'Garamond, serif',
      body: 'Garamond, serif'
    },
    spacing: {
      lineHeight: 1.6,
      paragraphSpacing: 0,
      sectionSpacing: 36
    },
    colors: {
      primary: '#2d1810',
      secondary: '#5d4e37',
      text: '#2d1810'
    },
    pageLayout: {
      margins: '3cm',
      columns: 1,
      headerFooter: false
    }
  },
  modern: {
    fonts: {
      title: 'Helvetica Neue, sans-serif',
      heading: 'Helvetica Neue, sans-serif',
      body: 'Helvetica Neue, sans-serif'
    },
    spacing: {
      lineHeight: 1.5,
      paragraphSpacing: 16,
      sectionSpacing: 32
    },
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      text: '#374151'
    },
    pageLayout: {
      margins: '2cm',
      columns: 1,
      headerFooter: true
    }
  },
  classic: {
    fonts: {
      title: 'Georgia, serif',
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    },
    spacing: {
      lineHeight: 1.6,
      paragraphSpacing: 14,
      sectionSpacing: 28
    },
    colors: {
      primary: '#8b4513',
      secondary: '#a0522d',
      text: '#2f1b14'
    },
    pageLayout: {
      margins: '2.5cm',
      columns: 1,
      headerFooter: true
    }
  }
};

export class LayoutApplier {
  static generateCSS(
    style: LayoutStyle,
    overrides?: { margin?: string; fontFamily?: string }
  ): string {
    const config: LayoutConfig = JSON.parse(
      JSON.stringify(layoutConfigs[style])
    );
    if (overrides?.margin) {
      config.pageLayout.margins = overrides.margin;
    }
    if (overrides?.fontFamily) {
      config.fonts.title = overrides.fontFamily;
      config.fonts.heading = overrides.fontFamily;
      config.fonts.body = overrides.fontFamily;
    }
    
    return `
      @page {
        margin: ${config.pageLayout.margins};
        size: A4;
      }
      
      body {
        font-family: ${config.fonts.body};
        line-height: ${config.spacing.lineHeight};
        color: ${config.colors.text};
        margin: ${config.pageLayout.margins};
        padding: 0;
        box-sizing: border-box;
      }
      
      h1 {
        font-family: ${config.fonts.title};
        color: ${config.colors.primary};
        font-size: 24px;
        font-weight: bold;
        margin-bottom: ${config.spacing.sectionSpacing}px;
        page-break-after: avoid;
      }
      
      h2 {
        font-family: ${config.fonts.heading};
        color: ${config.colors.primary};
        font-size: 20px;
        font-weight: bold;
        margin-top: ${config.spacing.sectionSpacing}px;
        margin-bottom: ${config.spacing.paragraphSpacing}px;
        page-break-after: avoid;
      }
      
      h3 {
        font-family: ${config.fonts.heading};
        color: ${config.colors.secondary};
        font-size: 16px;
        font-weight: bold;
        margin-top: ${config.spacing.paragraphSpacing}px;
        margin-bottom: ${config.spacing.paragraphSpacing}px;
        page-break-after: avoid;
      }
      
      p {
        margin-bottom: ${config.spacing.paragraphSpacing}px;
        text-align: justify;
        orphans: 2;
        widows: 2;
      }
      
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: ${config.spacing.paragraphSpacing}px auto;
      }
      
      .table-of-contents {
        page-break-after: always;
        margin-bottom: ${config.spacing.sectionSpacing}px;
      }
      
      .table-of-contents h2 {
        text-align: center;
        margin-bottom: ${config.spacing.sectionSpacing}px;
      }
      
      .toc-entry {
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
      }
      
      .toc-entry.level-1 {
        font-weight: bold;
        margin-top: 16px;
      }
      
      .toc-entry.level-2 {
        margin-left: 20px;
      }
      
      .toc-entry.level-3 {
        margin-left: 40px;
        font-size: 14px;
      }
    `;
  }
}