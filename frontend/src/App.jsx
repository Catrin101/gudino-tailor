import { useState } from 'react'
import { Button } from './shared/components/Button'
import { Card } from './shared/components/Card'
import { Input } from './shared/components/Input'

function App() {
  const [nombre, setNombre] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          🧵 GudiñoTailor - Sistema de Gestión
        </h1>

        <Card className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Prueba de Componentes</h2>
          
          <div className="space-y-4">
            <Input 
              label="Nombre del Cliente"
              placeholder="Escribe un nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary">Botón Primario</Button>
              <Button variant="success">Botón Éxito</Button>
              <Button variant="danger">Botón Peligro</Button>
              <Button variant="outline">Botón Outline</Button>
            </div>

            {nombre && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-success-700">
                  ✅ Cliente: <strong>{nombre}</strong>
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">Estado de la Configuración:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-success-500">✓</span>
              React + Vite configurado
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-500">✓</span>
              Tailwind CSS funcionando
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-500">✓</span>
              Componentes compartidos creados
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-500">✓</span>
              Conexión a Supabase lista
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default App
