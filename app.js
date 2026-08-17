let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productos = [];
let categoriaActual = "todos";
let busquedaActual = "";

const contenedorProductos = document.getElementById("contenedor-productos");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const precioTotal = document.getElementById("precio-total");
const btnVaciar = document.getElementById("btn-vaciar");
const btnFinalizar = document.getElementById("btn-finalizar");
const inputBuscador = document.getElementById("input-buscador");
const botonesFiltro = document.querySelectorAll(".btn-filtro");

async function pedirProductos() {
  try {
    const respuesta = await fetch("./productos.json");
    productos = await respuesta.json();
    renderizarProductos(productos);
  } catch (error) {
    contenedorProductos.innerHTML = "<p>No pudimos cargar los productos. Intentá recargar la página.</p>";
  }
}

function renderizarProductos(listado) {
  contenedorProductos.innerHTML = "";
  listado.forEach((producto) => {
    const card = document.createElement("div");
    card.className = "card-producto";
    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="card-img">
      <div class="card-body">
        <h3 class="card-title">${producto.nombre}</h3>
        <p class="card-desc">${producto.descripcion}</p>
        <p class="card-precio">$${producto.precio.toLocaleString("es-AR")}</p>
        <button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
      </div>
    `;
    contenedorProductos.appendChild(card);
  });
}

botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", (e) => {
    categoriaActual = e.currentTarget.dataset.categoria;

    botonesFiltro.forEach((btn) => btn.classList.remove("activo"));
    e.currentTarget.classList.add("activo");

    aplicarFiltros();
  });
});

inputBuscador.addEventListener("input", (e) => {
  busquedaActual = e.target.value.toLowerCase().trim();
  aplicarFiltros();
});

contenedorProductos.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-agregar")) {
    const idProducto = Number(e.target.dataset.id);
    agregarAlCarrito(idProducto);
  }
});

function agregarAlCarrito(id) {
  const existeEnCarrito = carrito.find((prod) => prod.id === id);
  if (existeEnCarrito) {
    existeEnCarrito.cantidad++;
  } else {
    const productoOriginal = productos.find((prod) => prod.id === id);
    carrito.push({ ...productoOriginal, cantidad: 1 });
  }
  renderizarCarrito();
  Toastify({
    text: "Producto agregado al carrito",
    duration: 2000,
    gravity: "bottom",
    position: "right",
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    }
  }).showToast();
}

contenedorCarrito.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const idProducto = Number(e.target.dataset.id);
    eliminarDelCarrito(idProducto);
  }
});

function eliminarDelCarrito(id) {
  carrito = carrito.filter((prod) => prod.id !== id);
  renderizarCarrito();
  Toastify({
    text: "Producto eliminado",
    duration: 2000,
    gravity: "bottom",
    position: "right",
    style: {
      background: "linear-gradient(to right, #ff5f6d, #ffc371)",
    }
  }).showToast();
}

btnVaciar.addEventListener("click", () => {
  if (carrito.length === 0) return;
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se van a borrar todos los productos del carrito.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      renderizarCarrito();
      Swal.fire("¡Vaciado!", "Tu carrito quedó vacío.", "success");
    }
  });
});

if (btnFinalizar) {
  btnFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) {
      Swal.fire("Carrito vacío", "Agregá productos antes de finalizar la compra.", "info");
      return;
    }
    Swal.fire({
      title: "¡Gracias por tu compra!",
      text: "Tu pedido fue procesado con éxito.",
      icon: "success",
      confirmButtonText: "Aceptar"
    });
    carrito = [];
    renderizarCarrito();
  });
}

function aplicarFiltros() {
  let resultado = productos;

  if (categoriaActual !== "todos") {
    resultado = resultado.filter((prod) => prod.categoria === categoriaActual);
  }

  if (busquedaActual !== "") {
    resultado = resultado.filter((prod) =>
      prod.nombre.toLowerCase().includes(busquedaActual)
    );
  }

  renderizarProductos(resultado);
}

function renderizarCarrito() {
  contenedorCarrito.innerHTML = "";
  if (carrito.length === 0) {
    contenedorCarrito.innerHTML = "<p>El carrito está vacío.</p>";
  } else {
    carrito.forEach((producto) => {
      const item = document.createElement("div");
      item.className = "item-carrito";
      item.innerHTML = `
        <p>${producto.nombre} x ${producto.cantidad}</p>
        <p>Subtotal: $${(producto.precio * producto.cantidad).toLocaleString("es-AR")}</p>
        <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
      `;
      contenedorCarrito.appendChild(item);
    });
  }
  actualizarTotal();
  guardarCarritoStorage();
}

function actualizarTotal() {
  const total = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
  precioTotal.innerText = total.toLocaleString("es-AR");
}

function guardarCarritoStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

document.querySelector('[data-categoria="todos"]').classList.add("activo");
pedirProductos();
renderizarCarrito();

