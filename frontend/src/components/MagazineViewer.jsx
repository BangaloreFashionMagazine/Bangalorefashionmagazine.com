import { useState, useEffect, useRef } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";

// Loaded lazily (not at module scope) so the ~110KB pdf.js bundle only
// downloads when a visitor actually opens the magazine viewer.
let _pdfjsLib = null;
async function loadPdfjs() {
  if (_pdfjsLib) return _pdfjsLib;
  const lib = await import("pdfjs-dist/legacy/build/pdf");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  _pdfjsLib = lib;
  return lib;
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Page-by-page magazine viewer for an admin-uploaded PDF (base64 data URL).
// Renders each page to a canvas via pdf.js so visitors can flip through pages
// and download either the current page (as an image) or the full PDF.
const MagazineViewer = ({ fileData, fileName, title, onClose }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!fileData) return;
    setLoading(true);
    setError(false);
    loadPdfjs().then((pdfjsLib) => {
      if (cancelled) return;
      const bytes = dataUrlToUint8Array(fileData);
      return pdfjsLib.getDocument({ data: bytes }).promise.then((doc) => {
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      });
    }).catch(() => {
      if (!cancelled) { setError(true); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [fileData]);

  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    pdf.getPage(currentPage).then((page) => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale: 2 });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      page.render({ canvasContext: ctx, viewport });
    });
    return () => { cancelled = true; };
  }, [pdf, currentPage]);

  const downloadPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = (fileName || "magazine").replace(/\.pdf$/i, "");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${base}-page-${currentPage}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0A1628] rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-[#D4AF37]/30" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between flex-shrink-0">
          <h3 className="text-[#F5F5F0] font-bold truncate pr-4">{title || "Magazine"}</h3>
          <button onClick={onClose} className="text-[#A0A5B0] hover:text-[#F5F5F0] flex-shrink-0"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/30 min-h-[300px]">
          {loading && <p className="text-[#A0A5B0]">Loading magazine...</p>}
          {error && (
            <div className="text-center px-4">
              <p className="text-red-400 mb-3">Could not load page-by-page view for this file.</p>
              <a href={fileData} download={fileName || "magazine.pdf"} className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#050A14] rounded-lg font-bold text-sm">
                <Download size={16} /> Download PDF Instead
              </a>
            </div>
          )}
          {!loading && !error && <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" />}
        </div>

        {!loading && !error && numPages > 0 && (
          <div className="p-4 border-t border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 bg-[#050A14] text-[#F5F5F0] rounded disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[#A0A5B0] text-sm whitespace-nowrap">Page {currentPage} of {numPages}</span>
              <button disabled={currentPage >= numPages} onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 bg-[#050A14] text-[#F5F5F0] rounded disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadPage} className="px-3 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm font-medium flex items-center gap-1.5">
                <Download size={14} /> This Page
              </button>
              <a href={fileData} download={fileName || "magazine.pdf"} className="px-3 py-1.5 bg-[#D4AF37] text-[#050A14] rounded text-sm font-bold flex items-center gap-1.5">
                <Download size={14} /> Full PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagazineViewer;
