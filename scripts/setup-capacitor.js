const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la salida en consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Banner del programa
console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║ Configuración automatizada de Capacitor para Studynamic    ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`);

// Verificar si el archivo capacitor.config.json existe
const configExists = fs.existsSync(path.join(__dirname, '..', 'capacitor.config.json'));

if (!configExists) {
  console.log(`${colors.yellow}No se ha encontrado el archivo capacitor.config.json. Creándolo...${colors.reset}`);
  
  // Crear el archivo de configuración
  const capacitorConfig = {
    appId: "io.studynamic.app",
    appName: "Studynamic",
    webDir: "build",
    bundledWebRuntime: false,
    plugins: {
      Preferences: {
        secure: true
      },
      LocalNotifications: {
        smallIcon: "ic_stat_icon_config_sample",
        iconColor: "#467BAA",
        sound: "beep.wav"
      },
      PushNotifications: {
        presentationOptions: ["badge", "sound", "alert"]
      }
    },
    server: {
      androidScheme: "https",
      iosScheme: "https"
    },
    splashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#F8FAFC",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#467BAA",
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large"
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'capacitor.config.json'),
    JSON.stringify(capacitorConfig, null, 2)
  );
  
  console.log(`${colors.green}✓ Archivo capacitor.config.json creado${colors.reset}`);
} else {
  console.log(`${colors.green}✓ El archivo capacitor.config.json ya existe${colors.reset}`);
}

// Verificar si existe la carpeta resources
const resourcesExists = fs.existsSync(path.join(__dirname, '..', 'resources'));

if (!resourcesExists) {
  console.log(`${colors.yellow}No se ha encontrado la carpeta resources. Creándola...${colors.reset}`);
  fs.mkdirSync(path.join(__dirname, '..', 'resources'));
  console.log(`${colors.green}✓ Carpeta resources creada${colors.reset}`);
} else {
  console.log(`${colors.green}✓ La carpeta resources ya existe${colors.reset}`);
}

// Verificar si la aplicación está construida
const buildExists = fs.existsSync(path.join(__dirname, '..', 'build'));

if (!buildExists) {
  console.log(`${colors.yellow}No se ha encontrado la carpeta build. Construyendo la aplicación...${colors.reset}`);
  
  try {
    console.log(`${colors.blue}Ejecutando: npm run build${colors.reset}`);
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Aplicación construida correctamente${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Error al construir la aplicación${colors.reset}`);
    process.exit(1);
  }
} else {
  console.log(`${colors.green}✓ La carpeta build ya existe${colors.reset}`);
}

// Inicializar Capacitor
const androidExists = fs.existsSync(path.join(__dirname, '..', 'android'));

if (!androidExists) {
  console.log(`${colors.yellow}Inicializando proyecto de Android con Capacitor...${colors.reset}`);
  
  try {
    console.log(`${colors.blue}Ejecutando: npx cap add android${colors.reset}`);
    execSync('npx cap add android', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Proyecto de Android inicializado correctamente${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Error al inicializar el proyecto de Android${colors.reset}`);
  }
} else {
  console.log(`${colors.green}✓ El proyecto de Android ya existe${colors.reset}`);
}

// Sincronizar con Capacitor
console.log(`${colors.yellow}Sincronizando con Capacitor...${colors.reset}`);

try {
  console.log(`${colors.blue}Ejecutando: npx cap sync${colors.reset}`);
  execSync('npx cap sync', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Sincronización completada correctamente${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}✗ Error al sincronizar con Capacitor${colors.reset}`);
}

console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║ Configuración completada                                  ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}

Para continuar con el desarrollo en Android:
${colors.green}npx cap open android${colors.reset}

Para reconstruir y sincronizar la aplicación:
${colors.green}npm run build:mobile${colors.reset}

`);
