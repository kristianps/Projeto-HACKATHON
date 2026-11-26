/* =========================================================
   NORDEN Store — catálogo, carrinho e checkout (demonstração)
   Retirada no salão ou entrega com taxa por quilômetro.
   Nenhum pagamento é processado.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const { PRODUTOS, SERVICOS, CONFIG, moeda, esc } = N;
  const db = N.db();

  const miniatura = id => `<div class="produto-imagem" aria-hidden="true"><span class="produto-frasco${PRODUTOS[id].forma === 'pote' ? ' pote' : ''}"></span></div>`;

  // ============================ CATÁLOGO ============================
  const lista = document.getElementById('lista-produtos-loja');
  if (lista) {
    const categorias = ['Todos', ...new Set(Object.values(PRODUTOS).map(p => p.categoria))];
    const atual = N.params().get('cat') || 'Todos';

    document.getElementById('filtros-loja').innerHTML = categorias.map(c =>
      `<a class="filtro" href="loja.html${c === 'Todos' ? '' : '?cat=' + encodeURIComponent(c)}"${c === atual ? ' aria-current="page"' : ''}>${c}</a>`
    ).join('');

    const ids = Object.keys(PRODUTOS).filter(id => atual === 'Todos' || PRODUTOS[id].categoria === atual);

    lista.innerHTML = ids.map(id => {
      const p = PRODUTOS[id];
      const estoque = db.estoque[id] || 0;
      const usadoEm = SERVICOS.filter(s => s.produtos.includes(id)).map(s => s.nome);
      const infoEstoque = estoque === 0 ? 'Indisponível' : estoque <= CONFIG.estoqueBaixo ? `Últimas ${estoque} unidades` : 'Em estoque';
      return `
        <li class="produto">
          ${miniatura(id)}
          <div class="produto-corpo">
            <span class="produto-categoria">${p.categoria}</span>
            <h2 style="font-size:1rem">${esc(p.nome)}</h2>
            <p>${esc(p.desc)}</p>
            ${usadoEm.length ? `<p><small>Usado em: ${usadoEm.join(', ')}</small></p>` : ''}
            <span class="produto-preco">${moeda(p.preco)}</span>
          </div>
          <div class="produto-rodape">
            <span class="estoque-info${estoque > 0 && estoque <= CONFIG.estoqueBaixo ? ' baixo' : ''}">${infoEstoque}</span>
            <button type="button" class="btn btn-escuro btn-pequeno" data-adicionar="${id}" ${estoque === 0 ? 'disabled' : ''} aria-label="Adicionar ${esc(p.nome)} ao carrinho">Adicionar</button>
          </div>
        </li>`;
    }).join('');

    lista.querySelectorAll('[data-adicionar]').forEach(b =>
      b.addEventListener('click', () => N.adicionarAoCarrinho(b.dataset.adicionar)));
  }

  // ============================ CARRINHO ============================
  const area = document.getElementById('area-carrinho');
  if (!area) return;

  const checkout = { modalidade: 'retirada', km: null };

  function subtotal() { return db.carrinho.reduce((s, i) => s + PRODUTOS[i.id].preco * i.qtd, 0); }
  function taxa() { return checkout.modalidade === 'entrega' ? N.taxaEntrega(checkout.km) : 0; }

  function render() {
    if (!db.carrinho.length) {
      area.innerHTML = `
        <div class="estado-vazio">
          <p>Seu carrinho está vazio.</p>
          <a href="loja.html" class="btn btn-escuro">Ir para a loja</a>
        </div>`;
      return;
    }

    const logado = N.sessao() === 'cliente';
    area.innerHTML = `
      <div class="carrinho-layout">
        <div style="display:grid;gap:2rem">
          <section aria-labelledby="titulo-itens">
            <h2 id="titulo-itens" class="app-titulo" style="font-size:1.4rem;margin-bottom:1rem">Itens</h2>
            <ul class="lista-itens">
              ${db.carrinho.map(i => `
                <li class="carrinho-item">
                  <div class="carrinho-miniatura" aria-hidden="true"><span></span></div>
                  <div>
                    <h3 style="font-size:1rem">${esc(PRODUTOS[i.id].nome)}</h3>
                    <p class="texto-suave">${moeda(PRODUTOS[i.id].preco)} cada · ${db.estoque[i.id]} em estoque</p>
                  </div>
                  <div class="carrinho-item-acoes">
                    <div class="qtd-controle" role="group" aria-label="Quantidade de ${esc(PRODUTOS[i.id].nome)}">
                      <button type="button" data-menos="${i.id}" aria-label="Diminuir">−</button>
                      <span aria-live="polite">${i.qtd}</span>
                      <button type="button" data-mais="${i.id}" aria-label="Aumentar">+</button>
                    </div>
                    <strong>${moeda(PRODUTOS[i.id].preco * i.qtd)}</strong>
                    <button type="button" class="link-remover" data-remover="${i.id}">Remover</button>
                  </div>
                </li>`).join('')}
            </ul>
          </section>

          <section aria-labelledby="titulo-recebimento" style="display:grid;gap:1.25rem">
            <h2 id="titulo-recebimento" class="app-titulo" style="font-size:1.4rem">Como deseja receber?</h2>
            <div class="modalidades" role="radiogroup" aria-labelledby="titulo-recebimento">
              <label class="modalidade"><input type="radio" name="modalidade" value="retirada" ${checkout.modalidade === 'retirada' ? 'checked' : ''}>
                <span><strong>Retirada no salão</strong><small>Sem taxa. Retire no seu próximo atendimento ou quando o pedido estiver pronto.</small></span></label>
              <label class="modalidade"><input type="radio" name="modalidade" value="entrega" ${checkout.modalidade === 'entrega' ? 'checked' : ''}>
                <span><strong>Entrega</strong><small>${moeda(CONFIG.entrega.base)} + ${moeda(CONFIG.entrega.porKm)} por km · até ${CONFIG.entrega.raioMaxKm} km.</small></span></label>
            </div>

            <form id="form-entrega" class="form-grade duas" novalidate ${checkout.modalidade === 'entrega' ? '' : 'hidden'}>
              <div class="campo"><label for="cep">CEP</label><input id="cep" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="00000-000"><p class="campo-erro" id="cep-erro"></p></div>
              <div class="campo"><label for="km">Distância até o salão (km)</label><input id="km" type="number" min="0.1" step="0.1" inputmode="decimal" value="${checkout.km ?? ''}"><p class="campo-erro" id="km-erro"></p></div>
              <div class="campo inteiro"><label for="rua">Endereço</label><input id="rua" autocomplete="address-line1"><p class="campo-erro" id="rua-erro"></p></div>
              <div class="campo"><label for="numero">Número</label><input id="numero" autocomplete="address-line2"><p class="campo-erro" id="numero-erro"></p></div>
              <div class="campo"><label for="bairro">Bairro</label><input id="bairro"><p class="campo-erro" id="bairro-erro"></p></div>
              <p class="texto-suave inteiro">Demonstração: a distância é informada manualmente. Em produção, ela será calculada por um serviço de mapas.</p>
            </form>
          </section>
        </div>

        <aside class="resumo-pedido" aria-labelledby="titulo-resumo-pedido">
          <h2 id="titulo-resumo-pedido">Resumo do pedido</h2>
          <div class="linha"><span>Subtotal</span><span>${moeda(subtotal())}</span></div>
          <div class="linha"><span>${checkout.modalidade === 'entrega' ? 'Taxa de entrega' : 'Retirada no salão'}</span><span id="valor-taxa">${checkout.modalidade === 'entrega' ? (taxa() === null ? 'Informe a distância' : moeda(taxa())) : 'Grátis'}</span></div>
          <div class="linha total"><span>Total</span><strong id="valor-total">${moeda(subtotal() + (taxa() || 0))}</strong></div>
          <div class="form-status" id="status-pedido" role="status" aria-live="polite"></div>
          ${logado
            ? '<button type="button" class="btn btn-primario btn-bloco" id="btn-finalizar">Confirmar pedido</button>'
            : '<a href="login.html?perfil=cliente&voltar=carrinho.html" class="btn btn-primario btn-bloco">Entrar para finalizar</a>'}
          <p style="font-size:.78rem;color:var(--texto-suave-escuro)">Pagamento não processado nesta demonstração.</p>
        </aside>
      </div>`;

    ligarEventos();
  }

  function alterarQtd(id, delta) {
    const item = db.carrinho.find(i => i.id === id);
    if (!item) return;
    const nova = item.qtd + delta;
    if (nova > (db.estoque[id] || 0)) { N.toast('Quantidade máxima disponível em estoque.'); return; }
    if (nova <= 0) db.carrinho = db.carrinho.filter(i => i.id !== id); else item.qtd = nova;
    N.salvar(); N.atualizarContadorCarrinho(); render();
  }

  function ligarEventos() {
    area.querySelectorAll('[data-mais]').forEach(b => b.addEventListener('click', () => alterarQtd(b.dataset.mais, 1)));
    area.querySelectorAll('[data-menos]').forEach(b => b.addEventListener('click', () => alterarQtd(b.dataset.menos, -1)));
    area.querySelectorAll('[data-remover]').forEach(b => b.addEventListener('click', () => alterarQtd(b.dataset.remover, -Infinity)));

    area.querySelectorAll('input[name="modalidade"]').forEach(r => r.addEventListener('change', () => {
      checkout.modalidade = r.value;
      render();
      area.querySelector(`input[value="${r.value}"]`).focus();
    }));

    const km = document.getElementById('km');
    if (km) km.addEventListener('input', () => {
      checkout.km = parseFloat(km.value.replace(',', '.'));
      const t = taxa();
      document.getElementById('valor-taxa').textContent = t === null ? (checkout.km > CONFIG.entrega.raioMaxKm ? 'Fora da área' : 'Informe a distância') : moeda(t);
      document.getElementById('valor-total').textContent = moeda(subtotal() + (t || 0));
    });

    const cep = document.getElementById('cep');
    if (cep) cep.addEventListener('input', () => {
      const d = cep.value.replace(/\D/g, '').slice(0, 8);
      cep.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
    });

    const btn = document.getElementById('btn-finalizar');
    if (btn) btn.addEventListener('click', finalizar);
  }

  function validarEntrega() {
    const regras = {
      cep: v => v.replace(/\D/g, '').length === 8 ? '' : 'Informe um CEP com 8 dígitos.',
      km: v => {
        const n = parseFloat(v.replace(',', '.'));
        if (!(n > 0)) return 'Informe a distância em km.';
        return n > CONFIG.entrega.raioMaxKm ? `Entregamos até ${CONFIG.entrega.raioMaxKm} km. Escolha retirada no salão.` : '';
      },
      rua: v => v.length >= 3 ? '' : 'Informe o endereço.',
      numero: v => v ? '' : 'Informe o número.',
      bairro: v => v.length >= 2 ? '' : 'Informe o bairro.'
    };
    let primeiro = null;
    Object.entries(regras).forEach(([id, regra]) => {
      const campo = document.getElementById(id);
      const msg = regra(campo.value.trim());
      document.getElementById(id + '-erro').textContent = msg;
      campo.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !primeiro) primeiro = campo;
    });
    if (primeiro) primeiro.focus();
    return !primeiro;
  }

  function finalizar() {
    const status = document.getElementById('status-pedido');
    if (checkout.modalidade === 'entrega' && !validarEntrega()) return;

    // Revalida estoque no momento da confirmação
    const faltando = db.carrinho.filter(i => i.qtd > (db.estoque[i.id] || 0));
    if (faltando.length) {
      status.className = 'form-status erro';
      status.textContent = 'Estoque insuficiente para: ' + faltando.map(i => PRODUTOS[i.id].nome).join(', ') + '.';
      return;
    }

    const endereco = checkout.modalidade === 'entrega'
      ? ['rua', 'numero', 'bairro', 'cep'].map(id => document.getElementById(id).value.trim()).join(', ')
      : null;

    const pedido = {
      id: N.uid('p'), codigo: N.codigo(), clienteId: N.CLIENTE_DEMO.id, clienteNome: db.perfil.nome,
      itens: db.carrinho.map(i => ({ id: i.id, qtd: i.qtd, preco: PRODUTOS[i.id].preco })),
      modalidade: checkout.modalidade, km: checkout.modalidade === 'entrega' ? checkout.km : null, endereco,
      subtotal: subtotal(), taxa: taxa() || 0, total: subtotal() + (taxa() || 0),
      status: 'RECEBIDO', criadoEm: new Date().toISOString(),
      historico: [{ em: new Date().toISOString(), texto: 'Pedido recebido' }]
    };
    pedido.itens.forEach(i => { db.estoque[i.id] -= i.qtd; });
    db.pedidos.unshift(pedido);
    db.carrinho = [];
    N.notificar('cliente', `Pedido ${pedido.codigo} recebido. Acompanhe o status em Meus pedidos.`, 'cliente.html#pedidos');
    N.notificar('gestor', `Novo pedido ${pedido.codigo} (${pedido.modalidade === 'entrega' ? 'entrega' : 'retirada'}).`, 'gestao.html#pedidos');
    N.salvar();
    N.atualizarContadorCarrinho();

    area.innerHTML = `
      <div class="estado-vazio" style="max-width:560px;margin:0 auto">
        <span class="selo selo-concluido">Pedido recebido · simulação</span>
        <h2 class="app-titulo" style="margin-top:1rem" tabindex="-1" id="titulo-pedido-ok">Pedido ${pedido.codigo}</h2>
        <p style="margin-top:.5rem">Total ${moeda(pedido.total)} · ${pedido.modalidade === 'entrega' ? 'Entrega em ' + esc(endereco) : 'Retirada no salão'}.</p>
        <p style="margin-top:.5rem">Nenhum pagamento foi processado.</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin-top:1rem">
          <a href="loja.html" class="btn btn-contorno-escuro">Continuar comprando</a>
          <a href="cliente.html#pedidos" class="btn btn-escuro">Ver meus pedidos</a>
        </div>
      </div>`;
    document.getElementById('titulo-pedido-ok').focus();
  }

  render();
});
