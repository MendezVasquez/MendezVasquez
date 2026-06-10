import "./style.css";

import {
  db,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  query,
  where,
  ref,
  uploadBytes,
  getDownloadURL
} from "./firebase.js";

const WHATSAPP_NUMBER = "51929552751";
const ADMIN_PASSWORD = "desastre1";

const app = document.querySelector("#app");

let products = [];
let cart = [];
let splashDone = false;
let selectedCategory = "Todos";

const GUIDE_IMAGES = {
  Camisas: "/guias/camisa-varon.JPG",
  Pantalones: "/guias/pantalon-varon.jpg",
  Ternos: "/guias/terno-varon.jpg"
};

const MEASURES_BY_CATEGORY = {
  Camisas: [
    "Largo de camisa",
    "Contorno de pecho",
    "Contorno de cintura",
    "Contorno de cadera",
    "Ancho de hombro",
    "Largo de manga",
    "Contorno de brazo",
    "Contorno de muñeca",
    "Contorno de cuello",
    "Ancho de espalda"
  ],
  Pantalones: [
    "Contorno de cintura",
    "Contorno de cadera",
    "Largo de pantalón",
    "Tiro",
    "Muslo",
    "Rodilla",
    "Basta"
  ],
  Ternos: [
    "Contorno de pecho",
    "Contorno de cintura",
    "Contorno de cadera",
    "Ancho de hombro",
    "Largo de manga",
    "Largo de saco",
    "Largo de pantalón",
    "Tiro",
    "Muslo",
    "Basta"
  ]
};

const sampleProducts = [
  {
    name: "Terno Ejecutivo Azul Noche",
    category: "Ternos",
    price: 420,
    stock: 10,
    visible: true,
    featured: true,
    description: "Corte moderno, elegante y versátil para oficina o eventos.",
    sizes: ["S", "M", "L", "XL"],
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"
  }
//   {
//     name: "Camisa Blanca Premium",
//     category: "Camisas",
//     price: 85,
//     stock: 15,
//     visible: true,
//     featured: true,
//     description: "Camisa formal de tela suave, ideal para ocasiones especiales.",
//     sizes: ["S", "M", "L", "XL"],
//     imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"
//   },
//   {
//     name: "Pantalón Formal Negro",
//     category: "Pantalones",
//     price: 120,
//     stock: 12,
//     visible: true,
//     featured: false,
//     description: "Pantalón elegante de vestir con caída moderna.",
//     sizes: ["30", "32", "34", "36"],
//     imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a"
//   }
];

async function seedProductsIfEmpty() {
  const snap = await getDocs(collection(db, "products"));

  if (snap.empty) {
    for (const product of sampleProducts) {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp()
      });
    }
  }
}

