// ====================================================================
// CONFIGURACIÓN GLOBAL Y ESTRUCTURAS DE DATOS
// ====================================================================

// Almacenará todos los productos cargados de la API (para referencia rápida)
let todosLosProductos = [];
// Carrito inicializado leyendo LocalStorage o array vacío
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Elementos DOM para el contador y modo oscuro
const contadorDOM = document.getElementById("contador-productos");
const itemsCarritoDOM = document.getElementById("items-carrito");
const saludoUsuario = document.getElementById("saludo-usuario");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// ====================================================================
// 1. GESTIÓN DE PRODUCTOS (FETCH API Y RUTAS ROBUSTAS)
// ====================================================================

/**
 * @param {string} rutaRoot -
 * @param {string} rutaSub -
 * @returns {string} La ruta de acceso correcta.
 */
function obtenerRuta(rutaRoot, rutaSub) {
  // Si la URL de la ventana contiene "/pages/", estamos en una subcarpeta
  if (window.location.pathname.includes("/pages/")) {
    return rutaSub;
  }
  return rutaRoot;
}

/**
 * Determina la ruta base de las imágenes.
 * @returns {string} La ruta base de las imágenes.
 */
function obtenerRutaBaseImagen() {
  // Si la URL de la ventana contiene "/pages/", subimos un nivel para llegar a la carpeta img
  if (window.location.pathname.includes("/pages/")) {
    return "../img/";
  }
  // Si estamos en la raíz, entramos directamente a la carpeta img
  return "./img/";
}

/**
 * Función que consume el JSON local usando Fetch API.
 */
async function obtenerProductos() {
  try {
    // Usamos la función obtenerRuta para el JSON
    const rutaJson = obtenerRuta(
      "./data/productos.json",
      "../data/productos.json"
    );

    const response = await fetch(rutaJson);

    if (!response.ok) {
      throw new Error(`Fallo al cargar la API en ruta: ${rutaJson}`);
    }

    todosLosProductos = await response.json();
    return todosLosProductos;
  } catch (error) {
    console.error("Error CATASTRÓFICO en la carga de productos:", error);
    const contenedor = document.getElementById("contenedor-productos");
    if (contenedor) {
      contenedor.innerHTML =
        "<h2>❌ Error de Carga</h2><p>No se pudo conectar con los datos (productos.json). Revisa la consola (F12) para ver el error de ruta.</p>";
    }
    return [];
  }
}

/**
 * Renderiza tarjetas de producto en el DOM.
 */
function renderizarProductos(contenedorId, productos) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = "";

  // CORRECCIÓN CRÍTICA: Obtenemos la ruta base para las imágenes
  const rutaBaseImagen = obtenerRutaBaseImagen();

  productos.forEach((producto) => {
    // Manipulación del DOM para crear la card
    const card = document.createElement("article");
    card.className = "producto";
    card.dataset.id = producto.id;

    const img = document.createElement("img");
    // CRÍTICO: Uso de la ruta base corregida
    img.src = `${rutaBaseImagen}${producto.image}`;
    img.alt = `Vino ${producto.name}`;
    card.appendChild(img);

    const h3 = document.createElement("h3");
    h3.className = "producto__titulo";
    h3.textContent = producto.name;
    card.appendChild(h3);

    const pPrecio = document.createElement("p");
    pPrecio.className = "producto__precio";
    pPrecio.textContent = `$${producto.price.toLocaleString("es-AR")}`;
    card.appendChild(pPrecio);

    // Botón "Ver descripción" (Funcionalidad extra de DOM)
    const btnDesc = document.createElement("button");
    btnDesc.className = "producto__boton";
    btnDesc.textContent = "Ver descripción";

    // Listener para toggle de descripción
    btnDesc.addEventListener("click", () => {
      const descripcionExistente = card.querySelector(".producto__descripcion");
      const precioActual = card.querySelector(".producto__precio");
      if (descripcionExistente) {
        descripcionExistente.remove();
        btnDesc.textContent = "Ver descripción";
      } else {
        const pDesc = document.createElement("p");
        pDesc.className = "producto__descripcion";
        pDesc.textContent = producto.description;
        // Insertar entre precio y el botón Añadir
        card.insertBefore(pDesc, precioActual.nextSibling);
        btnDesc.textContent = "Ocultar descripción";
      }
    });
    card.appendChild(btnDesc);

    // Botón "Añadir al Carrito"
    const btnAgregar = document.createElement("button");
    btnAgregar.className = "producto__boton";
    btnAgregar.textContent = "🛒 Añadir al Carrito";
    btnAgregar.dataset.productoId = producto.id;

    btnAgregar.addEventListener("click", () => {
      agregarAlCarrito(producto.id);
    });

    card.appendChild(btnAgregar);
    contenedor.appendChild(card);
  });
}

