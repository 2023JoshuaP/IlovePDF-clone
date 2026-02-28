import { useState } from 'react'
import MergePDF from './components/MergePDF'

function App() {
  const [activeTool, setActiveTool] = useState('home')

  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
      <nav className='bg-white shadow-sm px-8 py-4 flex items-center gap-8'>
        <h1
          className='text-2xl font-black text-red-600 cursor-pointer hover:text-red-700 transition'
          onClick={() => setActiveTool('home')}
        >
          My Ilove PDF
        </h1>
        <div className='hidden md:flex gap-4 text-gray-600 font-medium'>
          <button onClick={() => setActiveTool('merge')} className='hover:text-red-500'>Unir PDF</button>
          <button onClick={() => setActiveTool('split')} className='hover:text-red-500'>Dividir PDF</button>
        </div>
      </nav>

      <main className="p-8 mt-8">
        {activeTool === 'home' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
              Todas las herramientas PDF en un solo lugar
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div 
                onClick={() => setActiveTool('merge')}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-red-200 group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔗</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Unir PDF</h3>
                <p className="text-gray-500 text-sm">Une PDFs y ponlos en el orden que prefieras. Rápido y fácil.</p>
              </div>

              <div 
                onClick={() => setActiveTool('split')}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-red-200 group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✂️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Dividir PDF</h3>
                <p className="text-gray-500 text-sm">Extrae páginas, divide un PDF o separa cada página en archivos independientes.</p>
              </div>

            </div>
          </div>
        )}

        {activeTool === 'merge' && <MergePDF />}
        {activeTool === 'split' && (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-bold mb-4">Herramienta de División en construcción 🚧</h2>
            <p>¡Aquí conectaremos el endpoint /api/split que ya tenemos en Python!</p>
          </div>
        )}

      </main>
    </div>
  )
}

export default App