async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));
  products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function money(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function go(view) {
  location.hash = view;
}

window.go = go;

function renderSplash() {
  app.innerHTML = `
    <section class="splash-loading">
      <div class="loader-card">
        <div class="loader-logo">M&V</div>
        <div class="loader-ring"></div>
        <h1>MéndezVásquez</h1>
        <p>Preparando tu experiencia...</p>
      </div>
    </section>
  `;

  setTimeout(() => {
    splashDone = true;
    location.hash = "catalogo";
    render();
  }, 2300);
}

// window.enterSite = function(view = "home") {
//   sessionStorage.setItem("mvSplashDone", "true");
//   splashDone = true;
//   location.hash = view;
//   render();
// };

function layout(content) {
  app.innerHTML = `
    <header class="topbar">
      <div class="brand" onclick="go('home')">
        <span>M&V</span>
        <div>
          <strong>MéndezVásquez</strong>
          <small>Elegancia a tu medida</small>
        </div>
      </div>

      <nav>
        
        <button onclick="go('catalogo')">Catálogo</button>
        <button onclick="go('cotizacion')">Cotización</button>
        <button class="cart-pill" onclick="go('carrito')">Carrito ${cart.length}</button>
        <button class="admin-icon" onclick="go('admin')" title="Administrador">⚙️</button>
      </nav>
    </header>

    ${content}

    <footer>
      <div class="footer-brand">MéndezVásquez</div>
      <p>Ternos, camisas, pantalones y confección formal personalizada.</p>
    </footer>
  `;
}

function render() {
  if (!splashDone) {
    renderSplash();
    return;
  }

const view =
location.hash.replace("#", "") || "catalogo"; 

  if (view === "home") renderHome();
  if (view === "catalogo") renderCatalog();
  if (view === "carrito") renderCart();
  if (view === "cotizacion") renderQuote();
  if (view === "admin") renderAdminLogin();
}

window.addEventListener("hashchange", render);

function renderHome() {
  const featured = products
    .filter(p => p.visible !== false && p.featured)
    .slice(0, 3)
    .map(productCard)
    .join("");

  layout(`
    <main>
      <section class="hero">
        <div class="hero-copy reveal">
          <span class="eyebrow">Moda formal premium</span>
          <h1>Tu presencia empieza con un buen traje.</h1>
          <p>
            Explora prendas formales, arma tu pedido y solicita atención directa por WhatsApp.
            También puedes pedir una cotización personalizada para un traje a medida.
          </p>

          <div class="hero-actions">
            <button class="primary big" onclick="go('catalogo')">Explorar colección</button>
            <button class="outline big" onclick="go('cotizacion')">Diseñar traje</button>
          </div>
        </div>

        <div class="hero-showcase reveal delay">
          <div class="glass-card">
            <span>Experiencia personalizada</span>
            <h3>Compra rápida, elegante y simple.</h3>
            <p>El cliente elige, completa sus datos y envía todo listo por WhatsApp.</p>
          </div>

          <div class="floating-card top">
            <strong>+10</strong>
            <small>productos disponibles</small>
          </div>

          <div class="floating-card bottom">
            <strong>Pedido directo</strong>
            <small>sin complicaciones</small>
          </div>
        </div>
      </section>

      <section class="luxury-band reveal">
        <article>
          <b>01</b>
          <h3>Catálogo visual</h3>
          <p>Productos con imagen, descripción, precio, tallas y stock visible.</p>
        </article>

        <article>
          <b>02</b>
          <h3>Compra guiada</h3>
          <p>Carrito ordenado con datos del cliente y envío opcional.</p>
        </article>

        <article>
          <b>03</b>
          <h3>Cotización a medida</h3>
          <p>Formulario para traje personalizado con detalles completos.</p>
        </article>
      </section>

      <section class="collection reveal">
        <div class="section-head">
          <div>
            <span class="eyebrow">Selección destacada</span>
            <h2>Lo más pedido</h2>
          </div>
          <button onclick="go('catalogo')">Ver catálogo</button>
        </div>

        <div class="catalog-grid">${featured}</div>
      </section>
    </main>
  `);
}

function renderCatalog() {
  const visibleProducts = products.filter(p => p.visible !== false);

  const filteredProducts =
    selectedCategory === "Todos"
      ? visibleProducts
      : visibleProducts.filter(p => p.category === selectedCategory);

  layout(`
    <main>
      <section class="page-hero reveal">
        <span class="eyebrow">Catálogo</span>
        <h1>Elige tu próximo look formal</h1>
        <p>Filtra por categoría y realiza tu pedido a medida.</p>
      </section>

      <section class="category-filter">
        <button onclick="filterProducts('Todos')">Todos</button>
        <button onclick="filterProducts('Camisas')">Camisas</button>
        <button onclick="filterProducts('Pantalones')">Pantalones</button>
        <button onclick="filterProducts('Ternos')">Ternos</button>
      </section>

      <section class="catalog-grid reveal">
        ${filteredProducts.map(productCard).join("")}
      </section>

      <div id="modal"></div>
    </main>
  `);
}

window.filterProducts = function(category) {
  selectedCategory = category;
  renderCatalog();
};

function productCard(p) {
  return `
    <article class="product-card">
      <div class="image-wrap">
        <img src="${p.imageUrl}" alt="${p.name}">
        ${p.stock <= 0 ? `<span class="badge sold">Agotado</span>` : `<span class="badge">Stock: ${p.stock}</span>`}
      </div>

      <div class="product-info">
        <span>${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description || ""}</p>
        <strong>${money(p.price)}</strong>

          </div>
         <button class="primary" onclick="customOrderGuided('${p.id}')" ${p.stock <= 0 ? "disabled":""}>Comprar a medida</button>
    </article>
  `;
}
//  <button class="primary" onclick="addToCart('${p.id}')" ${p.stock <= 0 ? "disabled" : ""}>Agregar</button>
// window.showProduct = function(id) {
//   const p = products.find(x => x.id === id);

//   document.querySelector("#modal").innerHTML = `
//     <div class="modal-bg" onclick="closeModal()">
//       <div class="modal pop" onclick="event.stopPropagation()">
//         <img src="${p.imageUrl}" alt="${p.name}">
//         <div>
//           <span class="eyebrow">${p.category}</span>
//           <h2>${p.name}</h2>
//           <p>${p.description || ""}</p>
//           <p><b>Precio:</b> ${money(p.price)}</p>
//           <p><b>Stock:</b> ${p.stock}</p>
//           <p><b>Tallas:</b> ${(p.sizes || []).join(", ") || "Consultar"}</p>

//           <div class="modal-actions">
//             <button class="primary" onclick="addToCart('${p.id}')">Agregar al carrito</button>
//             <button onclick="closeModal()">Cerrar</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   `;
// };

// window.closeModal = function() {
//   document.querySelector("#modal").innerHTML = "";
// };

window.addToCart = function(id) {
  const p = products.find(x => x.id === id);

  if (!p || p.stock <= 0) {
    alert("Producto sin stock.");
    return;
  }

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: 1
    });
  }

  toast("Producto agregado al carrito");
  render();
};

