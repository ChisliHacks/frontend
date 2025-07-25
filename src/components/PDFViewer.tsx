import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "../styles/pdf.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"react-pdf" | "iframe">("iframe");

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError(error.message);
    setLoading(false);
    // Fallback to iframe
    setViewMode("iframe");
  };

  const goToPrevPage = () => {
    setPageNumber((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber((page) => Math.min(numPages, page + 1));
  };

  if (viewMode === "react-pdf") {
    return (
      <div className="flex flex-col h-full">
        {/* PDF Controls */}
        <div className="bg-gray-100 p-2 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="px-2 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 text-sm"
            >
              ←
            </button>
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="px-2 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 text-sm"
            >
              →
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("iframe")}
              className="px-2 py-1 bg-gray-600 text-white rounded text-xs"
              title="Switch to iframe view"
            >
              📄
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-50 flex justify-center">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading PDF...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="text-red-600 mb-2">
                Failed to load PDF with react-pdf
              </div>
              <button
                onClick={() => setViewMode("iframe")}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Try iframe view
              </button>
            </div>
          )}

          {!loading && !error && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="border shadow-lg"
                width={Math.min(800, window.innerWidth * 0.4)}
              />
            </Document>
          )}
        </div>
      </div>
    );
  }

  // Default iframe view
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-2 border-b flex items-center justify-between">
        <span className="text-sm font-medium">PDF Viewer</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("react-pdf")}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
            title="Switch to react-pdf view"
          >
            📋
          </button>
        </div>
      </div>
      <div className="flex-1">
        <iframe
          src={`${pdfUrl}#view=FitH&toolbar=1`}
          className="w-full h-full border-none"
          title={`${title} PDF`}
        />
        <div className="text-xs text-gray-500 p-2 border-t">
          💡 If the PDF doesn't display, try{" "}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            opening it in a new tab
          </a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
