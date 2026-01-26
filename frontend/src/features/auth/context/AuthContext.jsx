import { createContext, useContext, useState, useEffect } from 'react'
import { AuthService } from '../services/AuthService'

const AuthContext = createContext()

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [initializing, setInitializing] = useState(true)

    const authService = new AuthService()

    useEffect(() => {
        initAuth()

        const { data: { subscription } } = authService.onAuthStateChange(
            async (event, session) => {
                console.log('🔄 Auth event:', event, session?.user?.email)

                if (event === 'SIGNED_IN') {
                    setSession(session)
                    setUser(session?.user || null)
                    setLoading(false)
                } else if (event === 'SIGNED_OUT') {
                    setSession(null)
                    setUser(null)
                    setLoading(false)
                } else if (event === 'TOKEN_REFRESHED') {
                    setSession(session)
                    setUser(session?.user || null)
                } else if (event === 'INITIAL_SESSION') {
                    setSession(session)
                    setUser(session?.user || null)
                    setLoading(false)
                }
            }
        )

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    const initAuth = async () => {
        try {
            setLoading(true)
            console.log('🔄 Inicializando autenticación...')

            const currentSession = await authService.getSession()

            if (currentSession) {
                console.log('✅ Sesión encontrada:', currentSession.user.email)
                setSession(currentSession)
                setUser(currentSession.user)
            } else {
                console.log('❌ No hay sesión activa')
            }
        } catch (error) {
            console.error('❌ Error al inicializar auth:', error)
            setSession(null)
            setUser(null)
        } finally {
            setLoading(false)
            setInitializing(false)
        }
    }

    const login = async (email, password) => {
        try {
            setLoading(true)
            console.log('🔐 Intentando login...')

            const { user: authUser, session: authSession } = await authService.login(email, password)

            console.log('✅ Login exitoso, configurando estado...')
            setUser(authUser)
            setSession(authSession)

            // Forzar la actualización del estado antes de retornar
            await new Promise(resolve => setTimeout(resolve, 100))

            return { success: true }
        } catch (error) {
            console.error('❌ Error en login:', error)
            return {
                success: false,
                error: error.message
            }
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        try {
            setLoading(true)
            console.log('🚪 Cerrando sesión...')

            await authService.logout()

            // Limpiar estado inmediatamente
            setUser(null)
            setSession(null)

            return { success: true }
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error)
            return {
                success: false,
                error: error.message
            }
        } finally {
            setLoading(false)
        }
    }

    const isAuthenticated = () => {
        const authenticated = user !== null && session !== null
        console.log('🔍 isAuthenticated:', authenticated, { user: user?.email, hasSession: !!session })
        return authenticated
    }

    const getUserData = () => {
        if (!user) return null

        return {
            id: user.id,
            email: user.email,
            nombre: 'Don Enrique',
            rol: 'Administrador'
        }
    }

    const value = {
        user,
        session,
        loading,
        initializing,
        login,
        logout,
        isAuthenticated,
        getUserData
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}