function toast(text) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = text;
  document.body.appendChild(t);

  setTimeout(() => t.remove(), 2200);
}

function renderCart() {
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  layout(`
    <main>
      <section class="checkout reveal">
        <div>
          <span class="eyebrow">Compra</span>
          <h1>Resumen del pedido</h1>

          ${
            cart.length
              ? cart.map(item => `
                <div class="cart-row">
                  <div>
                    <strong>${item.name}</strong>
                    <p>${money(item.price)} x ${item.qty}</p>
                  </div>
                  <div>
                    <button onclick="changeQty('${item.id}', -1)">-</button>
                    <button onclick="changeQty('${item.id}', 1)">+</button>
                  </div>
                </div>
              `).join("")
              : "<p>No tienes productos agregados.</p>"
          }

          <h2>Total: ${money(total)}</h2>
        </div>

        <form class="form elevated" onsubmit="submitOrder(event)">
          <h2>Datos del cliente</h2>

          <input id="dni" placeholder="DNI" onblur="fillClientByDni()">
          <input id="firstName" placeholder="Nombres" required>
          <input id="lastName" placeholder="Apellidos" required>
          <input id="phone" placeholder="Celular" required>
          <input id="email" placeholder="Correo opcional">

          <label class="check">
            <input type="checkbox" id="delivery" onchange="toggleAddress()">
            Deseo envío a domicilio
          </label>

          <input id="address" class="hidden" placeholder="Dirección de envío">
          <textarea id="note" placeholder="Nota adicional"></textarea>

          <button class="primary big" type="submit">Comprar por WhatsApp</button>
        </form>
      </section>
    </main>
  `);
}

window.changeQty = function(id, amount) {
  const item = cart.find(x => x.id === id);
  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(x => x.id !== id);
  }

  renderCart();
};

window.toggleAddress = function() {
  document.querySelector("#address").classList.toggle("hidden", !document.querySelector("#delivery").checked);
};

window.fillClientByDni = async function() {
  const dni = document.querySelector("#dni").value.trim();
  if (!dni) return;

  const snap = await getDoc(doc(db, "clients", dni));

  if (snap.exists()) {
    const c = snap.data();
    document.querySelector("#firstName").value = c.firstName || "";
    document.querySelector("#lastName").value = c.lastName || "";
    document.querySelector("#phone").value = c.phone || "";
    document.querySelector("#email").value = c.email || "";
    document.querySelector("#address").value = c.address || "";
  }
};

// Flujo completo de compra a medida visual
// window.customOrderVisual = async function(productId) {
//   const product = products.find(p => p.id === productId);
//   if (!product) return alert("Producto no encontrado.");

//   const container = document.querySelector("#customOrderContainer");
//   container.classList.remove("hidden");

//   container.innerHTML = `
//     <div class="custom-order-card">
//       <h2>Comprar ${product.name} a medida</h2>
      
//       <img src="ruta-a-imagen-guia.png" class="custom-order-img" alt="Guía de medidas">
      
//       <label>Público:</label>
//       <select id="coTarget">
//         <option value="adult">Adulto</option>
//         <option value="child">Niño</option>
//       </select>

//       <label>Tela:</label>
//       <select id="coFabric">
//         <option value="60">Algodón 60%</option>
//         <option value="100">Algodón 100%</option>
//       </select>

//       <h3>Medidas (cm)</h3>
//       <div id="coMeasurements"></div>

//       <label>Notas adicionales:</label>
//       <textarea id="coNotes" placeholder="Opcional"></textarea>

