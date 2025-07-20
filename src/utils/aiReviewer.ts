import html2canvas from 'html2canvas';
import { AIReviewResult } from '../types';

export class AIReviewer {
  private static readonly OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

  static async reviewDocument(htmlContent: string): Promise<AIReviewResult[]> {
    if (!this.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured');
      return [];
    }

    try {
      // Create screenshots of each page
      const screenshots = await this.capturePages(htmlContent);
      const results: AIReviewResult[] = [];

      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        const review = await this.analyzePageWithGPT(screenshot, i + 1);
        results.push(review);
      }

      return results;
    } catch (error) {
      console.error('AI review failed:', error);
      return [];
    }
  }

  private static async capturePages(htmlContent: string): Promise<string[]> {
    // Create a temporary iframe to render the HTML
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument!;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    const screenshots: string[] = [];
    
    try {
      // For simplicity, capture the entire document as one page
      // In a real implementation, you'd split this into actual pages
      const canvas = await html2canvas(iframeDoc.body, {
        width: 794,
        height: 1123,
        scale: 1
      });
      
      screenshots.push(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }

    // Clean up
    document.body.removeChild(iframe);
    
    return screenshots;
  }

  private static async analyzePageWithGPT(screenshot: string, pageNumber: number): Promise<AIReviewResult> {
    const prompt = `
      Analyze this document page screenshot for formatting quality and adherence to professional document standards.
      
      Please evaluate:
      1. Typography consistency and hierarchy
      2. Spacing and alignment
      3. Image placement and sizing
      4. Overall layout quality
      5. Citation formatting
      6. Table of contents accuracy (if present)
      
      Provide specific issues found and suggestions for improvement.
      Rate the overall quality from 1-10.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { 
                  type: 'image_url', 
                  image_url: { url: screenshot }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      const data = await response.json();
      const analysis = data.choices[0]?.message?.content || '';
      
      // Parse the response (simplified - would need more sophisticated parsing)
      const issues = this.extractIssues(analysis);
      const suggestions = this.extractSuggestions(analysis);
      const score = this.extractScore(analysis);

      return {
        page: pageNumber,
        issues,
        suggestions,
        score
      };
    } catch (error) {
      console.error('GPT analysis failed:', error);
      return {
        page: pageNumber,
        issues: ['AI review unavailable'],
        suggestions: ['Manual review recommended'],
        score: 7
      };
    }
  }

  private static extractIssues(analysis: string): string[] {
    // Simple extraction - would need more sophisticated parsing
    const issueKeywords = ['issue', 'problem', 'inconsistent', 'poor', 'incorrect'];
    const sentences = analysis.split('.').filter(s => s.trim());
    
    return sentences.filter(sentence => 
      issueKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    ).slice(0, 3);
  }

  private static extractSuggestions(analysis: string): string[] {
    const suggestionKeywords = ['suggest', 'recommend', 'improve', 'consider', 'should'];
    const sentences = analysis.split('.').filter(s => s.trim());
    
    return sentences.filter(sentence => 
      suggestionKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    ).slice(0, 3);
  }

  private static extractScore(analysis: string): number {
    const scoreMatch = analysis.match(/(\d+)\/10|(\d+) out of 10|score.*?(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
    }
    return 7; // Default score
  }
}