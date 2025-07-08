# Extensión de Navegador Prompt Wisp

![JavaScript](https://img.shields.io/badge/Lenguaje-JavaScript-f7df1e?logo=javascript&logoColor=white)
![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Disponible-4285f4?logo=googlechrome&logoColor=white)
![Manifest](https://img.shields.io/badge/Manifest-V3-green)
![Campo](https://img.shields.io/badge/Campo-Extensiones%20Web-white)
![Licencia](https://img.shields.io/badge/Licencia-MIT-brown)

Accede y organiza tus prompts de IA favoritos de forma sencilla y rápida, todo desde tu navegador. Con esta extensión para Chrome, puedes guardar, buscar y usar tus mejores ideas en plataformas de IA populares sin complicaciones. Olvídate de copiar y pegar: mantén tu biblioteca de ```prompt wisp``` siempre a la mano y lista para usar cuando la necesites.

**[Instalar desde Chrome Web Store](https://chromewebstore.google.com/detail/prompt-wisp/jfnnlgpcdjjfkhlngolanneflbgpekeo)** • **[Plataforma Principal](https://prompt-wisp.vercel.app/)** • **[LinkedIn](https://www.linkedin.com/in/leonardocerv/)** • **[Contacto](mailto:Leocerva29@gmail.com)**


## Descripción General

La Extensión de Navegador Prompt Wisp te ayuda a guardar y usar tus prompts favoritos de IA de manera fácil y rápida, directamente desde tu navegador. Conecta tu cuenta de ```prompt wisp``` y accede a tus colecciones en cualquier momento, sin tener que copiar y pegar manualmente. Así puedes organizar, buscar y desplegar tus prompts en plataformas de IA populares, haciendo tu trabajo mucho más ágil y sencillo.

## Características Principales

### **Integración Multiplataforma de IA**
- **Soporte nativo** para ChatGPT, Claude AI, Google Gemini y DeepSeek
- **Detección inteligente de entrada** que identifica automáticamente campos de entrada de prompts
- **Inyección seamless de prompts** con manejo adecuado de eventos y posicionamiento del cursor

### **Gestión de Biblioteca de Prompts**
- **Sincronización en tiempo real** con tu cuenta de Prompt Wisp
- **Respaldo de almacenamiento local** asegura funcionalidad incluso cuando estás offline
- **Colecciones organizadas de prompts** accesibles a través de una interfaz popup intuitiva
- **Búsqueda rápida y filtrado** para encontrar el prompt correcto instantáneamente

### **Autenticación Segura**
- **Integración OAuth** con la plataforma principal de Prompt Wisp
- **Gestión segura de sesiones** con renovación automática de tokens
- **Diseño enfocado en privacidad** con permisos mínimos requeridos

### **Características de Productividad Mejoradas**
- **Despliegue de prompts con un clic** a cualquier plataforma de IA soportada
- **Guardar conversaciones actuales** como nuevos prompts para uso futuro
- **Respaldo de copia al portapapeles** para sitios no soportados
- **Preservación inteligente de contexto** mantiene el formato y estructura

## Plataformas de IA Soportadas

| Plataforma | Estado | Nivel de Integración |
|------------|--------|---------------------|
| **ChatGPT** | ✅ Soporte Completo | Inyección nativa de textarea |
| **Claude AI** | ✅ Soporte Completo | Manejo de contenido ProseMirror |
| **Google Gemini** | ✅ Soporte Completo | Integración de editor de texto enriquecido |
| **DeepSeek** | ✅ Soporte Completo | Manejo estándar de campo de entrada |
| **Otras plataformas** | 🔄 Respaldo | Funcionalidad de copia al portapapeles |

## Arquitectura Técnica

### Cumplimiento de Manifest V3
Construida usando los últimos estándares de extensiones de Chrome con:
- **Script de fondo Service Worker** para gestión eficiente de recursos
- **Inyección de script de contenido** para manipulación seamless del DOM
- **Permisos de host seguros** limitados a plataformas de IA esenciales
- **APIs web modernas** incluyendo Clipboard API y Chrome Storage API

### Componentes Principales

#### Service Worker de Fondo (`background.js`)
- Maneja la gestión del estado de autenticación
- Gestiona la comunicación API con la plataforma Prompt Wisp
- Proporciona sincronización entre pestañas de datos de prompts
- Implementa almacenamiento seguro y gestión de sesiones

#### Scripts de Contenido (`content.js`)
- Detección y manipulación de campos de entrada específicos de plataforma
- Inyección inteligente de prompts con activación adecuada de eventos
- Mecanismos de respaldo para tipos de entrada no soportados
- Monitoreo del DOM en tiempo real para interfaces dinámicas

#### Interfaz Popup (`popup.html`, `popup.js`)
- UI limpia y profesional para gestión de prompts
- Capacidades de búsqueda y filtrado en tiempo real
- Integración del flujo de autenticación de usuario
- Diseño responsivo optimizado para restricciones de popup de extensión

### Seguridad y Privacidad
- Modelo de **permisos mínimos** siguiendo el principio de menor privilegio
- **Sin recolección de datos** más allá de lo necesario para funcionalidad
- **Comunicación API segura** con headers de autenticación apropiados
- **Encriptación de datos locales** para información sensible

## Instalación y Configuración

### Desde Chrome Web Store (Recomendado)
1. Visita la [página de la Extensión Prompt Wisp](https://chromewebstore.google.com/detail/prompt-wisp/jfnnlgpcdjjfkhlngolanneflbgpekeo)
2. Haz clic en "Añadir a Chrome"
3. Confirma la instalación y los permisos requeridos
4. Accede a la extensión a través de la barra de herramientas del navegador

### Instalación Manual (Desarrollo)
1. **Clona el repositorio**
   ```bash
   git clone https://github.com/LeonardoCerv/prompt-wisp-web-extension.git
   cd prompt-wisp-web-extension
   ```

2. **Cargar como extensión desempaquetada**
   - Abre Chrome y navega a `chrome://extensions/`
   - Habilita "Modo de desarrollador" en la parte superior derecha
   - Haz clic en "Cargar desempaquetada" y selecciona el directorio clonado
   - El ícono de la extensión debería aparecer en tu barra de herramientas del navegador

3. **Configurar autenticación**
   - Haz clic en el ícono de la extensión para abrir el popup
   - Inicia sesión con tu cuenta de Prompt Wisp
   - Otorga los permisos necesarios para integración multiplataforma

## Guía de Uso

### Primeros Pasos
1. **Autenticación**: Haz clic en el ícono de la extensión e inicia sesión con tus credenciales de Prompt Wisp
2. **Explorar Prompts**: Ve tu biblioteca de prompts organizada en la interfaz popup
3. **Desplegar Prompts**: Navega a cualquier plataforma de IA soportada y haz clic en un prompt para inyectarlo
4. **Guardar Nuevos Prompts**: Usa la función "Guardar Actual" para añadir nuevos prompts desde tus conversaciones

### Características Avanzadas
- **Búsqueda Rápida**: Usa la barra de búsqueda en el popup para filtrar prompts por título o contenido
- **Organización por Colecciones**: Explora prompts por colecciones para mejor organización
- **Modo Offline**: Accede a prompts almacenados localmente incluso cuando estés desconectado
- **Atajos de Teclado**: Menú contextual de clic derecho para acciones adicionales de prompts

## Desarrollo

### Requisitos Previos
- Navegador Chrome (última versión)
- Comprensión básica de las APIs de Extensiones de Chrome
- Cuenta de Prompt Wisp para pruebas

### Estructura del Proyecto
```
prompt-wisp-web-extension/
├── manifest.json          # Manifiesto de extensión y permisos
├── background.js           # Service worker para gestión de API y estado
├── content.js             # Script de contenido para integración de plataformas IA
├── popup.html             # Interfaz popup de extensión
├── popup.js               # Funcionalidad del popup y lógica de UI
├── styles.css             # Estilos de extensión
└── icons/                 # Íconos y recursos de extensión
```

### APIs y Tecnologías Clave
- **API de Extensiones Chrome**: Funcionalidad central de extensión
- **API de Almacenamiento Chrome**: Gestión de almacenamiento local y sync
- **API de Runtime Chrome**: Paso de mensajes y gestión de ciclo de vida
- **API de Portapapeles**: Funcionalidad de respaldo para copia de prompts
- **Manipulación DOM**: Manejo de campos de entrada específicos de plataforma

### Pruebas
- Prueba en todas las plataformas de IA soportadas (ChatGPT, Claude, Gemini, DeepSeek)
- Verifica el flujo de autenticación con la plataforma Prompt Wisp
- Valida funcionalidad offline con prompts en caché
- Revisa diseño responsivo en varios tamaños de popup

## Compatibilidad de Navegadores

| Navegador | Estado de Soporte | Notas |
|-----------|-------------------|-------|
| **Chrome** | ✅ Soporte Completo | Plataforma objetivo principal |
| **Edge** | ✅ Compatible | Compatibilidad basada en Chromium |
| **Brave** | ✅ Compatible | Soporte de extensiones Chrome |
| **Firefox** | 🔄 Planeado | Versión Manifest V2 en desarrollo |
| **Safari** | ❌ No Soportado | Limitaciones de plataforma |

## Contribuir

¡Damos la bienvenida a contribuciones de la comunidad de desarrolladores! Esta extensión está construida con estándares profesionales y mantenemos altas expectativas de calidad de código.

### Flujo de Trabajo de Desarrollo
1. **Haz fork del repositorio** y crea tu rama de características
   ```bash
   git checkout -b feature/tu-nombre-de-caracteristica
   ```

2. **Sigue estándares de codificación**
   - Usa convenciones modernas de JavaScript (ES6+)
   - Mantén cumplimiento con Chrome Manifest V3
   - Implementa manejo adecuado de errores y respaldos
   - Añade comentarios comprensivos para lógica compleja

3. **Prueba exhaustivamente**
   - Verifica funcionalidad en todas las plataformas de IA soportadas
   - Prueba integración del flujo de autenticación
   - Valida transiciones de estado offline/online
   - Revisa compatibilidad entre navegadores donde aplique

4. **Envía tu contribución**
   ```bash
   git commit -m 'feat: añadir soporte para nueva plataforma IA'
   git push origin feature/tu-nombre-de-caracteristica
   ```
   Luego abre un Pull Request con una descripción detallada de tus cambios.

### Áreas para Contribución
- **Soporte de Nuevas Plataformas IA**: Añadir integración para plataformas de chat IA adicionales
- **UI/UX Mejorada**: Mejorar la interfaz popup y experiencia de usuario
- **Optimización de Rendimiento**: Optimizar inyección de scripts de contenido y llamadas API
- **Accesibilidad**: Mejorar navegación por teclado y soporte para lectores de pantalla
- **Mejoras de Seguridad**: Fortalecer autenticación y manejo de datos

## Solución de Problemas

### Problemas Comunes

**Problemas de Autenticación**
- Asegúrate de tener una cuenta válida de Prompt Wisp
- Verifica que los bloqueadores de popup no interfieran con el flujo de auth
- Verifica que la extensión tenga los permisos apropiados habilitados

**Fallos de Inyección de Prompts**
- Confirma que la interfaz de la plataforma IA no haya cambiado recientemente
- Revisa la consola del navegador para errores de script de contenido
- Intenta refrescar la página de la plataforma IA

**Problemas de Sincronización**
- Verifica conectividad a internet para sincronización en la nube
- Revisa que el almacenamiento local no esté lleno o corrupto
- Re-autentica si la sincronización continúa fallando

### Modo de Depuración
Habilita las Herramientas de Desarrollador de Chrome para inspeccionar el comportamiento de la extensión:
1. Clic derecho en el ícono de extensión → "Inspeccionar popup"
2. Navega a `chrome://extensions/` → Haz clic en "Inspeccionar vistas: service worker"
3. Revisa la consola del navegador en plataformas IA para logs de scripts de contenido

## Seguridad y Privacidad

### Manejo de Datos
- **Sin recolección de datos personales** más allá de la autenticación necesaria
- **Encriptación de almacenamiento local** para datos de prompts en caché
- **Comunicación API segura** con gestión apropiada de tokens
- **Permisos mínimos** siguiendo las mejores prácticas de seguridad de Chrome

### Permisos Explicados
- `storage`: Requerido para caché local de prompts y preferencias de usuario
- `activeTab`: Necesario para inyectar prompts en campos de entrada de plataformas IA
- `clipboardWrite`: Funcionalidad de respaldo para plataformas no soportadas
- `host_permissions`: Limitado a plataformas IA específicas por seguridad

## Hoja de Ruta

### Mejoras a Corto Plazo
- **Compatibilidad con Firefox** con adaptación de Manifest V2
- **Búsqueda mejorada** con coincidencia difusa y filtrado por etiquetas
- **Atajos de teclado** para eficiencia de usuarios avanzados
- **Plantillas de prompts** con sustitución de variables

### Visión a Largo Plazo
- **Características de colaboración en equipo** para bibliotecas de prompts compartidas
- **Integración de analíticas** para seguimiento de uso de prompts
- **Integración API de plataformas IA** para funcionalidad mejorada
- **Soporte de navegadores móviles** para consistencia entre dispositivos

## Soporte y Comunidad

- **Problemas**: Reporta bugs y solicitudes de características via [GitHub Issues](https://github.com/LeonardoCerv/prompt-wisp-web-extension/issues)
- **Discusiones**: Únete a la conversación en [GitHub Discussions](https://github.com/LeonardoCerv/prompt-wisp-web-extension/discussions)

## Licencia

Distribuido bajo la [Licencia MIT](LICENSE).
