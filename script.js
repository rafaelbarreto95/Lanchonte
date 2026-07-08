const WHATSAPP_NUMBER = "5511983786374";

document.addEventListener("DOMContentLoaded", () => {

  // 🔥 SEMPRE COMEÇA LIMPO (comportamento intencional: cada visita começa
  // com o carrinho vazio, mesmo que o navegador tenha um carrinho salvo)
  localStorage.removeItem("cart");
  let cartData = {};

  // =======================
  // ELEMENTOS
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
  // ATUALIZAR UI
  // =======================
  function update() {

    lista.innerHTML = "";

    // 🔥 RESET VISUAL (ESSENCIAL)
    document.querySelectorAll("[id^='q-']").forEach(el => {
      el.textContent = "0";
    });

    let total = 0;
    let itens = 0;

    for (let item in cartData) {

      const { qtd, preco } = cartData[item];

      total += qtd * preco;
      itens += qtd;

      const counter = document.getElementById(`q-${item}`);
      if (counter) counter.textContent = qtd;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item} x${qtd} - ${formatBRL(qtd * preco)}</span>
        <button class="remove-item" aria-label="Remover ${item} do carrinho">❌</button>
      `;

      li.querySelector("button").onclick = () => {
        delete cartData[item];
        update();
      };

      lista.appendChild(li);
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

    for (let item in cartData) {
      msg += `• ${item} x${cartData[item].qtd}\n`;
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
  // CLICK GLOBAL (🔥 FIX PRINCIPAL)
  // =======================
  document.addEventListener("click", (e) => {

    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const name = btn.dataset.name.replace(/\s/g, "-");
    const price = Number(btn.dataset.price);
    const type = btn.dataset.action;

    if (!cartData[name]) {
      cartData[name] = { qtd: 0, preco: price };
    }

    cartData[name].qtd += type === "add" ? 1 : -1;

    if (cartData[name].qtd <= 0) {
      delete cartData[name];
    }

    update();
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
    if (e.key === "Escape" && cartEl.classList.contains("active")) {
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