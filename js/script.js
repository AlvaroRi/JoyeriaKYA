// --- VARIABLES GLOBALES ---
let listaProductosGlobal = [];
// Mantenemos el carrito vivo entre páginas
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ==========================================
// NAVEGACIÓN Y UI
// ==========================================
function toggleMenu() {
    const navList = document.querySelector('.nav-list');
    const isVisible = navList.getAttribute('data-visible') === 'true';
    const nuevoEstado = !isVisible;

    navList.setAttribute('data-visible', nuevoEstado);

    if (nuevoEstado) {
        // Bloqueamos el scroll de la página de fondo totalmente
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    } else {
        // Devolvemos el scroll a la página
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }
}

// --- NOTIFICACIÓN PERSONALIZADA ---
function mostrarNotificacion(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'custom-alert';
    alerta.innerHTML = `<span></span> ${mensaje}`;
    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.style.opacity = '0';
        setTimeout(() => alerta.remove(), 500);
    }, 2500);
}

// ==========================================
// CARGA DE CATÁLOGO Y PRODUCTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-productos');
    if (!gridContainer) return; // Si no hay grid en la página, no ejecuta nada

    // 1. Obtener la ruta del JSON desde el HTML (data-json)
    const jsonPath = gridContainer.getAttribute('data-json');

    if (!jsonPath) {
        console.error("Falta el atributo data-json en la etiqueta <section>");
        return;
    }

    // 2. Cargar los datos
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.json();
        })
        .then(productos => {
            listaProductosGlobal = productos;
            gridContainer.innerHTML = ''; // Limpiamos el HTML

            productos.forEach(producto => {
                const article = document.createElement('article');
                article.classList.add('product-card');

                // Evento para abrir el modal
                article.setAttribute('onclick', `abrirModal('${producto.id}')`);

                // Limpiamos el precio: quitamos el "$" si el JSON lo trae y convertimos a número
                let precioLimpio = parseFloat(String(producto.precio).replace('$', '')).toFixed(2);

                article.innerHTML = `
                    <figure class="product-figure">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <figcaption class="product-details-overlay">
                            <h3 class="product-name">${producto.nombre}</h3>
                            <p class="product-brand">${producto.material}</p>
                            <p class="product-weight">${producto.color || ''}</p>
                            <p class="product-price">Precio: <strong>$${precioLimpio}</strong></p>
                            
                            <button type="button" class="buy-button" onclick="event.stopPropagation(); agregarAlCarrito('${producto.id}')">
                                Añadir al Carrito
                            </button>
                        </figcaption>
                    </figure>
                `;
                gridContainer.appendChild(article);
            });
        })
        .catch(error => {
            console.error('⚠️ ERROR AL CARGAR DATOS:', error);
            gridContainer.innerHTML = `<p style="text-align:center; color:red;">No se pudo cargar el catálogo.</p>`;
        });
});

