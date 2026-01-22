import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

/**
 * Layout principal de la aplicación
 * Incluye navbar, sidebar y área de contenido
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleSearch = (termino) => {
    console.log('Buscando:', termino)
    // TODO: Implementar búsqueda global
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar superior */}
      <Navbar 
        onToggleSidebar={toggleSidebar}
        onSearch={handleSearch}
      />

      {/* Sidebar lateral */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Área de contenido principal */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