//       <div style="display:flex; gap:10px; justify-content: flex-end;">
//         <button id="coCancel">Cancelar</button>
//         <button id="coSubmit">Enviar por WhatsApp</button>
//       </div>
//     </div>
//   `;

//   const measurementLabels = [
//     "Largo de camisa",
//     "Contorno de pecho",
//     "Contorno de cintura",
//     "Contorno de cadera",
//     "Ancho de hombro",
//     "Largo de manga",
//     "Contorno de brazo",
//     "Contorno de muñeca",
//     "Contorno de cuello",
//     "Ancho de espalda"
//   ];

//   const measurementsDiv = document.querySelector("#coMeasurements");
//   measurementLabels.forEach((label, i) => {
//     const input = document.createElement("input");
//     input.type = "number";
//     input.min = "0";
//     input.placeholder = `${i+1}. ${label}`;
//     input.id = `coMeasure${i}`;
//     measurementsDiv.appendChild(input);
//   });

//   document.querySelector("#coCancel").onclick = () => {
//     container.classList.add("hidden");
//     container.innerHTML = "";
//   };

//   document.querySelector("#coSubmit").onclick = () => {
//     // recolectar datos
//     const target = document.querySelector("#coTarget").value;
//     const fabric = document.querySelector("#coFabric").value;
//     const notes = document.querySelector("#coNotes").value.trim();

//     const measurements = {};
//     let valid = true;

//     measurementLabels.forEach((label, i) => {
//       const val = Number(document.querySelector(`#coMeasure${i}`).value);
//       if (!val || val <= 0) valid = false;
//       measurements[label] = val;
//     });

//     if (!valid) return alert("Por favor completa todas las medidas con valores válidos.");

//     const msg = `
// Hola, quiero realizar una compra de ${product.name} a medida.

// Cliente:
// Nombre: ${document.querySelector("#firstName").value} ${document.querySelector("#lastName").value}
// Celular: ${document.querySelector("#phone").value}

// Público: ${target === "adult" ? "Adulto" : "Niño"}
// Tela: Algodón ${fabric}%

// Medidas:
// ${measurementLabels.map(l => `- ${l}: ${measurements[l]} cm`).join("\n")}

// Notas adicionales:
// ${notes || "Sin nota"}
// `;

//     window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
//     container.classList.add("hidden");
//     container.innerHTML = "";
//   };
// };

window.submitOrder = async function(event) {
  event.preventDefault();

  if (!cart.length) {
    alert("Agrega productos primero.");
    return;
  }

  const client = {
    dni: document.querySelector("#dni").value.trim(),
    firstName: document.querySelector("#firstName").value.trim(),
    lastName: document.querySelector("#lastName").value.trim(),
    phone: document.querySelector("#phone").value.trim(),
    email: document.querySelector("#email").value.trim(),
    delivery: document.querySelector("#delivery").checked,
    address: document.querySelector("#address").value.trim(),
    note: document.querySelector("#note").value.trim()
  };

  try {
    const orderRef = doc(collection(db, "orders"));

    await runTransaction(db, async (transaction) => {

  const productData = [];

  // LEER TODO PRIMERO
  for (const item of cart) {
    const productRef = doc(db, "products", item.id);
    const productSnap = await transaction.get(productRef);

    if (!productSnap.exists()) {
      throw new Error(`Producto no encontrado: ${item.name}`);
    }

    const product = productSnap.data();

    if (product.stock < item.qty) {
      throw new Error(`Stock insuficiente para ${item.name}`);
    }

    productData.push({
      ref: productRef,
      stock: product.stock,
      qty: item.qty
    });
  }

  // ESCRIBIR DESPUÉS
  for (const product of productData) {
    transaction.update(product.ref, {
      stock: product.stock - product.qty
    });
  }

  transaction.set(orderRef, {
    client,
    items: cart,
    status: "pending",
    total: cart.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    ),
    createdAt: serverTimestamp()
  });
});

    if (client.dni) {
      await setDoc(doc(db, "clients", client.dni), {
        ...client,
        updatedAt: serverTimestamp()
      });
    }

    const msg = buildWhatsAppMessage(client, cart, orderRef.id);
    cart = [];
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");

    await loadProducts();
    location.hash = "catalogo";
  } catch (error) {
    alert(error.message);
  }
};

