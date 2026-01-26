export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = 'font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-card'

  const variants = {
    // Marrón chocolate - Botón principal
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',

    // Dorado tierra - Botón secundario/acento
    secondary: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800',

    // Verde - Éxito/Confirmar
    success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700',

    // Rojo - Peligro/Eliminar
    danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700',

    // Contorno marrón - Acción secundaria
    outline: 'border-2 border-primary-600 text-primary-700 hover:bg-primary-50 hover:border-primary-700 active:bg-primary-100',

    // Contorno neutro - Cancelar
    ghost: 'border-2 border-neutral-400 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-500'
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