// ====================================================================
// 2. GESTIÓN DEL CARRITO (localStorage y persistencia)
// ====================================================================

function guardarCarritoYActualizar() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const totalItems = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);

  if (contadorDOM) {
    contadorDOM.textContent = totalItems;
  }
  return totalItems;
}

async function agregarAlCarrito(idProducto) {
  if (todosLosProductos.length === 0) {
    // Aseguramos que los productos estén cargados antes de añadir
    await obtenerProductos();
  }

  const id = parseInt(idProducto);
  // Uso de FIND para obtener la info del producto desde el array cargado
  const productoAñadir = todosLosProductos.find((p) => p.id === id);

  if (!productoAñadir) return;

  const productoExistente = carrito.find((prod) => prod.id === id);

  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({
      id: productoAñadir.id,
      name: productoAñadir.name,
      price: productoAñadir.price,
      image: productoAñadir.image,
      cantidad: 1,
    });
  }

  guardarCarritoYActualizar();

  alert(
    `Se añadió 1 unidad de ${
      productoAñadir.name
    } al carrito. Total: ${actualizarContadorCarrito()}`
  );

  if (itemsCarritoDOM) {
    renderizarCarrito();
  }
}

// -------------------------------------------------------------
// Lógica de Renderizado y Edición en CARRITO.HTML
// -------------------------------------------------------------

