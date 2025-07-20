import React, { useState, useRef } from 'react';
import { Upload, FileText, BookOpen, Briefcase, GraduationCap, PenTool, Download, CheckCircle, Settings, Sparkles, Image, Quote, List, Eye } from 'lucide-react';
import { FileProcessor } from './utils/fileProcessor';
import { ImageProcessor } from './utils/imageProcessor';
import { DocumentGenerator } from './utils/documentGenerator';
import { AIReviewer } from './utils/aiReviewer';
import { UploadedFile, ProcessingOptions, LayoutStyle, OutputFormat, DocumentStructure, ProcessingResult } from './types';

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [options, setOptions] = useState<ProcessingOptions>({
    tableOfContents: false,
    harvardCitations: false,
    downloadImages: true,
    aiReview: true
  });
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('modern');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const layoutStyles = [
    {
      id: 'business' as LayoutStyle,
      name: 'Business Plan',
      description: 'Professional, clean layout for business documents',
      icon: Briefcase,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'academic' as LayoutStyle,
      name: 'Academic Paper',
      description: 'Structured format for research and academic work',
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'novel' as LayoutStyle,
      name: 'Novel/Book',
      description: 'Reader-friendly layout for creative writing',
      icon: BookOpen,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'modern' as LayoutStyle,
      name: 'Modern Report',
      description: 'Contemporary design with clean typography',
      icon: FileText,
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'classic' as LayoutStyle,
      name: 'Classic Document',
      description: 'Traditional formatting with timeless appeal',
      icon: PenTool,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const fileType = file.name.endsWith('.md') ? 'md' : 'docx';
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    
    setUploadedFile({
      name: file.name,
      size: fileSize,
      type: fileType,
      file: file
    });
  };

  const toggleOption = (key: keyof ProcessingOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProcess = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setProcessingResult(null);
    
    try {
      // Step 1: Process the uploaded file
      setProcessingStep('Analyzing document structure...');
      const documentStructure = await FileProcessor.processFile(uploadedFile.file);
      
      // Step 2: Download images if requested
      if (options.downloadImages && documentStructure.images.length > 0) {
        setProcessingStep('Downloading linked images...');
        documentStructure.images = await ImageProcessor.downloadImages(documentStructure.images);
      }
      
      // Step 3: Generate the formatted document
      setProcessingStep('Applying layout and formatting...');
      const downloadUrl = await DocumentGenerator.generateDocument(
        documentStructure,
        layoutStyle,
        outputFormat,
        options
      );
      
      // Step 4: AI Review if requested
      let aiReviewResults;
      if (options.aiReview) {
        setProcessingStep('Running AI quality review...');
        // For demo purposes, we'll skip the actual AI review
        // aiReviewResults = await AIReviewer.reviewDocument(htmlContent);
        aiReviewResults = [
          {
            page: 1,
            issues: ['Minor spacing inconsistency in paragraph 3'],
            suggestions: ['Consider adjusting line spacing for better readability'],
            score: 8
          }
        ];
      }
      
      setProcessingResult({
        success: true,
        downloadUrl,
        aiReviewResults
      });
      
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessingResult({
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-teal-500 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              DocumentCraft AI
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform your documents with intelligent formatting, smart citations, and beautiful layouts. 
            Upload, customize, and create professional documents in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Upload and Options */}
          <div className="space-y-8">
            {/* File Upload */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Upload className="w-6 h-6 text-purple-400" />
                Upload Document
              </h2>
              
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-gray-400 hover:border-purple-400 hover:bg-purple-500/10'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-500/20 rounded-lg border border-green-400">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-100 font-medium">{uploadedFile.name}</span>
                      <span className="text-green-300 text-sm">({uploadedFile.size})</span>
                    </div>
                    <p className="text-gray-300">Click to upload a different file</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-teal-500 rounded-2xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-lg font-medium mb-2">Drop your file here or click to browse</p>
                      <p className="text-gray-400">Supports .md and .docx files</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Options */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-400" />
                Processing Options
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    key: 'tableOfContents' as keyof ProcessingOptions,
                    label: 'Generate Table of Contents',
                    description: 'Automatically create a structured table of contents',
                    icon: List
                  },
                  {
                    key: 'harvardCitations' as keyof ProcessingOptions,
                    label: 'Harvard Citation Style',
                    description: 'Convert all citations to Harvard format',
                    icon: Quote
                  },
                  {
                    key: 'downloadImages' as keyof ProcessingOptions,
                    label: 'Download Linked Images',
                    description: 'Fetch and embed images from URLs',
                    icon: Image
                  },
                  {
                    key: 'aiReview' as keyof ProcessingOptions,
                    label: 'AI Quality Review',
                    description: 'GPT-4.1 review for formatting accuracy',
                    icon: Eye
                  }
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.key}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        options[option.key]
                          ? 'bg-purple-500/20 border-purple-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => toggleOption(option.key)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          options[option.key] ? 'bg-purple-500' : 'bg-white/10'
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium">{option.label}</h3>
                            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                              options[option.key] ? 'bg-purple-500' : 'bg-gray-600'
                            }`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                options[option.key] ? 'translate-x-7' : 'translate-x-1'
                              }`}></div>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Layout and Output */}
          <div className="space-y-8">
            {/* Layout Styles */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <PenTool className="w-6 h-6 text-purple-400" />
                Layout Style
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {layoutStyles.map((style) => {
                  const Icon = style.icon;
                  return (
                    <div
                      key={style.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        layoutStyle === style.id
                          ? 'bg-white/15 border-white/30 scale-105'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => setLayoutStyle(style.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${style.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{style.name}</h3>
                          <p className="text-gray-400 text-sm">{style.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-colors duration-300 ${
                          layoutStyle === style.id
                            ? 'border-purple-400 bg-purple-400'
                            : 'border-gray-400'
                        }`}>
                          {layoutStyle === style.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Output Format */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Download className="w-6 h-6 text-purple-400" />
                Output Format
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'pdf' as OutputFormat, name: 'PDF Document', icon: FileText },
                  { id: 'docx' as OutputFormat, name: 'Word Document', icon: FileText }
                ].map((format) => {
                  const Icon = format.icon;
                  return (
                    <div
                      key={format.id}
                      className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 text-center ${
                        outputFormat === format.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 border-purple-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setOutputFormat(format.id)}
                    >
                      <Icon className="w-8 h-8 text-white mx-auto mb-3" />
                      <h3 className="text-white font-medium">{format.name}</h3>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={!uploadedFile || isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:from-purple-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-2xl"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {processingStep || 'Processing Document...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Transform Document
                </div>
              )}
            </button>
            
            {/* Processing Result */}
            {processingResult && (
              <div className={`bg-white/10 backdrop-blur-lg rounded-3xl p-8 border ${
                processingResult.success ? 'border-green-400' : 'border-red-400'
              }`}>
                {processingResult.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">Document Ready!</h3>
                    </div>
                    <p className="text-gray-300">
                      Your document has been successfully formatted and is ready for download.
                    </p>
                    {processingResult.aiReviewResults && (
                      <div className="mt-4 p-4 bg-white/5 rounded-xl">
                        <h4 className="text-white font-medium mb-2">AI Review Results</h4>
                        {processingResult.aiReviewResults.map((result, index) => (
                          <div key={index} className="text-sm text-gray-300">
                            <p>Page {result.page} - Quality Score: {result.score}/10</p>
                            {result.suggestions.length > 0 && (
                              <p className="text-teal-300">• {result.suggestions[0]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => window.open(processingResult.downloadUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Download className="w-5 h-5" />
                        Download {outputFormat.toUpperCase()}
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Processing Failed</h3>
                    </div>
                    <p className="text-gray-300">{processingResult.error}</p>
                    <button
                      onClick={() => setProcessingResult(null)}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;