// ==========================================
// FUNCIONES DEL MODAL EMERGENTE Y ZOOM
// ==========================================
function abrirModal(idProducto) {
    const producto = listaProductosGlobal.find(p => p.id == idProducto);
    if (!producto) return;

    let precioLimpio = parseFloat(String(producto.precio).replace('$', '')).toFixed(2);
    const detalleContenedor = document.getElementById('modal-detalle');

    detalleContenedor.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; justify-content: center;">
            <div class="modal-img-container" id="zoom-container" onclick="toggleZoom()">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <p style="text-align:center; font-size:12px; color:gray; margin-top:5px;">🔍 Clic para acercar</p>
            </div>
            <div style="flex: 1; min-width: 250px;">
                <h2 style="color: var(--madera); margin-top:0;">${producto.nombre}</h2>
                <p><strong>Material:</strong> ${producto.material}</p>
                <p><strong>Medida:</strong> ${producto.medida}</p>
                <h3 style="color: var(--texto);">$${precioLimpio}</h3>
                <button onclick="agregarAlCarrito('${producto.id}')" class="buy-button" style="width: 100%; padding: 15px; margin-top: 10px;">
                    Añadir al carrito
                </button>
            </div>
        </div>
    `;

    document.getElementById('modal-overlay').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function toggleZoom() {
    const container = document.getElementById('zoom-container');
    container.classList.toggle('zoom-active');
}

// ==========================================
// FUNCIONES DEL CARRITO Y WHATSAPP
// ==========================================
function agregarAlCarrito(id) {
    const producto = listaProductosGlobal.find(p => p.id == id);
    if (producto) {
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));

        mostrarNotificacion(`${producto.nombre} añadido al carrito`);
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    mostrarNotificacion("Producto eliminado");
}

function renderizarCarrito() {
    const contenedor = document.getElementById('lista-carrito');
    const totalTxt = document.getElementById('total-pedido');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    let acumulado = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <p>Tu carrito está vacío.</p>
                <a href="index.html" class="btn-pdf" style="display:inline-block; margin-top:10px;">Ir a comprar</a>
            </div>`;
    } else {
        carrito.forEach((p, index) => {
            let precioNum = parseFloat(String(p.precio).replace('$', ''));
            acumulado += precioNum;

            contenedor.innerHTML += `
                <div class="item-carrito" style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid var(--color-primary-dark); padding: 10px 0;">
                    <img src="${p.imagen}" style="width: 70px; border-radius: 5px;">
                    <div style="flex-grow: 1;">
                        <h4 style="margin:0;">${p.nombre}</h4>
                        <p style="margin:0; color: var(--color-accent);">$${precioNum.toFixed(2)}</p>
                    </div>
                    <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar" style="background:none; border:1px solid #ff0000; color:#ff0000; cursor:pointer; border-radius:5px;">Quitar</button>
                </div>
            `;
        });
    }
    if (totalTxt) totalTxt.innerText = `Total: $${acumulado.toFixed(2)}`;
}

// Ejecutar el render si estamos en carrito.html
if (window.location.pathname.includes('carrito.html')) {
    document.addEventListener('DOMContentLoaded', renderizarCarrito);
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito está vacío.");
        return;
    }

    const miTelefono = "525541165869"; // Tu número configurado
    let mensaje = "¡Hola! Me gustaría realizar el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach((p, index) => {
        let precioNum = parseFloat(String(p.precio).replace('$', ''));
        mensaje += `*${index + 1}.* ${p.nombre} - $${precioNum.toFixed(2)}\n`;
        total += precioNum;
    });

    mensaje += `\n*Total a pagar: $${total.toFixed(2)}*`;

    const url = `https://wa.me/${miTelefono}?text=${encodeURIComponent(mensaje)}`;

    // Abrimos WhatsApp
    window.open(url, '_blank');

    // Vaciamos el carrito
    carrito = [];
    localStorage.removeItem('carrito');

    // Refrescamos la vista
    if (typeof renderizarCarrito === 'function') {
        renderizarCarrito();
    }

    // Actualizamos el contador si existe la función
    if (typeof actualizarContador === 'function') {
        actualizarContador();
    }

    mostrarNotificacion("¡Pedido enviado! Carrito vaciado.");
}

