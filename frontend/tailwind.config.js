/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ============================================
        // PALETA PERSONALIZADA CASA GUDIÑO
        // ============================================

        // Color Principal: Marrón Chocolate (#4d2a1b)
        // Inspirado en sastrerías clásicas - elegante y profesional
        primary: {
          50: '#faf7f5',   // Muy claro (para fondos suaves)
          100: '#f5ede8',  // Claro
          200: '#e8d5ca',  // Claro medio
          300: '#d4b3a0',  // Medio claro
          400: '#b8876b',  // Medio
          500: '#4d2a1b',  // ← BASE PRINCIPAL (color3)
          600: '#3d2216',  // Oscuro (para botones hover)
          700: '#2e1a11',  // Muy oscuro
          800: '#1f110b',  // Ultra oscuro
          900: '#100906',  // Casi negro
        },

        // Color Secundario/Acento: Dorado Tierra (#6e6130)
        // Para detalles y elementos destacados
        accent: {
          50: '#fdfcf7',   // Muy claro
          100: '#faf8ed',  // Claro
          200: '#f2eed5',  // Claro medio
          300: '#e5dcb0',  // Medio claro
          400: '#cfc080',  // Medio
          500: '#6e6130',  // ← BASE ACENTO (color4)
          600: '#5a4e27',  // Oscuro
          700: '#443b1e',  // Muy oscuro
          800: '#2e2714',  // Ultra oscuro
          900: '#17140a',  // Casi negro
        },

        // Color Neutro Cálido: Beige Arena (#c1b89f)
        // Para fondos, tarjetas y elementos secundarios
        neutral: {
          50: '#fdfcfb',   // Casi blanco
          100: '#f9f8f5',  // Muy claro
          200: '#f2f0eb',  // Claro
          300: '#e6e3db',  // Claro medio
          400: '#d4cec0',  // Medio claro
          500: '#c1b89f',  // ← BASE NEUTRO (color5)
          600: '#a39782',  // Medio oscuro
          700: '#847866',  // Oscuro
          800: '#65594b',  // Muy oscuro
          900: '#3e3529',  // Ultra oscuro
        },

        // Fondos Base del Sistema
        // Combinación de color1 y color2
        // Fondos Base del Sistema
        // Combinación de color1 y color2
        canvas: {
          primary: '#e2e9ef',   // ← color1 (fondo principal)
          secondary: '#f6f4f9', // ← color2 (fondo alternativo)
          light: '#ffffff',     // Blanco puro
          dark: '#f8f9fa',      // Gris muy claro
        },

        // ============================================
        // COLORES FUNCIONALES (Estados del Sistema)
        // ============================================

        // Éxito/Completado - Verde natural que combina con la paleta
        success: {
          50: '#f0f9f4',
          100: '#dcf3e6',
          200: '#b9e6cd',
          300: '#86d4aa',
          400: '#4bb87f',
          500: '#22c55e',  // Base verde
          600: '#16a34a',  // Verde más oscuro (botones)
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        // Advertencia/Pendiente - Ámbar que armoniza con dorado
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Base ámbar
          600: '#d97706',  // Ámbar oscuro (alertas)
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },

        // Peligro/Error - Rojo suave que contrasta sin chocar
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Base rojo
          600: '#dc2626',  // Rojo oscuro (botones peligro)
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },

        // Información/Proceso - Azul que complementa la paleta
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Base azul
          600: '#2563eb',  // Azul oscuro
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },

      // ============================================
      // PERSONALIZACIÓN ADICIONAL
      // ============================================

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        'soft': '0 2px 8px rgba(77, 42, 27, 0.08)',
        'card': '0 4px 12px rgba(77, 42, 27, 0.12)',
        'lg': '0 8px 24px rgba(77, 42, 27, 0.15)',
      },

      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}