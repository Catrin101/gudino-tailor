export function Input({ 
  label, 
  error, 
  type = 'text',
  required = false,
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-3 border rounded-lg text-lg
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${error ? 'border-danger-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}
