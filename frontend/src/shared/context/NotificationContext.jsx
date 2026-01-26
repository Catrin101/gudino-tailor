import { useState, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

/**
 * Contexto de notificaciones
 */
const NotificationContext = createContext()

/**
 * Hook para usar notificaciones
 */
export function useNotification() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification debe usarse dentro de NotificationProvider')
    }
    return context
}

/**
 * Componente de notificación individual
 */
function Notification({ notification, onClose }) {
    const iconos = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info
    }

    const colores = {
        success: {
            bg: 'bg-success-50',
            border: 'border-success-200',
            text: 'text-success-800',
            icon: 'text-success-600'
        },
        error: {
            bg: 'bg-danger-50',
            border: 'border-danger-200',
            text: 'text-danger-800',
            icon: 'text-danger-600'
        },
        warning: {
            bg: 'bg-warning-50',
            border: 'border-warning-200',
            text: 'text-warning-800',
            icon: 'text-warning-600'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: 'text-blue-600'
        }
    }

    const Icon = iconos[notification.type]
    const color = colores[notification.type]

    return (
        <div className={`
      ${color.bg} ${color.border} border-l-4 rounded-lg shadow-lg p-4
      animate-in slide-in-from-right duration-300
      max-w-md w-full
    `}>
            <div className="flex items-start gap-3">
                <Icon className={`w-6 h-6 ${color.icon} flex-shrink-0 mt-0.5`} />

                <div className="flex-1 min-w-0">
                    {notification.title && (
                        <p className={`font-semibold ${color.text} mb-1`}>
                            {notification.title}
                        </p>
                    )}
                    <p className={`text-sm ${color.text}`}>
                        {notification.message}
                    </p>
                </div>

                <button
                    onClick={() => onClose(notification.id)}
                    className={`${color.text} hover:opacity-70 transition-opacity flex-shrink-0`}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

/**
 * Modal de confirmación
 */
function ConfirmDialog({ dialog, onConfirm, onCancel }) {
    if (!dialog) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${dialog.type === 'danger'
                                ? 'bg-danger-100'
                                : dialog.type === 'warning'
                                    ? 'bg-warning-100'
                                    : 'bg-blue-100'
                            }
            `}>
                            <AlertCircle className={`w-6 h-6 ${dialog.type === 'danger'
                                    ? 'text-danger-600'
                                    : dialog.type === 'warning'
                                        ? 'text-warning-600'
                                        : 'text-blue-600'
                                }`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {dialog.title || 'Confirmación'}
                        </h3>
                    </div>
                </div>

                {/* Contenido */}
                <div className="px-6 py-4">
                    <p className="text-gray-700">
                        {dialog.message}
                    </p>
                </div>

                {/* Botones */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end rounded-b-lg">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg
                     hover:bg-gray-100 font-medium transition-colors"
                    >
                        {dialog.cancelText || 'Cancelar'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-colors text-white
              ${dialog.type === 'danger'
                                ? 'bg-danger-500 hover:bg-danger-600'
                                : dialog.type === 'warning'
                                    ? 'bg-warning-500 hover:bg-warning-600'
                                    : 'bg-primary-600 hover:bg-primary-700'
                            }
            `}
                    >
                        {dialog.confirmText || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/**
 * Provider de notificaciones
 */
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])
    const [confirmDialog, setConfirmDialog] = useState(null)

    /**
     * Mostrar notificación
     */
    const showNotification = ({ message, title, type = 'info', duration = 3000 }) => {
        const id = Date.now()

        setNotifications(prev => [...prev, { id, message, title, type }])

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, duration)
        }

        return id
    }

    /**
     * Remover notificación
     */
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    /**
     * Mostrar confirmación
     */
    const showConfirm = ({
        message,
        title,
        type = 'warning',
        confirmText,
        cancelText
    }) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                message,
                title,
                type,
                confirmText,
                cancelText,
                onConfirm: () => {
                    setConfirmDialog(null)
                    resolve(true)
                },
                onCancel: () => {
                    setConfirmDialog(null)
                    resolve(false)
                }
            })
        })
    }

    /**
     * Atajos para tipos específicos
     */
    const success = (message, title) =>
        showNotification({ message, title, type: 'success' })

    const error = (message, title) =>
        showNotification({ message, title, type: 'error', duration: 5000 })

    const warning = (message, title) =>
        showNotification({ message, title, type: 'warning' })

    const info = (message, title) =>
        showNotification({ message, title, type: 'info' })

    const value = {
        showNotification,
        success,
        error,
        warning,
        info,
        showConfirm
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Contenedor de notificaciones */}
            <div className="fixed top-20 right-4 z-50 space-y-3">
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        notification={notification}
                        onClose={removeNotification}
                    />
                ))}
            </div>

            {/* Modal de confirmación */}
            {confirmDialog && (
                <ConfirmDialog
                    dialog={confirmDialog}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </NotificationContext.Provider>
    )
}