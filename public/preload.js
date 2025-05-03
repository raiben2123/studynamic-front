// Este archivo se carga antes que cualquier otro script para inicializar la app

// Detectar la plataforma
const isAndroid = window.navigator.userAgent.includes('Android');
const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
const isNative = isAndroid || isIOS;

// Aplicar clase al body basada en la plataforma
document.addEventListener('DOMContentLoaded', function() {
  if (isAndroid) {
    document.body.classList.add('android-device');
  } else if (isIOS) {
    document.body.classList.add('ios-device');
  }
  
  if (isNative) {
    document.body.classList.add('native-app');
  } else {
    document.body.classList.add('web-app');
  }
  
  // Ajustar altura para dispositivos iOS con notch
  if (isIOS) {
    function adjustSafeArea() {
      document.body.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.body.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
      document.body.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.body.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    }
    
    adjustSafeArea();
    window.addEventListener('resize', adjustSafeArea);
  }
  
  // Desactivar zoom en doble toque para dispositivos móviles
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta && isNative) {
    meta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1.0, user-scalable=no');
  }
});

// Cargar temas previa al renderizado para evitar parpadeo
const savedTheme = localStorage.getItem('theme') || 'theme-default';
document.documentElement.className = savedTheme;

// Manejar gestos de retroceso en Android
if (isAndroid) {
  window.addEventListener('popstate', function(event) {
    // Si hay una función personalizada para manejar la navegación hacia atrás
    if (window.handleAndroidBack && typeof window.handleAndroidBack === 'function') {
      window.handleAndroidBack(event);
    }
  });
}

// Precarga de recursos críticos
const precacheImages = [
  '/assets/Logo.png',
  '/assets/Logo_opacidad33.png'
];

if ('caches' in window) {
  caches.open('app-static-v1').then(cache => {
    return cache.addAll(precacheImages);
  });
}

// Establecer variables de entorno para detección en la aplicación
window.Studynamic = {
  isNative,
  isAndroid,
  isIOS,
  version: '1.0.0'
};
