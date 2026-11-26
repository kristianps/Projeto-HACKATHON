/* =========================================================
   NORDEN — Páginas públicas de serviços e profissionais
   Renderizadas a partir do catálogo único em core.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const { SERVICOS, PROFISSIONAIS, PRODUTOS, moeda, duracaoTexto, profissional, esc } = N;
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // ---------------- Serviços ----------------
  const listaServicos = document.getElementById('lista-servicos-publica');
  if (listaServicos) {
    listaServicos.innerHTML = SERVICOS.map((s, i) => `
      <li class="servico">
        <span class="servico-num">${String(i + 1).padStart(2, '0')}</span>
        <h2 style="font-size:1.25rem">${esc(s.nome)}</h2>
        <p>${esc(s.desc)}</p>
        <p class="texto-suave"><strong>Profissionais:</strong> ${s.profissionais.map(id => profissional(id).nome).join(', ')}</p>
        ${s.produtos.length ? `<p class="texto-suave"><strong>Produtos indicados:</strong> ${s.produtos.map(id => PRODUTOS[id].nome).join(', ')}</p>` : ''}
        <div class="servico-meta">
          <span class="servico-preco">${moeda(s.preco)}</span>
          <span class="servico-duracao">${duracaoTexto(s.duracao)}</span>
        </div>
        <a href="agendar.html?servico=${s.id}" class="btn btn-escuro btn-pequeno" aria-label="Agendar ${esc(s.nome)}">Agendar</a>
      </li>`).join('');
  }

  // ---------------- Profissionais ----------------
  const listaProf = document.getElementById('lista-profissionais-publica');
  if (listaProf) {
    listaProf.innerHTML = PROFISSIONAIS.map(p => {
      const servicos = SERVICOS.filter(s => s.profissionais.includes(p.id));
      return `
      <li class="cartao" style="display:grid;gap:1rem;align-content:start">
        <div style="display:flex;gap:1rem;align-items:center">
          <span class="avatar-grande" aria-hidden="true" style="width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--grafite);color:var(--bronze-claro);font-family:var(--fonte-marca);font-weight:700">${p.sigla}</span>
          <div>
            <h2 style="font-size:1.15rem">${esc(p.nome)}</h2>
            <div class="chips" style="margin-top:.35rem">${p.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
          </div>
        </div>
        <p class="texto-suave">${esc(p.bio)}</p>
        <p class="texto-suave"><strong>Atende:</strong> ${p.dias.map(d => DIAS[d]).join(', ')}</p>
        <p class="texto-suave"><strong>Serviços:</strong> ${servicos.map(s => s.nome).join(', ')}</p>
        <a href="agendar.html?profissional=${p.id}" class="btn btn-escuro btn-pequeno">Agendar com ${esc(p.nome)}</a>
      </li>`;
    }).join('');
  }
});