function buildWhatsAppMessage(client, items, orderId) {
  const productText = items.map(item => {

  let text = `
- ${item.name}
Cantidad: ${item.qty}
Precio: ${money(item.price)}
`;

  if(item.customOrder) {

    text += `
Tipo: ${item.target}
Algodón: ${item.fabric}%
`;

    Object.entries(item.measurements)
      .forEach(([key,value]) => {

        text += `${key}: ${value} cm\n`;

      });

    text += `Notas: ${item.notes || "Sin nota"}\n`;
  }

  return text;

}).join("\n");

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return `
Hola, quiero realizar una compra en MéndezVásquez.

Código de pedido: ${orderId}

Cliente:
DNI: ${client.dni}
Nombre: ${client.firstName} ${client.lastName}
Celular: ${client.phone}
Correo: ${client.email || "No indica"}

Productos:
${productText}

Total: ${money(total)}

Envío: ${client.delivery ? "Sí" : "No"}
Dirección: ${client.address || "No indica"}

Nota:
${client.note || "Sin nota"}
`;
}

function renderQuote() {
  layout(`
    <main>
      <section class="quote-page quote-bg reveal">
        <form class="form wide elevated" onsubmit="submitQuote(event)">
          <span class="eyebrow">Cotización personalizada</span>
          <h1>Diseña tu traje ideal</h1>
          <p>Completa los detalles y envía tu solicitud directamente por WhatsApp.</p>

          <input id="qDni" placeholder="DNI">
          <input id="qFirstName" placeholder="Nombres" required>
          <input id="qLastName" placeholder="Apellidos" required>
          <input id="qPhone" placeholder="Celular" required>

          <select id="qType">
            <option>Terno completo</option>
            <option>Saco</option>
            <option>Pantalón</option>
            <option>Camisa</option>
            <option>Traje personalizado</option>
          </select>

          <input id="qColor" placeholder="Color deseado">
          <input id="qSize" placeholder="Talla o medidas aproximadas">
          <input id="qDate" type="date">
          <textarea id="qDetails" placeholder="Describe tela, estilo, ocasión, corte, botones o detalles especiales."></textarea>

          <button class="primary big">Solicitar cotización por WhatsApp</button>
        </form>
      </section>
    </main>
  `);
}

window.submitQuote = async function(event) {
  event.preventDefault();

  const quote = {
    dni: document.querySelector("#qDni").value.trim(),
    firstName: document.querySelector("#qFirstName").value.trim(),
    lastName: document.querySelector("#qLastName").value.trim(),
    phone: document.querySelector("#qPhone").value.trim(),
    type: document.querySelector("#qType").value,
    color: document.querySelector("#qColor").value.trim(),
    size: document.querySelector("#qSize").value.trim(),
    date: document.querySelector("#qDate").value,
    details: document.querySelector("#qDetails").value.trim(),
    status: "pending",
    createdAt: serverTimestamp()
  };

  const refQuote = await addDoc(collection(db, "quotes"), quote);

  const msg = `
Hola, quiero solicitar una cotización en MéndezVásquez.

Código de cotización: ${refQuote.id}

Cliente:
DNI: ${quote.dni}
Nombre: ${quote.firstName} ${quote.lastName}
Celular: ${quote.phone}

Tipo: ${quote.type}
Color: ${quote.color}
Talla / medidas: ${quote.size}
Fecha deseada: ${quote.date}

Detalles:
${quote.details}
`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
};

function renderAdminLogin() {
  layout(`
    <main>
      <section class="admin-login reveal">
        <form class="form wide elevated" onsubmit="adminAccess(event)">
          <span class="eyebrow">Administración</span>
          <h1>Panel de control</h1>
          <input id="adminPass" type="password" placeholder="Contraseña">
          <button class="primary big">Ingresar</button>
        </form>

        <div id="adminPanel"></div>
      </section>
    </main>
  `);
}

window.adminAccess = async function(event) {
  event.preventDefault();

  if (document.querySelector("#adminPass").value !== ADMIN_PASSWORD) {
    alert("Contraseña incorrecta.");
    return;
  }

  await renderAdminPanel();
};

