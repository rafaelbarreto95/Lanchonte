

document.addEventListener("DOMContentLoaded", () => {

  // 🔥 SEMPRE COMEÇA LIMPO
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

  const nomeInput = document.getElementById("nome");
  const enderecoInput = document.getElementById("endereco");
  const entregaSelect = document.getElementById("entrega");
  const pagamentoSelect = document.getElementById("pagamento");
  const trocoInput = document.getElementById("troco");

  const cartEl = document.getElementById("cart");
  const cartBtn = document.getElementById("cartBtn");

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

      // 🔥 Atualiza contador no card
      const counter = document.getElementById(`q-${item}`);
      if (counter) counter.textContent = qtd;

      // item lista
      const li = document.createElement("li");
      li.innerHTML = `
        ${item} x${qtd} - R$ ${qtd * preco}
        <button class="remove-item">❌</button>
      `;

      li.querySelector("button").onclick = () => {
        delete cartData[item];
        update();
      };

      lista.appendChild(li);
    }

    totalEl.textContent = total;
    countEl.textContent = itens;

    calcularTotalFinal();
    saveCart();
  }

  // =======================
  // TOTAL FINAL
  // =======================
  function calcularTotalFinal() {
    const taxa = Number(entregaSelect.value);
    const total = Number(totalEl.textContent);

    totalFinalEl.textContent = total + taxa;
  }

  // =======================
  // WHATSAPP
  // =======================
  function gerarMensagem() {

    if (Object.keys(cartData).length === 0) {
      alert("Adicione itens!");
      return null;
    }

    if (!nomeInput.value || !enderecoInput.value) {
      alert("Preencha nome e endereço!");
      return null;
    }

    let msg = "🍔 *NOVO PEDIDO*\n\n";

    for (let item in cartData) {
      msg += `• ${item} x${cartData[item].qtd}\n`;
    }

    msg += `\n💵 Total: R$ ${totalFinalEl.textContent}`;
    msg += `\n👤 Nome: ${nomeInput.value}`;
    msg += `\n📍 Endereço: ${enderecoInput.value}`;

    // 💳 pagamento
    msg += `\n💳 Pagamento: ${pagamentoSelect.value}`;

    // 💰 troco
    if (pagamentoSelect.value === "Dinheiro") {
      msg += `\n💰 Troco para: R$ ${trocoInput.value || "Não informado"}`;
    }

    return encodeURIComponent(msg);
  }

  // =======================
  // CLICK GLOBAL (🔥 FIX PRINCIPAL)
  // =======================
  document.addEventListener("click", (e) => {

    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const name = btn.dataset.name.replace(/\s/g, "-"); // 🔥 normaliza
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
  // CARRINHO
  // =======================
  const overlay = document.getElementById("overlay");

  // abrir carrinho
  cartBtn.addEventListener("click", () => {
    cartEl.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  // fechar clicando fora
  overlay.addEventListener("click", () => {
    cartEl.classList.remove("active");
    overlay.classList.remove("active");
  });

  // =======================
  // ENTREGA
  // =======================
  entregaSelect.addEventListener("change", calcularTotalFinal);


  // =======Troco Caso o pagamento for em dinheiro 

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

    const numero = "5511983786374";
    window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
  });

  // =======================
  // CATEGORIAS (SEM BUG DE LAYOUT)
  // =======================
  const buttons = document.querySelectorAll(".menu button");
  const categorias = document.querySelectorAll(".categoria");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      const target = btn.dataset.cat;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      categorias.forEach(cat => cat.classList.remove("active"));

      const ativa = document.getElementById(target);
      if (ativa) ativa.classList.add("active");

    });
  });

  // =======================
  // INIT
  // =======================
  update();

});

document.getElementById("ctaWhatsapp").addEventListener("click", (e) => {
  e.preventDefault();

  const numero = "5511983786374";
  const msg = encodeURIComponent("Olá! Quero fazer um pedido 🍔");

  window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
});