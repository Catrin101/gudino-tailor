import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }) {
    const { isAuthenticated, initializing, user } = useAuth()
    const location = useLocation()

    console.log('🛡️ ProtectedRoute:', {
        initializing,
        isAuthenticated: isAuthenticated(),
        user: user?.email,
        path: location.pathname
    })

    // Mostrar loading mientras se inicializa
    if (initializing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Verificando sesión...</p>
                </div>
            </div>
        )
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated()) {
        console.log('❌ No autenticado, redirigiendo a login')
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    console.log('✅ Autenticado, mostrando contenido protegido')
    // Si está autenticado, mostrar el contenido
    return children
}