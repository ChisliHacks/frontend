import React from "react";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-2 border-b flex items-center justify-between">
        <span className="text-sm font-medium">PDF Viewer</span>
        <div className="flex items-center space-x-2">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700" title="Open in new tab">
            📋 Open in New Tab
          </a>
        </div>
      </div>
      <div className="flex-1 relative">
        <iframe
          src={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-none"
          title={`${title} PDF`}
          onError={() => {
            console.error("Iframe failed to load PDF");
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gray-50 text-xs text-gray-500 p-2 border-t opacity-90">
          💡 If the PDF doesn't display properly, try{" "}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            opening it in a new tab
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
