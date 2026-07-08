const WHATSAPP_NUMBER = "5511983786374";

// =======================
// INGREDIENTES REMOVÍVEIS E ADICIONAIS PAGOS POR PRODUTO
// (preço base, descrição e gramagem já vêm direto do HTML de cada card)
// =======================
const PRODUCTS = {
  "X-Burguer": {
    removable: ["Alface", "Tomate", "Queijo prato", "Maionese da casa"],
    extras: [
      { name: "Bacon", price: 5 },
      { name: "Ovo", price: 3 },
      { name: "Cheddar", price: 4 },
      { name: "Cebola caramelizada", price: 3 },
      { name: "Hambúrguer extra (150g)", price: 9 }
    ]
  },
  "X-Bacon": {
    removable: ["Queijo prato", "Bacon", "Maionese da casa"],
    extras: [
      { name: "Cheddar", price: 4 },
      { name: "Ovo", price: 3 },
      { name: "Cebola caramelizada", price: 3 },
      { name: "Hambúrguer extra (150g)", price: 9 }
    ]
  },
  "X-Tudo": {
    removable: ["Presunto", "Bacon", "Ovo", "Alface", "Tomate", "Maionese da casa"],
    extras: [
      { name: "Cheddar", price: 4 },
      { name: "Cebola caramelizada", price: 3 },
      { name: "Onion rings", price: 6 },
      { name: "Hambúrguer extra (150g)", price: 9 }
    ]
  },
  "X-Calabresa": {
    removable: ["Queijo prato", "Calabresa", "Cebola roxa", "Maionese da casa"],
    extras: [
      { name: "Bacon", price: 5 },
      { name: "Cheddar", price: 4 },
      { name: "Ovo", price: 3 },
      { name: "Hambúrguer extra (150g)", price: 9 }
    ]
  },
  "X-Egg": {
    removable: ["Queijo prato", "Ovo", "Alface", "Tomate", "Maionese da casa"],
    extras: [
      { name: "Bacon", price: 5 },
      { name: "Cheddar", price: 4 },
      { name: "Cebola caramelizada", price: 3 },
      { name: "Hambúrguer extra (150g)", price: 9 }
    ]
  },
  "Batata-Cheddar-Bacon": {
    removable: ["Cheddar", "Bacon"],
    extras: [
      { name: "Bacon extra", price: 4 },
      { name: "Cheddar extra", price: 3 },
      { name: "Catupiry", price: 5 },
      { name: "Cebolinha", price: 1 }
    ]
  },
  "Calabresa-Frita": {
    removable: ["Cebola", "Pimentão"],
    extras: [
      { name: "Molho barbecue", price: 2 },
      { name: "Catupiry", price: 5 },
      { name: "Cheddar", price: 3 }
    ]
  },
  "Frango-Frito": {
    removable: [],
    extras: [
      { name: "Molho barbecue", price: 2 },
      { name: "Molho ranch", price: 2 },
      { name: "Catupiry", price: 5 },
      { name: "Cheddar", price: 3 }
    ]
  },
  "Onion-Rings": {
    removable: [],
    extras: [
      { name: "Molho barbecue", price: 2 },
      { name: "Cheddar", price: 3 },
      { name: "Catupiry", price: 5 }
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {

  // 🔥 SEMPRE COMEÇA LIMPO (comportamento intencional: cada visita começa
  // com o carrinho vazio, mesmo que o navegador tenha um carrinho salvo)
  localStorage.removeItem("cart");
  let cartData = {};

  // =======================
  // ELEMENTOS - CARRINHO
  // =======================
  const lista = document.getElementById("lista");
  const totalEl = document.getElementById("total");
  const totalFinalEl = document.getElementById("totalFinal");
  const countEl = document.getElementById("count");
  const finalizarBtn = document.getElementById("finalizar");
  const cartVazioEl = document.getElementById("cartVazio");

  const nomeInput = document.getElementById("nome");
  const enderecoInput = document.getElementById("endereco");
  const entregaSelect = document.getElementById("entrega");
  const pagamentoSelect = document.getElementById("pagamento");
  const trocoInput = document.getElementById("troco");

  const cartEl = document.getElementById("cart");
  const cartBtn = document.getElementById("cartBtn");
  const cartCloseBtn = document.getElementById("cartClose");
  const overlay = document.getElementById("overlay");

  // =======================
  // ELEMENTOS - MODAL DE PERSONALIZAÇÃO
  // =======================
  const customOverlay = document.getElementById("customOverlay");
  const customModal = document.getElementById("customModal");
  const customTitle = document.getElementById("customTitle");
  const customDesc = document.getElementById("customDesc");
  const customWeight = document.getElementById("customWeight");
  const customRemoveSection = document.getElementById("customRemoveSection");
  const customRemoveList = document.getElementById("customRemoveList");
  const customExtrasSection = document.getElementById("customExtrasSection");
  const customExtrasList = document.getElementById("customExtrasList");
  const customQtyEl = document.getElementById("customQty");
  const customMinus = document.getElementById("customMinus");
  const customPlus = document.getElementById("customPlus");
  const customAddBtn = document.getElementById("customAdd");
  const customTotalEl = document.getElementById("customTotal");
  const customCloseBtn = document.getElementById("customClose");

  let currentCustomName = null;
  let currentCustomTitle = "";
  let currentCustomBasePrice = 0;

  // =======================
  // FORMATAÇÃO DE MOEDA (pt-BR)
  // =======================
  const formatBRL = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // =======================
  // TOAST (substitui alert())
  // =======================
  let toastTimeout;
  function showToast(msg) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  // =======================
  // STORAGE
  // =======================
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cartData));
  }

  // =======================
  // ATUALIZAR UI DO CARRINHO
  // =======================
  function update() {

    lista.innerHTML = "";

    // 🔥 RESET VISUAL (ESSENCIAL)
    document.querySelectorAll("[id^='q-']").forEach(el => {
      el.textContent = "0";
    });

    let total = 0;
    let itens = 0;
    const perNameQty = {};

    for (let key in cartData) {

      const { qtd, preco, label, name } = cartData[key];

      total += qtd * preco;
      itens += qtd;
      perNameQty[name] = (perNameQty[name] || 0) + qtd;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${label} x${qtd} - ${formatBRL(qtd * preco)}</span>
        <button class="remove-item" aria-label="Remover ${label} do carrinho">❌</button>
      `;

      li.querySelector("button").onclick = () => {
        delete cartData[key];
        update();
      };

      lista.appendChild(li);
    }

    // 🔥 Contador pequeno de cada card = soma de todas as variações daquele produto
    for (let n in perNameQty) {
      const counter = document.getElementById(`q-${n}`);
      if (counter) counter.textContent = perNameQty[n];
    }

    cartVazioEl.classList.toggle("hidden", itens > 0);
    lista.style.display = itens > 0 ? "block" : "none";

    totalEl.textContent = formatBRL(total);
    countEl.textContent = itens;
    totalEl.dataset.raw = total;

    calcularTotalFinal();
    saveCart();
  }

  // =======================
  // TOTAL FINAL
  // =======================
  function calcularTotalFinal() {
    const taxa = Number(entregaSelect.value);
    const total = Number(totalEl.dataset.raw || 0);

    totalFinalEl.textContent = formatBRL(total + taxa);
    totalFinalEl.dataset.raw = total + taxa;
  }

  // =======================
  // WHATSAPP
  // =======================
  function gerarMensagem() {

    if (Object.keys(cartData).length === 0) {
      showToast("Adicione itens ao carrinho primeiro! 🍔");
      return null;
    }

    if (!nomeInput.value.trim() || !enderecoInput.value.trim()) {
      showToast("Preencha nome e endereço para finalizar!");
      return null;
    }

    let msg = "🍔 *NOVO PEDIDO*\n\n";

    for (let key in cartData) {
      msg += `• ${cartData[key].label} x${cartData[key].qtd}\n`;
    }

    msg += `\n💵 Total: ${formatBRL(Number(totalFinalEl.dataset.raw || 0))}`;
    msg += `\n👤 Nome: ${nomeInput.value.trim()}`;
    msg += `\n📍 Endereço: ${enderecoInput.value.trim()}`;
    msg += `\n💳 Pagamento: ${pagamentoSelect.value}`;

    if (pagamentoSelect.value === "Dinheiro") {
      msg += `\n💰 Troco para: R$ ${trocoInput.value || "Não informado"}`;
    }

    return encodeURIComponent(msg);
  }

  // =======================
  // LIMPAR PEDIDO (depois de enviar)
  // =======================
  function limparPedido() {
    cartData = {};
    nomeInput.value = "";
    enderecoInput.value = "";
    trocoInput.value = "";
    trocoInput.style.display = "none";
    pagamentoSelect.value = "Pix";
    entregaSelect.value = "0";
    update();
  }

  // =======================
  // ADIÇÃO RÁPIDA (botões +/- no card, sem personalização)
  // =======================
  document.addEventListener("click", (e) => {

    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const name = btn.dataset.name.replace(/\s/g, "-");
    const price = Number(btn.dataset.price);
    const type = btn.dataset.action;

    if (!cartData[name]) {
      cartData[name] = { qtd: 0, preco: price, label: name, name: name };
    }

    cartData[name].qtd += type === "add" ? 1 : -1;

    if (cartData[name].qtd <= 0) {
      delete cartData[name];
    }

    update();
  });

  // =======================
  // MODAL DE PERSONALIZAÇÃO (estilo iFood)
  // =======================
  function abrirCustomModal() {
    customModal.classList.add("active");
    customOverlay.classList.add("active");
    customModal.setAttribute("aria-hidden", "false");
  }

  function fecharCustomModal() {
    customModal.classList.remove("active");
    customOverlay.classList.remove("active");
    customModal.setAttribute("aria-hidden", "true");
  }

  function updateCustomTotal() {
    const qty = Number(customQtyEl.textContent);
    const extrasChecked = [...customExtrasList.querySelectorAll("input:checked")];
    const extrasSum = extrasChecked.reduce((sum, el) => sum + Number(el.dataset.price), 0);
    const unit = currentCustomBasePrice + extrasSum;
    customTotalEl.textContent = formatBRL(unit * qty);
  }

  function openCustomModal(name) {
    const card = document.querySelector(`.customize-btn[data-name="${CSS.escape(name)}"]`).closest(".card");
    const addBtn = card.querySelector('[data-action="add"]');
    const titleEl = card.querySelector("h3");
    const descEl = card.querySelector(".card-desc");
    const weightEl = card.querySelector(".weight-tag");

    currentCustomName = name;
    currentCustomTitle = titleEl ? titleEl.textContent : name;
    currentCustomBasePrice = Number(addBtn.dataset.price);

    customTitle.textContent = currentCustomTitle;
    customDesc.textContent = descEl ? descEl.textContent : "";
    customWeight.textContent = weightEl ? weightEl.textContent : "";

    const config = PRODUCTS[name] || { removable: [], extras: [] };

    customRemoveList.innerHTML = config.removable.map(ing => `
      <label class="custom-option">
        <span class="custom-option-label">
          <input type="checkbox" data-remove="${ing}">
          ${ing}
        </span>
      </label>
    `).join("");
    customRemoveSection.style.display = config.removable.length ? "" : "none";

    customExtrasList.innerHTML = config.extras.map(ex => `
      <label class="custom-option">
        <span class="custom-option-label">
          <input type="checkbox" data-extra="${ex.name}" data-price="${ex.price}">
          ${ex.name}
        </span>
        <span class="custom-option-price">+ ${formatBRL(ex.price)}</span>
      </label>
    `).join("");
    customExtrasSection.style.display = config.extras.length ? "" : "none";

    customExtrasList.querySelectorAll("input").forEach(el => {
      el.addEventListener("change", updateCustomTotal);
    });

    customQtyEl.textContent = "1";
    updateCustomTotal();
    abrirCustomModal();
  }

  document.addEventListener("click", (e) => {
    const custBtn = e.target.closest(".customize-btn");
    if (custBtn) openCustomModal(custBtn.dataset.name);
  });

  customMinus.addEventListener("click", () => {
    const qty = Math.max(1, Number(customQtyEl.textContent) - 1);
    customQtyEl.textContent = qty;
    updateCustomTotal();
  });

  customPlus.addEventListener("click", () => {
    const qty = Number(customQtyEl.textContent) + 1;
    customQtyEl.textContent = qty;
    updateCustomTotal();
  });

  customOverlay.addEventListener("click", fecharCustomModal);
  customCloseBtn.addEventListener("click", fecharCustomModal);

  customAddBtn.addEventListener("click", () => {
    const qty = Number(customQtyEl.textContent);

    const removed = [...customRemoveList.querySelectorAll("input:checked")]
      .map(el => el.dataset.remove)
      .sort();

    const extras = [...customExtrasList.querySelectorAll("input:checked")]
      .map(el => ({ name: el.dataset.extra, price: Number(el.dataset.price) }));

    const extrasSum = extras.reduce((s, ex) => s + ex.price, 0);
    const unitPrice = currentCustomBasePrice + extrasSum;

    const extrasNames = extras.map(e => e.name).sort();

    const sigParts = [];
    if (removed.length) sigParts.push(`rm:${removed.join(",")}`);
    if (extrasNames.length) sigParts.push(`ex:${extrasNames.join(",")}`);
    const signature = sigParts.length ? `${currentCustomName}__${sigParts.join("|")}` : currentCustomName;

    let label = currentCustomTitle;
    const modifiers = [];
    if (removed.length) modifiers.push(`sem ${removed.join(", ")}`);
    if (extrasNames.length) modifiers.push(`+ ${extrasNames.join(", ")}`);
    if (modifiers.length) label += ` (${modifiers.join("; ")})`;

    if (!cartData[signature]) {
      cartData[signature] = { qtd: 0, preco: unitPrice, label, name: currentCustomName };
    }
    cartData[signature].qtd += qty;

    update();
    fecharCustomModal();
    showToast("Item personalizado adicionado ao carrinho! 🍔");
  });

  // =======================
  // CARRINHO (abrir/fechar)
  // =======================
  function abrirCarrinho() {
    cartEl.classList.add("active");
    overlay.classList.add("active");
    cartEl.setAttribute("aria-hidden", "false");
  }

  function fecharCarrinho() {
    cartEl.classList.remove("active");
    overlay.classList.remove("active");
    cartEl.setAttribute("aria-hidden", "true");
  }

  cartBtn.addEventListener("click", () => {
    cartEl.classList.contains("active") ? fecharCarrinho() : abrirCarrinho();
  });

  overlay.addEventListener("click", fecharCarrinho);
  cartCloseBtn.addEventListener("click", fecharCarrinho);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (customModal.classList.contains("active")) {
      fecharCustomModal();
    } else if (cartEl.classList.contains("active")) {
      fecharCarrinho();
    }
  });

  // =======================
  // ENTREGA
  // =======================
  entregaSelect.addEventListener("change", calcularTotalFinal);

  // =======================
  // TROCO (só aparece se pagamento = Dinheiro)
  // =======================
  pagamentoSelect.addEventListener("change", () => {
    if (pagamentoSelect.value === "Dinheiro") {
      trocoInput.style.display = "block";
    } else {
      trocoInput.style.display = "none";
      trocoInput.value = "";
    }
  });

  // =======================
  // FINALIZAR
  // =======================
  finalizarBtn.addEventListener("click", () => {
    const msg = gerarMensagem();
    if (!msg) return;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

    // limpa o pedido depois de enviar, para o próximo cliente começar do zero
    limparPedido();
    fecharCarrinho();
    showToast("Pedido enviado! Confira o WhatsApp 🚀");
  });

  // =======================
  // CATEGORIAS (SEM BUG DE LAYOUT)
  // =======================
  const buttons = document.querySelectorAll(".menu button");
  const categorias = document.querySelectorAll(".categoria");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      const target = btn.dataset.cat;

      buttons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      categorias.forEach(cat => cat.classList.remove("active"));

      const ativa = document.getElementById(target);
      if (ativa) ativa.classList.add("active");

    });
  });

  // =======================
  // CTA DO RODAPÉ
  // =======================
  document.getElementById("ctaWhatsapp").addEventListener("click", () => {
    const msg = encodeURIComponent("Olá! Quero fazer um pedido 🍔");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  });

  // =======================
  // ANO DO RODAPÉ (sempre atualizado)
  // =======================
  const anoEl = document.getElementById("ano");
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  // =======================
  // INIT
  // =======================
  update();

});