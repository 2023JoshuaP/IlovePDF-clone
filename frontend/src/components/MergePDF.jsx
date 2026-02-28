import React from 'react'
import { useState } from 'react'

function MergePDF() {
    const [files, setFiles] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files))
    }

    const handleMerge = async () => {
        if (files.length < 2) {
            alert("Please select at least 2 PDF files to merge.")
            return
        }

        setIsLoading(true)
        const formData = new FormData()
        files.forEach(file => {
            formData.append('files', file)
        })

        try {
            const response = await fetch('http://127.0.0.1:8000/api/merge', {
                method: 'POST',
                body: formData
            })
            
            if (!response.ok) {
                throw new Error(`Error at merging PDFs: ${response.status}`)
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'merged.pdf'
            document.body.appendChild(a)
            a.click()
            a.remove()

        } catch (error) {
            console.error("Error merging PDFs:", error)
            alert("An error occurred while merging PDFs.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center w-full'>
            <div className='bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full text-center border border-gray-100'>
                <h2 className='text-3xl font-bold text-gray-800 mb-2'>Unir PDFs</h2>
                <p className='text-gray-500 mb-8'>Selecciona varios archivos y únelos en uno solo</p>

                <div className='border-4 border-dashed border-red-200 bg-red-50 rounded-xl p-10 mb-6 relative hover:bg-red-100 transition-colors'>
                    <input 
                        type="file" 
                        multiple 
                        accept='application/pdf'
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <div className='text-red-500'>
                        <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className='text-lg font-semibold block'>Selecciona tus archivos PDF</span>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className='mb-6 text-left bg-gray-50 p-4 rounded-lg'>
                        <p className='font-semibold text-gray-700 mb-2'>Archivos listos ({files.length}):</p>
                        <ul className='list-disc pl-5 text-sm text-gray-600'>
                            {files.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={handleMerge}
                    disabled={isLoading || files.length < 2}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                        isLoading || files.length < 2 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
                    }`}
                >
                    {isLoading ? 'Unificando...' : 'Unir PDFs'}
                </button>
            </div>
        </div>
    )
}

export default MergePDF