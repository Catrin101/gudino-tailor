import { supabase } from '../../../core/config/supabase'

/**
 * Servicio de autenticación con Supabase
 */
export class AuthService {
    /**
     * Iniciar sesión
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>}
     */
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
                options: {
                    redirectTo: window.location.origin // ← AGREGAR ESTA LÍNEA
                }
            })

            if (error) {
                console.error('Error de login:', error) // ← AGREGAR LOG
                throw new Error(this.translateError(error.message))
            }

            if (!data.user) {
                throw new Error('No se pudo iniciar sesión')
            }

            console.log('Login exitoso:', data.user.email) // ← AGREGAR LOG
            return {
                user: data.user,
                session: data.session
            }
        } catch (error) {
            console.error('Error en AuthService.login:', error) // ← AGREGAR LOG
            throw new Error(error.message)
        }
    }

    /**
     * Cerrar sesión
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw new Error('Error al cerrar sesión')
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    /**
     * Obtener sesión actual
     * @returns {Promise<Object|null>}
     */
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                throw new Error('Error al obtener sesión')
            }

            return data.session
        } catch (error) {
            console.error('Error al obtener sesión:', error)
            return null
        }
    }

    /**
     * Obtener usuario actual
     * @returns {Promise<Object|null>}
     */
    async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser()

            if (error) {
                throw new Error('Error al obtener usuario')
            }

            return data.user
        } catch (error) {
            console.error('Error al obtener usuario:', error)
            return null
        }
    }

    /**
     * Escuchar cambios en la autenticación
     * @param {Function} callback 
     * @returns {Object} Subscription
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session)
        })
    }

    /**
     * Verificar si hay sesión activa
     * @returns {Promise<boolean>}
     */
    async isAuthenticated() {
        const session = await this.getSession()
        return session !== null
    }

    /**
     * Traducir errores de Supabase al español
     * @param {string} errorMessage 
     * @returns {string}
     */
    translateError(errorMessage) {
        const errors = {
            'Invalid login credentials': 'Email o contraseña incorrectos',
            'Email not confirmed': 'Email no confirmado',
            'User not found': 'Usuario no encontrado',
            'Invalid email': 'Email inválido',
            'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
            'User already registered': 'El usuario ya está registrado',
            'Network request failed': 'Error de conexión. Verifica tu internet',
            'Unable to validate email address': 'No se pudo validar el email',
            'Signups not allowed': 'No se permiten registros nuevos',
            'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos'
        }

        return errors[errorMessage] || errorMessage
    }

    /**
     * Validar formato de email
     * @param {string} email 
     * @returns {boolean}
     */
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    /**
     * Validar contraseña
     * @param {string} password 
     * @returns {Object} { valid: boolean, message: string }
     */
    validatePassword(password) {
        if (!password || password.length < 6) {
            return {
                valid: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            }
        }

        return {
            valid: true,
            message: ''
        }
    }
}