async function renderAdminPanel() {
  await loadProducts();

  const qOrders = query(collection(db, "orders"), where("status", "==", "pending"));
  const snapOrders = await getDocs(qOrders);
  const orders = snapOrders.docs.map(d => ({ id: d.id, ...d.data() }));

  document.querySelector("#adminPanel").innerHTML = `
    <section class="admin-grid">
      <div>
        <h2>Agregar producto</h2>

        <form onsubmit="addProductAdmin(event)">
          ${productFormFields()}
          <button type="submit">Guardar producto</button>
        </form>
      </div>

      <div>
        <h2>Pedidos pendientes</h2>
        ${
          orders.length
            ? orders.map(order => `
              <div class="admin-card">
                <h3>Pedido ${order.id}</h3>
                <p><b>Cliente:</b> ${order.client.firstName} ${order.client.lastName}</p>
                <p><b>Celular:</b> ${order.client.phone}</p>
                <p><b>Total:</b> ${money(order.total)}</p>
                <ul>${order.items.map(i => `<li>${i.name} x ${i.qty}</li>`).join("")}</ul>
                <button class="primary" onclick="markOrderDone('${order.id}')">Hecho / pagado</button>
                <button class="danger" onclick="cancelOrder('${order.id}')">Cancelar y devolver stock</button>
              </div>
            `).join("")
            : "<p>No hay pedidos pendientes.</p>"
        }
      </div>
    </section>

    <section class="admin-list">
      <h2>Editar productos</h2>

      <div class="admin-products">
        ${products.map(editProductCard).join("")}
      </div>
    </section>
  `;
}

function productFormFields(prefix = "p", product = {}) {
  const sizeType = product.sizeType || "standard";

  return `
    <input id="${prefix}Name" placeholder="Nombre del producto" value="${product.name || ""}" required>

    <select id="${prefix}Category" required>
      <option value="">Seleccionar categoría</option>
      <option value="Camisas" ${product.category === "Camisas" ? "selected" : ""}>Camisas</option>
      <option value="Pantalones" ${product.category === "Pantalones" ? "selected" : ""}>Pantalones</option>
      <option value="Ternos" ${product.category === "Ternos" ? "selected" : ""}>Ternos</option>
    </select>

    <input id="${prefix}Price" type="number" placeholder="Precio" value="${product.price || ""}" required>
    <input id="${prefix}Stock" type="number" placeholder="Stock" value="${product.stock ?? ""}" required>

    <label>Tipo de talla</label>
    <select id="${prefix}SizeType" onchange="toggleSizeInput('${prefix}')">
      <option value="standard" ${sizeType === "standard" ? "selected" : ""}>Tallas estándar</option>
      <option value="custom" ${sizeType === "custom" ? "selected" : ""}>A medida</option>
    </select>

    <input 
      id="${prefix}Sizes" 
      placeholder="Ejemplo: S, M, L, XL" 
      value="${sizeType === "custom" ? "A medida" : (product.sizes || []).join(", ")}"
      ${sizeType === "custom" ? "disabled" : ""}
    >

    <textarea id="${prefix}Description" placeholder="Descripción del producto">${product.description || ""}</textarea>

    <input 
      id="${prefix}ImagePath" 
      placeholder="/productos/camisa-azul.jpg" 
      value="${product.imageUrl || ""}" 
      required
    >

    <label class="check">
      <input id="${prefix}Featured" type="checkbox" ${product.featured ? "checked" : ""}>
      Producto destacado
    </label>

    <label class="check">
      <input id="${prefix}Visible" type="checkbox" ${product.visible === false ? "" : "checked"}>
      Visible al público
    </label>
  `;
}

window.toggleSizeInput = function(prefix) {
  const type = document.querySelector(`#${prefix}SizeType`).value;
  const sizesInput = document.querySelector(`#${prefix}Sizes`);

  if (type === "custom") {
    sizesInput.value = "A medida";
    sizesInput.disabled = true;
  } else {
    sizesInput.disabled = false;
    if (sizesInput.value === "A medida") {
      sizesInput.value = "";
    }
  }
};



function editProductCard(p) {
  return `
    <details class="admin-product-card">
      <summary>
        <img src="${p.imageUrl}" alt="${p.name}">
        <div>
          <h3>${p.name}</h3>
          <p>${p.category} | ${money(p.price)} | Stock: ${p.stock}</p>
          <small>${p.visible === false ? "Oculto" : "Visible"}</small>
        </div>
      </summary>

      <form class="form mini" onsubmit="updateFullProductAdmin(event, '${p.id}')">
        ${productFormFields(`edit-${p.id}`, p)}
        <button class="primary">Guardar cambios</button>
        <button type="button" class="danger" onclick="deleteProductAdmin('${p.id}')">Eliminar producto</button>
      </form>
    </details>
  `;
}

// window.toggleImageInputs = function(prefix = "p") {
//   const type = document.querySelector(`#${prefix}ImageType`).value;

