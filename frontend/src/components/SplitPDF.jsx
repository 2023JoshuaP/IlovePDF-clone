import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function SplitPDF() {
    const [file, setFile] = useState(null)
    const [numPages, setNumPages] = useState(null)
    const [selectedPages, setSelectedPages] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setNumPages(null);
            setSelectedPages([]);
        };
    }

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const togglePageSelection = (pageNumber) => {
        setSelectedPages(prev => {
            if (prev.includes(pageNumber)) {
                return prev.filter(p => p !== pageNumber);
            }
            else {
                return [...prev, pageNumber].sort((a, b) => a - b);
            }
        });
    };

    const handleSplit = async () => {
        if (!file || selectedPages.length === 0) {
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        const pageString = selectedPages.join(',');
        formData.append('pages_string', pageString);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/split', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error processing PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `split_pages_${pageString.replace(/,/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert('There was a problem connecting to the server.')
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl w-full text-center border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Extraer Páginas
                </h2>
            <p className="text-gray-500 mb-8">
                Haz clic en las páginas que deseas extraer de tu documento.
            </p>

            {!file ? (
                <div className="border-4 border-dashed border-red-200 bg-red-50 rounded-xl p-10 mb-6 relative hover:bg-red-100 transition-colors">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-red-500">
                    <div className="text-5xl mb-4">📄</div>
                    <span className="text-lg font-semibold block">
                    Sube un archivo PDF para visualizarlo
                    </span>
                </div>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                <span className="text-gray-700 font-medium truncate w-3/4 text-left">
                    {file.name}
                </span>
                <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded bg-red-50"
                >
                    Cambiar archivo
                </button>
                </div>
            )}

            {file && (
                <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-8 max-h-125 overflow-y-auto">
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                    <p className="text-gray-500 animate-pulse">
                        Cargando documento...
                    </p>
                    }
                    className="flex justify-center"
                >
                    {numPages && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from(new Array(numPages), (el, index) => {
                        const pageNumber = index + 1;
                        const isSelected = selectedPages.includes(pageNumber);

                        return (
                            <div
                            key={pageNumber}
                            className={`relative cursor-pointer transition-all duration-200 rounded overflow-hidden border-4 bg-white ${
                                isSelected
                                ? "border-red-500 scale-105 shadow-md z-10"
                                : "border-transparent hover:border-gray-300 shadow-sm"
                            }`}
                            onClick={() => togglePageSelection(pageNumber)}
                            >
                            {/* Checkbox */}
                            <div className="absolute top-2 right-2 z-20">
                                <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected
                                    ? "bg-red-500 border-red-500"
                                    : "bg-white/80 border-gray-400"
                                }`}
                                >
                                {isSelected && (
                                    <span className="text-white text-sm font-bold">
                                    ✓
                                    </span>
                                )}
                                </div>
                            </div>

                            {/* Etiqueta de Número de página */}
                            <div className="absolute bottom-2 left-2 z-20 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
                                {pageNumber}
                            </div>

                            {/* Render de la miniatura de la página */}
                            <div className="pointer-events-none w-full flex justify-center bg-white p-1">
                                <Page
                                pageNumber={pageNumber}
                                width={120}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                />
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    )}
                </Document>
                </div>
            )}

            {file && (
                <button
                onClick={handleSplit}
                disabled={isLoading || selectedPages.length === 0}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                    isLoading || selectedPages.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 hover:shadow-lg"
                }`}
                >
                {isLoading
                    ? "Procesando en el servidor..."
                    : selectedPages.length > 0
                    ? `Extraer ${selectedPages.length} página(s)`
                    : "Selecciona al menos una página"}
                </button>
            )}
            </div>
        </div>
    );
}

export default SplitPDF