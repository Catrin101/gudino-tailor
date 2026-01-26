import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '../shared/components/Button'

export function LoginPage() {
    const { login, loading, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)

    // Redirigir si ya está autenticado
    useEffect(() => {
        console.log('🔍 LoginPage: verificando autenticación...')
        if (isAuthenticated()) {
            console.log('✅ Ya autenticado, redirigiendo...')
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.email.trim()) {
            setError('El email es obligatorio')
            return
        }

        if (!formData.password) {
            setError('La contraseña es obligatoria')
            return
        }

        console.log('📝 Enviando formulario de login...')
        const result = await login(formData.email, formData.password)

        if (result.success) {
            console.log('✅ Login exitoso, esperando redirección...')
            // Esperar un momento para que el estado se actualice
            setTimeout(() => {
                console.log('🔄 Forzando navegación al dashboard...')
                navigate('/', { replace: true })
            }, 100)
        } else {
            console.error('❌ Login fallido:', result.error)
            setError(result.error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-white font-bold text-3xl">GT</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        GudiñoTailor
                    </h1>
                    <p className="text-gray-600">
                        Sistema de Gestión de Sastrería
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Iniciar Sesión
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0" />
                                <p className="text-sm text-danger-800">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    disabled={loading}
                                    autoComplete="email"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={mostrarPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit(e)
                                        }
                                    }}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="current-password"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPassword(!mostrarPassword)}
                                    disabled={loading}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {mostrarPassword ? (
                                        <span className="text-sm">👁️</span>
                                    ) : (
                                        <span className="text-sm">👁️‍🗨️</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            variant="primary"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Iniciar Sesión
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Información:</strong> Este sistema está diseñado para uso exclusivo
                                de Casa Gudiño. Si olvidaste tu contraseña, contacta al administrador del sistema.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>GudiñoTailor v1.0</p>
                    <p className="mt-1">
                        © {new Date().getFullYear()} Casa Gudiño. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    )
}