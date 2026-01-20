# GudiñoTailor - Sistema de Gestión de Sastrería

Sistema web progresivo (PWA) para la gestión integral de Casa Gudiño.

## 🚀 Stack Tecnológico

- **Frontend:** React 18 + Vite
- **Estilos:** Tailwind CSS
- **Base de Datos:** Supabase (PostgreSQL)
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod
- **Routing:** React Router DOM
- **Iconos:** Lucide React

## 📋 Instalación
```bash
# Clonar repositorio
git clone [tu-repo]
cd gudino-tailor/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar desarrollo
npm run dev
```

## 🏗️ Estructura del Proyecto
```
src/
├── core/              # Configuración y constantes del sistema
│   ├── config/        # Configuración de Supabase
│   ├── constants/     # Estados, medidas, permisos
│   └── types/         # Definiciones de tipos TypeScript (futuro)
├── features/          # Módulos por dominio de negocio
│   ├── clientes/      # Gestión de clientes
│   ├── medidas/       # Toma y gestión de medidas
│   ├── pedidos/       # Gestión de pedidos y estados
│   └── pagos/         # Registro de pagos y cuentas
├── shared/            # Recursos compartidos
│   ├── components/    # Componentes reutilizables
│   ├── hooks/         # Hooks personalizados
│   └── utils/         # Funciones de utilidad
├── layouts/           # Layouts de página
└── pages/             # Páginas principales de la aplicación
```

## 📝 Scripts Disponibles
```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linter de código
```

## 🔧 Configuración

El proyecto requiere un archivo `.env` con las siguientes variables:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🗄️ Base de Datos

El proyecto utiliza Supabase (PostgreSQL) con las siguientes tablas:

- **clientes:** Directorio de clientes
- **medidas:** Historial versionado de medidas
- **pedidos:** Gestión de trabajos (confección, remiendo, renta)
- **detalles_pedido:** Especificaciones de prendas
- **pagos:** Historial financiero

## 👥 Equipo

Desarrollado para Casa Gudiño

## 📄 Licencia

Privado - Todos los derechos reservados
