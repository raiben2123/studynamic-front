# Studynamic - Aplicación de organización de estudios

Studynamic es una aplicación para la organización de estudios que permite a los estudiantes gestionar tareas, horarios, recursos y grupos de estudio.

## Características principales

- Gestión de tareas y recordatorios
- Calendario de eventos académicos
- Organización de recursos por asignaturas
- Grupos de estudio colaborativos
- Tema claro/oscuro
- Funciona en dispositivos móviles y web

## Requisitos de desarrollo

- Node.js 18 o superior
- npm 9 o superior
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS, solo en macOS)

## Configuración del proyecto

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/studynamic-front.git
cd studynamic-front
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm start
```

## Desarrollo con Capacitor

Studynamic utiliza Capacitor para generar aplicaciones nativas para Android e iOS.

### Scripts disponibles

- `npm start` - Inicia el servidor de desarrollo web
- `npm run build` - Genera la versión de producción para web
- `npm run build:mobile` - Genera la versión de producción y sincroniza con los proyectos nativos
- `npm run cap:init` - Inicializa Capacitor en el proyecto
- `npm run cap:add:android` - Añade la plataforma Android
- `npm run cap:add:ios` - Añade la plataforma iOS
- `npm run cap:sync` - Sincroniza el código web con los proyectos nativos
- `npm run cap:open:android` - Abre el proyecto en Android Studio
- `npm run cap:open:ios` - Abre el proyecto en Xcode

### Configuración inicial para desarrollo móvil

Para configurar el proyecto para desarrollo móvil por primera vez:

1. Genera la versión de producción:
```bash
npm run build
```

2. Inicializa Capacitor (si aún no se ha hecho):
```bash
npm run cap:init
```

3. Añade las plataformas que necesites:
```bash
npm run cap:add:android
npm run cap:add:ios  # Solo en macOS
```

4. Sincroniza los proyectos nativos:
```bash
npm run cap:sync
```

5. Abre el proyecto en el IDE nativo:
```bash
npm run cap:open:android
# o
npm run cap:open:ios  # Solo en macOS
```

### Desarrollo continuo

Durante el desarrollo, después de realizar cambios en el código:

1. Genera la versión de producción y sincroniza:
```bash
npm run build:mobile
```

2. Abre el IDE nativo y ejecuta la aplicación:
```bash
npm run cap:open:android
# o
npm run cap:open:ios
```

## Estructura del proyecto

```
studynamic-front/
├── android/             # Proyecto Android generado por Capacitor
├── public/              # Archivos públicos
├── src/                 # Código fuente
│   ├── api/             # Servicios de API
│   ├── assets/          # Imágenes y recursos estáticos
│   ├── components/      # Componentes React reutilizables
│   ├── context/         # Contextos de React (AuthContext, etc.)
│   ├── pages/           # Páginas/rutas principales
│   ├── services/        # Servicios de la aplicación
│   ├── styles/          # Archivos CSS y de estilos
│   └── utils/           # Utilidades y funciones auxiliares
├── capacitor.config.json  # Configuración de Capacitor
└── package.json         # Dependencias y scripts
```

## Temas y estilos

Studynamic utiliza Tailwind CSS para los estilos, con soporte para temas claro y oscuro.

## Licencia

[MIT](LICENSE)
