// --- VARIABLES GLOBALES ---
let listaProductosGlobal = [];
// Mantenemos el carrito vivo entre páginas
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

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
                
                // Evento para abrir el modal (Las comillas simples son vitales para IDs con letras)
                article.setAttribute('onclick', `abrirModal('${producto.id}')`);

                // Limpiamos el precio: quitamos el "$" si el JSON lo trae y convertimos a número
                let precioLimpio = parseFloat(String(producto.precio).replace('$', '')).toFixed(2);

                article.innerHTML = `
                    <figure class="product-figure">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <figcaption class="product-details-overlay">
                            <h3 class="product-name">${producto.nombre}</h3>
                            <p class="product-brand">${producto.material}</p>
                            <p class="product-weight">${producto.color}</p>
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

// --- FUNCIONES DEL MODAL EMERGENTE Y ZOOM ---
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

// --- FUNCIONES DEL CARRITO Y WHATSAPP ---
function agregarAlCarrito(id) {
    const producto = listaProductosGlobal.find(p => p.id == id);
    if (producto) {
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert(`¡Añadiste: ${producto.nombre} al carrito!`);
    }
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito está vacío."); // Usando tu nueva alerta personalizada
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
    
    // 1. Abrimos WhatsApp
    window.open(url, '_blank');

    // --- AQUÍ ESTÁ EL CAMBIO ---
    
    // 2. Vaciamos la variable global del carrito
    carrito = []; 

    // 3. Limpiamos el almacenamiento local del navegador
    localStorage.removeItem('carrito'); 

    // 4. Si estamos en carrito.html, refrescamos la vista para que se vea vacío
    if (typeof renderizarCarrito === 'function') {
        renderizarCarrito();
    }

    // 5. Actualizamos el contador de la burbuja rosa en el menú
    if (typeof actualizarContador === 'function') {
        actualizarContador();
    }

    mostrarNotificacion("¡Pedido enviado! Carrito vaciado.");
}

// --- DESCARGAR PDF ---
async function descargarPDF() {
    if(!window.jspdf) {
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
// LÓGICA DEL CARRUSEL AUTOMÁTICO (Banners)
// ==========================================
let indiceAuto = 0;

function moverCarruselAutomatico() {
    const track = document.getElementById('autoTrack');
    if (!track) return; // Si no estamos en el index, no hace nada

    const slides = track.querySelectorAll('img');
    indiceAuto++;
    
    // Si llega a la última imagen, regresa a la primera
    if (indiceAuto >= slides.length) {
        indiceAuto = 0;
    }
    
    // Mueve el carrusel hacia la izquierda
    track.style.transform = `translateX(-${indiceAuto * 100}%)`;
}

// Inicia el movimiento cada 3.5 segundos (3500 milisegundos)
// setInterval(moverCarruselAutomatico, 3500);


// ==========================================
// LÓGICA DEL CARRUSEL MANUAL (Tarjetas de 3)
// ==========================================
let indiceManual = 0;

function moverCarruselManual(direccion) {
    const track = document.getElementById('manualTrack');
    if (!track) return;

    const tarjetas = track.querySelectorAll('.slide-card');
    
    // Detectamos cuántas tarjetas se ven según el tamaño de pantalla
    let tarjetasVisibles = 3;
    if (window.innerWidth <= 800) tarjetasVisibles = 2;
    if (window.innerWidth <= 500) tarjetasVisibles = 1;

    // Límite máximo para no avanzar al vacío
    const maxIndice = tarjetas.length - tarjetasVisibles;

    indiceManual += direccion;

    // Evitamos pasarnos de los límites
    if (indiceManual < 0) indiceManual = 0;
    if (indiceManual > maxIndice) indiceManual = maxIndice;

    // Calculamos el ancho exacto de una tarjeta + el espacio (gap de 20px)
    const anchoTarjeta = tarjetas[0].getBoundingClientRect().width;
    const distanciaAMover = (anchoTarjeta + 20) * indiceManual;

    track.style.transform = `translateX(-${distanciaAMover}px)`;
}

// Resetea el carrusel si el usuario voltea el celular o cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    indiceManual = 0;
    const track = document.getElementById('manualTrack');
    if (track) track.style.transform = `translateX(0px)`;
});
// --- FUNCIÓN DE ALERTA PERSONALIZADA ---
function mostrarNotificacion(mensaje) {
    // Crear el elemento de la alerta
    const alerta = document.createElement('div');
    alerta.className = 'custom-alert';
    alerta.innerHTML = `<span></span> ${mensaje}`;

    document.body.appendChild(alerta);

    // Desvanecer y eliminar después de 3 segundos
    setTimeout(() => {
        alerta.style.opacity = '0';
        alerta.style.transition = '0.5s';
        setTimeout(() => alerta.remove(), 500);
    }, 3000);
}

// --- ACTUALIZACIÓN DE AGREGAR AL CARRITO ---
function agregarAlCarrito(id) {
    const producto = listaProductosGlobal.find(p => p.id == id);
    if (producto) {
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // REEMPLAZAMOS EL ALERT POR NUESTRA NOTIFICACIÓN
        mostrarNotificacion(`${producto.nombre} añadido con éxito`);
    }
}

// --- LÓGICA PARA RENDERIZAR CARRITO EN CARRITO.HTML ---
function renderizarCarrito() {
    const contenedor = document.getElementById('lista-carrito');
    const totalTxt = document.getElementById('total-pedido');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    let acumulado = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center;'>Tu carrito está vacío.</p>";
    } else {
        carrito.forEach((p, index) => {
            let precioNum = parseFloat(String(p.precio).replace('$', ''));
            acumulado += precioNum;

            contenedor.innerHTML += `
                <div class="item-carrito">
                    <img src="${p.imagen}" alt="${p.nombre}">
                    <div class="carrito-info">
                        <h4>${p.nombre}</h4>
                        <p>$${precioNum.toFixed(2)}</p>
                    </div>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Quitar</button>
                </div>
            `;
        });
    }
    if(totalTxt) totalTxt.innerText = `Total: $${acumulado.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito(); // Recargar vista
}

// Llamar al render si estamos en la página del carrito
if (window.location.pathname.includes('carrito.html')) {
    document.addEventListener('DOMContentLoaded', renderizarCarrito);
}// --- NOTIFICACIÓN PERSONALIZADA (Reemplaza al alert común) ---
function mostrarNotificacion(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'custom-alert'; // Asegúrate de tener el CSS que te pasé antes
    alerta.innerHTML = `<span></span> ${mensaje}`;
    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.style.opacity = '0';
        setTimeout(() => alerta.remove(), 500);
    }, 2500);
}

// --- ACTUALIZACIÓN DE AGREGAR AL CARRITO ---
function agregarAlCarrito(id) {
    const producto = listaProductosGlobal.find(p => p.id == id);
    if (producto) {
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Usamos la nueva notificación en lugar de alert
        mostrarNotificacion(`${producto.nombre} añadido al carrito`);
    }
}

// --- RENDERIZAR CARRITO (Solo para carrito.html) ---
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

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    mostrarNotificacion("Producto eliminado");
}

// Ejecutar si estamos en carrito.html
if (window.location.pathname.includes('carrito.html')) {
    document.addEventListener('DOMContentLoaded', renderizarCarrito);
}