//   document.querySelector(`#${pregetImageFromFormfix}ImageUrl`).classList.toggle("hidden", type !== "url");
//   document.querySelector(`#${prefix}ImageRepo`).classList.toggle("hidden", type !== "repo");
//   document.querySelector(`#${prefix}ImageFile`).classList.toggle("hidden", type !== "upload");
// };

async function getImageFromForm(prefix = "p") {
  const type = document.querySelector(`#${prefix}ImageType`).value;

  if (type === "upload") {
    const file = document.querySelector(`#${prefix}ImageFile`).files[0];
    if (!file) {
      alert("Selecciona un archivo para subir desde PC.");
      throw new Error("Archivo no seleccionado.");
    }
    const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);

  } else if (type === "url") {
    const url = document.querySelector(`#${prefix}ImageUrl`).value.trim();
    if (!url) {
      alert("Debes ingresar una URL válida.");
      throw new Error("URL vacía.");
    }
    return url;

  } else if (type === "repo") {
    const repoPath = document.querySelector(`#${prefix}ImageRepo`).value.trim();
    if (!repoPath) {
      alert("Selecciona una imagen del repositorio.");
      throw new Error("Repositorio vacío.");
    }
    return repoPath;
  }

  throw new Error("Tipo de imagen no soportado.");
}

window.addProductAdmin = async function(event) {
  event.preventDefault();

  try {
    const sizeType = document.querySelector("#pSizeType").value;
    const imageUrl = document.querySelector("#pImagePath").value.trim();

    const productData = {
      name: document.querySelector("#pName").value.trim(),
      category: document.querySelector("#pCategory").value,
      price: Number(document.querySelector("#pPrice").value),
      stock: Number(document.querySelector("#pStock").value),
      sizeType,
      sizes:
        sizeType === "custom"
          ? ["A medida"]
          : document.querySelector("#pSizes").value.split(",").map(s => s.trim()).filter(Boolean),
      description: document.querySelector("#pDescription").value.trim(),
      imageUrl,
      featured: document.querySelector("#pFeatured").checked,
      visible: document.querySelector("#pVisible").checked,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "products"), productData);

    alert("Producto guardado correctamente.");
    event.target.reset();
    await renderAdminPanel();

  } catch (err) {
    console.error(err);
    alert("Error al guardar producto: " + err.message);
  }
};

window.updateFullProductAdmin = async function(event, id) {
  event.preventDefault();

  const prefix = `edit-${id}`;
  const sizeType = document.querySelector(`#${prefix}SizeType`).value;

  await updateDoc(doc(db, "products", id), {
    name: document.querySelector(`#${prefix}Name`).value.trim(),
    category: document.querySelector(`#${prefix}Category`).value,
    price: Number(document.querySelector(`#${prefix}Price`).value),
    stock: Number(document.querySelector(`#${prefix}Stock`).value),
    sizeType,
    sizes:
      sizeType === "custom"
        ? ["A medida"]
        : document.querySelector(`#${prefix}Sizes`).value.split(",").map(s => s.trim()).filter(Boolean),
    description: document.querySelector(`#${prefix}Description`).value.trim(),
    imageUrl: document.querySelector(`#${prefix}ImagePath`).value.trim(),
    visible: document.querySelector(`#${prefix}Visible`).checked,
    featured: document.querySelector(`#${prefix}Featured`).checked,
    updatedAt: serverTimestamp()
  });

  toast("Producto actualizado");
  await renderAdminPanel();
};

window.deleteProductAdmin = async function(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  await deleteDoc(doc(db, "products", id));
  toast("Producto eliminado");
  await renderAdminPanel();
};

window.markOrderDone = async function(orderId) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "done",
    completedAt: serverTimestamp()
  });

  toast("Pedido marcado como pagado");
  await renderAdminPanel();
};

