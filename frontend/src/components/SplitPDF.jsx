import { useState, useEffect } from 'react'
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
    const [isLoading, setIsLoading] = useState(false)

    const [mode, setMode] = useState('range')
    const [startPage, setStartPage] = useState(1)
    const [endPage, setEndPage] = useState(1)
    const [selectedPages, setSelectedPages] = useState([])

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
        setEndPage(numPages)

        setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1))
    }

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0])
            setNumPages(null)
            setStartPage(1)
        }
    }

    const togglePageSelection = (pageNumber) => {
        setSelectedPages(prev =>
            prev.includes(pageNumber)
                ? prev.filter(p => p !== pageNumber)
                : [...prev, pageNumber].sort((a, b) => a - b)
        )
    }

    const handleSplit = async () => {
        if (!file) {
            return
        }

        let pagesString = ''
        if (mode === 'range') {
            if (startPage < 1 || endPage > numPages || startPage > endPage) {
                alert('Invalid page range')
                return
            }
            pagesString = `${startPage}-${endPage}`
        }
        else {
            if (selectedPages.length === 0) {
                alert('No pages selected')
                return
            }
            pagesString = selectedPages.join(',')
        }

        setIsLoading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('pages_string', pagesString)

        try {
            const response = await fetch('http://127.0.0.1:8000/api/split', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Error processing PDF')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `pdf_split_${pagesString.replace(/,/g, '_')}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (error) {
            console.error(error)
            alert('There was a problem connecting to the server.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!file) {
        return (
            <div className='flex flex-col items-center justify-center w-full mt-10'>
                <div className='bg-white p-12 rounded-2xl shadow-lg max-w-2xl w-full text-center border border-gray-100'>
                    <h2 className='text-4xl font-bold text-gray-800 mb-4'>Dividir PDF</h2>
                    <p className='text-gray-500 mb-8 text-lg'>Extrae páginas o divide un PDF.</p>
                    <div className='border-4 border-dashed border-red-200 bg-red-50 rounded-xl p-16 relative hover:bg-red-100 transition-colors'>
                        <input
                            type="file"
                            accept='application/pdf'
                            onChange={handleFileChange}
                            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                        />
                        <div className='text-red-500'>
                            <span className='text-xl font-bold bg-red-500 text-white py-3 px-8 rounded-lg inline-block shadow-md'>
                                Seleccionar un archivo PDF
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col md:flex-row w-full min-h-[80vh] bg-gray-50 border-t border-gray-200 -mt-8 pt-8 px-4 gap-6 absolute left-0 right-0'>
            <div className='flex-1 flex flex-col items-center overflow-y-auto pb-10'>
                <div className='w-full max-w-4xl flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-6'>
                    <span className='font-semibold text-gray-700 truncate'>{file.name}</span>
                    <button onClick={() => setFile(null)} className='text-red-500 hover:text-red-700 text-sm font-bold'>Cerrar</button>
                </div>
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<p className="text-gray-500 animate-pulse">Cargando visualización...</p>}
                    className='w-full max-w-4xl flex justify-center'
                >
                    {numPages && mode === 'range' && (
                        <div className='flex flex-col items-center w-full'>
                            <span className='text-gray-500 mb-2 font-medium'>Rango 1</span>
                            <div className='flex items-center justify-center gap-6 p-8 border border-dashed border-gray-400 bg-gray-100/50 rounded-lg w-full'>
                                <div className='bg-white p-2 shadow-md rounded'>
                                    <Page pageNumber={startPage} width={150} renderTextLayer={false} renderAnnotationLayer={false} />
                                    <p className='text-center text-gray-500 text-sm mt-2'>{startPage}</p>
                                </div>

                                {startPage !== endPage && (
                                    <>
                                        <div className='text-4xl text-gray-400 tracking-widest'>...</div>
                                        <div className='bg-white p-2 shadow-md rounded'>
                                            <Page pageNumber={endPage} width={150} renderTextLayer={false} renderAnnotationLayer={false} />
                                            <p className='text-center text-gray-500 text-sm mt-2'>{endPage}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {numPages && mode === 'extract' && (
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full px-4'>
                            {Array.from(new Array(numPages), (el, index) => {
                                const pageNum = index + 1
                                const isSelected = selectedPages.includes(pageNum)

                                return (
                                    <div
                                        key={pageNum}
                                        onClick={() => togglePageSelection(pageNum)}
                                        className={`relative cursor-pointer transition-all bg-white p-2 shadow-sm rounded-lg border-2 ${isSelected ? 'border-green-500' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <div className='absolute top-2 left-2 z-10'>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-500' : 'bg-gray-200'}`} >
                                                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                                            </div>
                                        </div>
                                        <div className='pointer-events-none flex justify-center'>
                                            <Page pageNumber={pageNum} width={140} renderTextLayer={false} renderAnnotationLayer={false} />
                                        </div>
                                        <p className='text-center text-gray-500 text-sm mt-2'>{pageNum}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Document>
            </div>

            <div className='w-full md:w-80 bg-white border border-gray-200 rounded-t-xl md:rounded-l-xl md:rounded-tr-none shadow-xl flex flex-col z-10 fixed bottom-0 md:relative h-[50vh] md:h-auto overflow-y-auto'>
                <h3 className='text-2xl font-bold text-center py-6 border-b border-gray-100'>Dividir</h3>

                <div className='flex border-b border-gray-200 bg-gray-50'>
                    <button
                        onClick={() => setMode('range')}
                        className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 border-b-2 transition-colors ${mode === 'range' ? 'border-red-500 text-red-500 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                    >
                        <span className='text-2xl'>[-]</span>
                        <span className='font-semibold text-sm'>Rango</span>
                    </button>
                    <button
                        onClick={() => setMode('extract')}
                        className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 border-b-2 transition-colors ${mode === 'extract' ? 'border-red-500 text-red-500 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                    >
                        <span className='text-2xl'>📄</span>
                        <span className='font-semibold text-sm'>Páginas</span>
                    </button>
                </div>

                <div className='p-6 flex-1 flex flex-col'>
                    {mode === 'range' && (
                        <div className='animate-fade-in'>
                            <p className='font-bold text-gray-700 mb-4'>Modo de Rango:</p>
                            <div className='flex gap-2 mb-6'>
                                <button className='flex-1 py-2 border border-red-500 text-red-500 rounded font-medium'>Personalizado</button>
                                <button className='flex-1 py-2 bg-gray-100 text-gray-400 rounded font-medium cursor-not-allowed'>Fijo</button>
                            </div>

                            <div className='bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-2'>
                                <span className='text-gray-600 text-sm'>de la página</span>
                                <input
                                    type="number" min='1' max={numPages || 1}
                                    value={startPage} onChange={(e) => setStartPage(Number(e.target.value))}
                                    className='w-16 p-1 border border-gray-300 rounded text-center'
                                />
                                <span className='text-gray-600 text-sm'>a</span>
                                <input
                                    type="number" min='1' max={numPages || 1}
                                    value={endPage} onChange={(e) => setEndPage(Number(e.target.value))}
                                    className='w-16 p-1 border border-gray-300 rounded text-center'
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'extract' && (
                        <div className='animate-fade-in'>
                            <p className='font-bold text-gray-700 mb-4'>Modo de extracción:</p>
                            <div className='flex gap-2 mb-6'>
                                <button
                                    onClick={() => setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1))}
                                    className='flex-1 py-2 border border-red-500 text-red-500 rounded font-medium text-sm'
                                >
                                    Todas las páginas
                                </button>
                                <button
                                    onClick={() => setSelectedPages([])}
                                    className='flex-1 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded font-medium text-sm'
                                >
                                    Deseleccionar
                                </button>
                            </div>
                            <div className='bg-blue-50 text-blue-700 p-4 rounded text-sm flex gap-3'>
                                <span>ℹ️</span>
                                <p>Las páginas seleccionadas se incluirán en el PDF resultante.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className='p-6 border-t border-gray-100 bg-white'>
                    <button
                        onClick={handleSplit}
                        disabled={isLoading || (mode === 'extract' && selectedPages.length === 0)}
                        className='w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-xl transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2 shadow-lg'
                    >
                        {isLoading ? 'Procesando...' : 'Dividir PDF'}
                        {!isLoading && <span>→</span>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SplitPDF