function renderizarCarrito() {
  if (!itemsCarritoDOM) return;

  itemsCarritoDOM.innerHTML = "";

  if (carrito.length === 0) {
    itemsCarritoDOM.innerHTML =
      '<p class="mensaje-vacio">Tu carrito está vacío. ¡Explora el <a href="catalogo.html">Catálogo</a>!</p>';
    actualizarTotales(0);
    return;
  }

  let subtotal = 0;
  // CORRECCIÓN CRÍTICA: Obtenemos la ruta base para las imágenes
  const rutaBaseImagen = obtenerRutaBaseImagen();

  carrito.forEach((producto) => {
    const itemTotal = producto.price * producto.cantidad;
    subtotal += itemTotal;

    const itemHTML = document.createElement("div");
    itemHTML.className = "carrito-item";
    itemHTML.dataset.id = producto.id;

    itemHTML.innerHTML = `
            <div class="carrito-info">
                <img src="${rutaBaseImagen}${producto.image}" alt="${
      producto.name
    }" />
                <div>
                    <h4>${producto.name}</h4>
                    <p>Precio Unitario: $${producto.price.toLocaleString(
                      "es-AR"
                    )}</p>
                </div>
            </div>
            <div class="carrito-controls">
                <label for="cant-${producto.id}">Cantidad:</label>
                <input 
                    type="number" 
                    id="cant-${producto.id}" 
                    value="${producto.cantidad}" 
                    min="1"
                    data-id="${producto.id}"
                    class="input-cantidad"
                >
                <p>Total: <strong>$${itemTotal.toLocaleString(
                  "es-AR"
                )}</strong></p>
                <button class="producto__boton boton-eliminar" data-id="${
                  producto.id
                }">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    itemsCarritoDOM.appendChild(itemHTML);
  });

  agregarListenersCarrito();
  actualizarTotales(subtotal);
}

function agregarListenersCarrito() {
  // Listener para cambiar cantidad
  document.querySelectorAll(".input-cantidad").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = parseInt(e.target.dataset.id);
      const nuevaCantidad = parseInt(e.target.value);

      if (nuevaCantidad > 0) {
        const producto = carrito.find((p) => p.id === id);
        if (producto) {
          producto.cantidad = nuevaCantidad;
          guardarCarritoYActualizar();
          renderizarCarrito();
        }
      } else {
        // Si la cantidad es 0 o menos, eliminamos el producto
        eliminarDelCarrito(id);
      }
    });
  });

  // Listener para eliminar producto
  document.querySelectorAll(".boton-eliminar").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      eliminarDelCarrito(id);
    });
  });

  // Listener para botones de control
  const botonVaciar = document.getElementById("boton-vaciar");
  if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
        carrito = [];
        guardarCarritoYActualizar();
        renderizarCarrito();
      }
    });
  }

  const botonComprar = document.getElementById("boton-comprar");
  if (botonComprar) {
    botonComprar.addEventListener("click", () => {
      if (carrito.length > 0) {
        alert("¡Compra simulada con éxito! Gracias por elegir Góndola.");
        carrito = [];
        guardarCarritoYActualizar();
        renderizarCarrito();
      } else {
        alert("Tu carrito está vacío.");
      }
    });
  }
}

function actualizarTotales(subtotal) {
  const subtotalDOM = document.getElementById("carrito-subtotal");
  const envioDOM = document.getElementById("carrito-envio");
  const totalDOM = document.getElementById("carrito-total");

  // Lógica de Envío Gratuito
  const costoEnvio = 1500;
  const envio = subtotal >= 15000 ? 0 : costoEnvio;
  const totalFinal = subtotal + envio;

  if (subtotalDOM) {
    subtotalDOM.textContent = `$${subtotal.toLocaleString("es-AR")}`;
  }

  // Actualizar el costo de envío
  if (envioDOM) {
    envioDOM.textContent =
      envio === 0 ? "GRATIS" : `$${envio.toLocaleString("es-AR")}`;
  }

  if (totalDOM) {
    totalDOM.textContent = `$${totalFinal.toLocaleString("es-AR")}`;
  }
}

function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter((prod) => prod.id !== idProducto);
  guardarCarritoYActualizar();
  renderizarCarrito();
}

// ====================================================================
// 3. GESTIÓN DE PREFERENCIAS (MODO OSCURO y LOCALSTORAGE)
// ====================================================================

const formularioPreferencias = document.getElementById("form-preferencias");

function aplicarPreferencias() {
  const nombreGuardado = localStorage.getItem("preferenciaNombre");
  const isDarkMode = localStorage.getItem("preferenciaDarkMode") === "true";

  if (nombreGuardado && saludoUsuario) {
    saludoUsuario.textContent = `¡Bienvenido de vuelta, ${nombreGuardado}! Revisa nuestra selección.`;
    const nombreInput = document.getElementById("nombre-usuario");
    if (nombreInput) nombreInput.value = nombreGuardado;
  }

  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) darkModeToggle.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    if (darkModeToggle) darkModeToggle.checked = false;
  }
}

if (formularioPreferencias) {
  formularioPreferencias.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre-usuario").value;
    const isDarkModeActive = darkModeToggle.checked;

    localStorage.setItem("preferenciaNombre", nombre);
    localStorage.setItem("preferenciaDarkMode", isDarkModeActive);

    aplicarPreferencias();
    alert("¡Preferencias guardadas con éxito!");
  });
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    localStorage.setItem("preferenciaDarkMode", darkModeToggle.checked);
    aplicarPreferencias();
  });
}

// ====================================================================
// 4. VALIDACIÓN DE FORMULARIO DE CONTACTO
// ====================================================================

const contactoForm = document.getElementById("contacto-form");

if (contactoForm) {
  contactoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let esValido = true;

    const validarEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const nombre = document.getElementById("nombre");
    if (nombre.value.trim().length < 2) {
      mostrarError(
        "error-nombre",
        "El nombre debe tener al menos 2 caracteres."
      );
      esValido = false;
    } else {
      mostrarError("error-nombre", "");
    }

    const email = document.getElementById("email");
    if (!validarEmail(email.value)) {
      mostrarError(
        "error-email",
        "Por favor, introduce un correo electrónico válido (ej: nombre@dominio.com)."
      );
      esValido = false;
    } else {
      mostrarError("error-email", "");
    }

    const mensaje = document.getElementById("mensaje");
    if (mensaje.value.trim().length < 10) {
      mostrarError(
        "error-mensaje",
        "El mensaje debe tener al menos 10 caracteres."
      );
      esValido = false;
    } else {
      mostrarError("error-mensaje", "");
    }

    if (esValido) {
      // Simulación de envío
      alert(
        "✅ Formulario validado y enviado con éxito. Pronto te contactaremos."
      );
      e.target.reset();
    }
  });
}

function mostrarError(idElemento, mensaje) {
  const elemento = document.getElementById(idElemento);
  if (elemento) {
    elemento.textContent = mensaje;
  }
}

// ====================================================================
// 5. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ====================================================================

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Aplica el modo oscuro y carga el saludo
  aplicarPreferencias();

  // 2. Carga los productos antes de cualquier renderizado
  await obtenerProductos();

  // 3. Renderizar productos en Catálogo
  if (document.getElementById("contenedor-productos")) {
    renderizarProductos("contenedor-productos", todosLosProductos);
  }

  // 4. Renderizar productos de Oferta en Home
  if (document.getElementById("productos-container")) {
    renderizarProductos("productos-container", todosLosProductos.slice(0, 3));
  } else if (document.getElementById("destacados-grid")) {
    renderizarProductos("destacados-grid", todosLosProductos.slice(0, 3));
  }

  // 5. Renderizar vista detallada del carrito
  if (itemsCarritoDOM) {
    renderizarCarrito();
  }

  // 6. Actualizar el contador global en el NAV
  actualizarContadorCarrito;
})(); //
