# 💍 Joyería KyA - Catálogo Digital

Bienvenido al repositorio oficial de **Joyería KyA**. Esta plataforma es un catálogo interactivo diseñado para la exhibición de joyería de acero inoxidable de alta calidad, optimizado para una experiencia de usuario fluida y cierre de ventas vía WhatsApp.

---

## 🚀 Funcionalidades Principales

### 🛒 Gestión de Carrito
- **Persistencia de Datos:** Los productos añadidos no se pierden al recargar la página gracias al uso de `localStorage`.
- **Cierre de Venta Inteligente:** Generación automática de un mensaje de WhatsApp con el desglose del pedido y el total a pagar.
- **Notificaciones:** Sistema de alertas personalizadas para confirmar cuando un producto es añadido con éxito.

### 📸 Experiencia Visual
- **Sliders Duales:** - Un slider automático para promociones principales.
  - Un carrusel manual para navegación por colecciones.
- **Sistema de Zoom:** Visualización detallada de los productos mediante ventanas modales y escalado de imagen.
- **Galería por Producto:** Soporte para múltiples vistas (imagen frontal y secundaria) dentro de la misma tarjeta de producto.

### 📱 Optimización Móvil (Mobile First)
- **Navegación Fluida:** Menú responsivo con **scroll independiente** y bloqueo de desplazamiento de fondo (`body-lock`) para facilitar el uso en celulares.
- **Diseño Táctil:** Botones y elementos interactivos dimensionados para una navegación cómoda con el pulgar.

---

## 🛠️ Tecnologías y Herramientas

- **Frontend:** HTML5, CSS3 (Variables, Flexbox, Media Queries).
- **Lógica:** JavaScript Vanilla (ES6+) para manipulación dinámica del DOM.
- **Datos:** JSON para la gestión de inventario sin necesidad de base de datos compleja.
- **Canales:** Integración con la API de WhatsApp Business.

---

## 📂 Estructura del Proyecto

```text
joyeria-kya/
├── index.html          # Inicio y Banners principales
├── cadenas.html        # Catálogo de Cadenas
├── anillos.html        # Catálogo de Anillos
├── aretes.html         # Catálogo de Aretes
├── estuches.html       # Catálogo de Estuches
├── carrito.html        # Resumen de compra y totalizador
├── estilos/
│   └── estilos.css     # Estilos unificados y diseño responsivo
├── js/
│   └── script.js       # Lógica de Carrito, Sliders y Modales
├── data/               # Bases de datos JSON
└── img/                # Activos visuales organizados por categoría
