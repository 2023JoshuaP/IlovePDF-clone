import { useState } from 'react'

function SplitPDF() {
    const [file, setFile] = useState(null)
    const [startPage, setStartPage] = useState(0)
    const [endPage, setEndPage] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleSplit = async () => {
        if (!file) {
            alert('Please select a PDF file first.')
            return
        }
        if (startPage < 1 || endPage < startPage) {
            alert('Please enter valid page numbers.')
            return
        }

        setIsLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        formData.append('start_page', startPage - 1)
        formData.append('end_page', endPage - 1)

        try {
            const response = await fetch('http://127.0.0.1:8000/api/split', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Error splitting PDF or invalid range')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `PDF_split_${startPage}_to_${endPage}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (error) {
            console.error('Error:', error)
            alert('There was a problem. Make sure the pages you wrote actually exist in the PDF.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center w-full'>
            <div className='bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full text-center border border-gray-100'>
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>Dividir PDF</h2>
                <p className='text-gray-500 mb-8'>Extrae un rango específico de páginas de tu documento</p>

                {!file ? (
                    <div className='border-4 border-dashed border-red-200 bg-red-50 rounded-xl p-10 mb-6 relative hover:bg-red-100 transition-colors'>
                        <input 
                            type="file"
                            accept='aplication/pdf' 
                            onChange={handleFileChange}
                            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                        />
                        <div className='text-red-500'>
                            <svg className='mx-auto h-16 w-16 mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                            <span className='text-lg font-semibold block'>Seleccionar Archivo PDF</span>
                        </div>
                    </div>
                ) : (
                    <div className='mb-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200'>
                        <span className='text-gray-700 font-medium truncate w-3/4 text-left'>{file.name}</span>
                        <button
                            onClick={() => setFile(null)}
                            className='text-sm text-red-500 hover:text-red-700 font-bold'                        
                        >
                            Cambiar archivo
                        </button>
                    </div>
                )}

                {file && (
                    <div className='flex gap-4 mb-8 justify-center items-end bg-gray-50 p-6 rounded-xl border border-gray-100'>
                        <div className='flex flex-col text-left'>
                            <label className='text-sm font-semibold text-gray-600'>Página de inicio</label>
                            <input 
                                type="number"
                                min="1"
                                value={startPage}
                                onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                                className='w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-400 focus:outline-none'
                            />
                        </div>
                        <div className='text-gray-400 font-boldpb-2'>-</div>
                        <div className='flex flex-col text-left'>
                            <label className='text-sm font-semibold text-gray-600 mb-1'>Hasta la página:</label>
                            <input 
                                type="number"
                                min="1"
                                value={endPage}
                                onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                                className='w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-400 focus:outline-none'
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSplit}
                    disabled={isLoading || !file}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                        isLoading || !file 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
                    }`}
                >
                    {isLoading ? 'Procesando...' : 'Dividir PDF ahora'}
                </button>
            </div>
        </div>
    )
}

export default SplitPDF