window.cancelOrder = async function(orderId) {
  const orderRef = doc(db, "orders", orderId);

  try {
    await runTransaction(db, async transaction => {
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) {
        throw new Error("Pedido no encontrado.");
      }

      const order = orderSnap.data();

      if (order.status !== "pending") {
        throw new Error("Este pedido ya fue procesado.");
      }

      const productsToUpdate = [];

      // 1. LEER TODOS LOS PRODUCTOS PRIMERO
      for (const item of order.items) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Producto no encontrado: ${item.name}`);
        }

        const product = productSnap.data();

        productsToUpdate.push({
          ref: productRef,
          currentStock: Number(product.stock || 0),
          qty: Number(item.qty || 0)
        });
      }

      // 2. ACTUALIZAR STOCK DESPUÉS
      for (const product of productsToUpdate) {
        transaction.update(product.ref, {
          stock: product.currentStock + product.qty
        });
      }

      // 3. CAMBIAR ESTADO DEL PEDIDO
      transaction.update(orderRef, {
        status: "cancelled",
        cancelledAt: serverTimestamp()
      });
    });

    toast("Pedido cancelado y stock devuelto");
    await renderAdminPanel();

  } catch (error) {
    alert(error.message);
  }
};

// // Mostrar filtros por categoría
// function renderCategoryFilters() {
//   const container = document.querySelector("#app");
//   const filterHtml = `
//     <div class="category-filter" style="display:flex; gap:10px; margin-bottom:20px;">
//       <button onclick="filterProducts('all')">Todos</button>
//       <button onclick="filterProducts('Camisa')">Camisas</button>
//       <button onclick="filterProducts('Pantalón')">Pantalones</button>
//       <button onclick="filterProducts('Terno')">Ternos</button>
//     </div>
//   `;
//   container.insertAdjacentHTML("afterbegin", filterHtml);
// }

// window.filterProducts = function(category) {
//   let filtered = products;
//   if(category !== "all") filtered = products.filter(p => p.category === category);
//   const grid = document.querySelector(".catalog-grid");
//   grid.innerHTML = filtered.map(productCard).join("");
// };

// Compra guiada visual
window.customOrderGuided = async function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return alert("Producto no encontrado.");

  const measurementLabels = MEASURES_BY_CATEGORY[product.category] || ["Medida principal", "Contorno", "Largo"];
  const guideImage = GUIDE_IMAGES[product.category] || product.imageUrl;

  const container = document.querySelector("#customOrderContainer");
  container.classList.remove("hidden");

  container.innerHTML = `
    <div class="custom-order-card">
      <h2>Comprar ${product.name} a medida</h2>

      <div class="custom-order-layout">
        <div>
          <img src="${guideImage}" class="custom-order-img" alt="Guía de medidas">
        </div>

        <div>  

          <label>¿Para quién es?</label>
          <select id="coTarget">
            <option value="adult">Adulto</option>
            <option value="child">Niño</option>
          </select>

          <label>Tipo de algodón</label>

<label>Cantidad</label>

<input
  id="coQty"
  type="number"
  min="1"
  max="${product.stock}"
  value="1"
>

          <select id="coFabric">
            <option value="60">Algodón 60%</option>
            <option value="100">Algodón 100%</option>
          </select>

          <h3>Medidas en cm</h3>
          <div id="coMeasurements"></div>

          <textarea id="coNotes" placeholder="Notas adicionales"></textarea>

          <div class="custom-buttons">

  <button id="coAddCart" class="primary">
    Agregar al carrito
  </button>

  <button id="coCancel">
    Cancelar
  </button>

      </div>
    </div>
  `;

  const measurementsDiv = document.querySelector("#coMeasurements");

  measurementLabels.forEach((label, index) => {
    measurementsDiv.insertAdjacentHTML("beforeend", `
      <input 
        id="coMeasure${index}" 
        type="number" 
        min="1" 
        step="0.1" 
        placeholder="${index + 1}. ${label} en cm"
      >
    `);
  });

  document.querySelector("#coCancel").onclick = () => {
    container.classList.add("hidden");
    container.innerHTML = "";
  };

  document.querySelector("#coAddCart").onclick = () => {

  const qty =
    Number(document.querySelector("#coQty").value);

  const target =
    document.querySelector("#coTarget").value;

  const fabric =
    document.querySelector("#coFabric").value;

  const notes =
    document.querySelector("#coNotes").value.trim();

  const measurements = {};

  for(let i = 0; i < measurementLabels.length; i++) {

    const value =
      document.querySelector(`#coMeasure${i}`).value;

    if(!value) {
      alert("Completa todas las medidas.");
      return;
    }

    measurements[measurementLabels[i]] = value;
  }

  cart.push({
    id: product.id,
    name: product.name,
    price: product.price,
    qty,

    customOrder: true,

    target,
    fabric,
    measurements,
    notes
  });

  toast("Producto agregado al carrito");

  container.classList.add("hidden");
  container.innerHTML = "";

  render();
};
};

async function init() {
  await seedProductsIfEmpty();
  await loadProducts();
  render();
}

init();