// ==========================================
// DESCARGAR PDF
// ==========================================
async function descargarPDF() {
    if (!window.jspdf) {
        alert("Las librerías de PDF aún no han cargado.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(193, 154, 107); // Color Madera
    doc.text("Catálogo Joyería KyA", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(74, 55, 40); // Texto
    doc.text("Acero Inoxidable - Alta Calidad", 14, 28);

    const filas = listaProductosGlobal.map(p => {
        let precioNum = parseFloat(String(p.precio).replace('$', '')).toFixed(2);
        return [
            p.nombre,
            p.material.replace('Material: ', ''), // Limpia el texto redundante
            `$${precioNum}`
        ];
    });

    doc.autoTable({
        startY: 35,
        head: [['Producto', 'Material', 'Precio']],
        body: filas,
        headStyles: { fillColor: [250, 218, 221], textColor: [74, 55, 40] } // Rosa Pastel
    });

    doc.save("Catalogo_Joyeria_KyA.pdf");
}

// ==========================================
// CARRUSEL AUTOMÁTICO (Banners)
// ==========================================
let indiceAuto = 0;

function moverCarruselAutomatico() {
    const track = document.getElementById('autoTrack');
    if (!track) return;

    const slides = track.querySelectorAll('img');
    if (!slides || slides.length === 0) return;

    indiceAuto++;

    if (indiceAuto >= slides.length) {
        indiceAuto = 0;
    }

    track.style.transform = `translateX(-${indiceAuto * 100}%)`;
}
// setInterval(moverCarruselAutomatico, 3500);

// ==========================================
// CARRUSEL MANUAL (Tarjetas de Categorías)
// ==========================================
let indiceManual = 0;

function moverCarruselManual(direccion) {
    const track = document.getElementById('manualTrack');
    if (!track) return;

    const tarjetas = track.querySelectorAll('.slide-card');
    if (!tarjetas || tarjetas.length === 0) return;

    let tarjetasVisibles = 3;
    if (window.innerWidth <= 800) tarjetasVisibles = 2;
    if (window.innerWidth <= 500) tarjetasVisibles = 1;

    const maxIndice = tarjetas.length - tarjetasVisibles;
    indiceManual += direccion;

    if (indiceManual < 0) indiceManual = 0;
    if (indiceManual > maxIndice) indiceManual = maxIndice;

    const anchoTarjeta = tarjetas[0].getBoundingClientRect().width;
    const distanciaAMover = (anchoTarjeta + 20) * indiceManual;

    track.style.transform = `translateX(-${distanciaAMover}px)`;
}

window.addEventListener('resize', () => {
    indiceManual = 0;
    const track = document.getElementById('manualTrack');
    if (track) track.style.transform = `translateX(0px)`;
});

/*
================================================================================
EXPLICACIÓN DE CAMPOS, CONCEPTOS Y MEJORAS DE ESTA VERSIÓN
================================================================================

1. CONCEPTOS Y CAMPOS MANEJADOS:
   - listaProductosGlobal: Array (lista) en memoria RAM que almacena temporalmente 
     los productos obtenidos del archivo JSON para poder consultarlos rápidamente 
     al abrir un modal o agregar al carrito sin hacer otra petición al servidor.
   - carrito: Array que representa las compras del usuario. Se guarda y lee de 
     "localStorage" (el almacenamiento persistente del navegador) para que los 
     productos no se borren si el usuario cambia de página (ej. de aretes a carrito).
   - fetch(jsonPath): API de JavaScript para hacer peticiones HTTP. Aquí se usa 
     para leer los archivos .json dinámicamente según el atributo 'data-json' del HTML.
   - DOM (Document Object Model): La estructura del HTML. Eventos como DOMContentLoaded 
     aseguran que el script interactúe con elementos (divs, botones) solo cuando ya existen.

2. ¿POR QUÉ ESTA NUEVA VERSIÓN ES MEJOR?
   - ELIMINACIÓN DE REDUNDANCIAS: En la versión anterior, funciones críticas como 
     agregarAlCarrito, mostrarNotificacion y renderizarCarrito estaban declaradas 
     hasta 3 veces debido a que el código nuevo se pegaba al final sin borrar el viejo. 
     Esto creaba "Shadowing" (sombra) donde JS ignora las primeras versiones y usa la última,
     pero infla el peso del archivo y confunde al desarrollador.
   - ORGANIZACIÓN LÓGICA: El código se agrupó por responsabilidades (Navegación, Carga 
     de Datos, UI/Modal, Carrito, PDF, Carrusel). Ahora es modular y más fácil de leer.
   - PREVENCIÓN DE ERRORES: Mantener un solo "fuente de la verdad" (una sola función por 
     acción) evita bugs difíciles de rastrear donde se edita una función y la aplicación 
     sigue usando otra copia oculta al final del archivo.
   - RENDIMIENTO: Menos código parseado por el navegador significa una carga fraccionalmente 
     más rápida y un mantenimiento mucho más sencillo para el futuro del proyecto.
================================================================================
*/