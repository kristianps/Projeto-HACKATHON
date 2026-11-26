"""
Gera NORDEN_compartilhar.html: o site inteiro em UM arquivo, para enviar a amigos.

Uso (na pasta do projeto):  python gerar_arquivo_unico.py

Como funciona:
- Todas as páginas, CSS e JS são embutidos no arquivo.
- O arquivo mostra cada página dentro de um quadro (iframe srcdoc).
- Links entre páginas e redirecionamentos (N.ir) são tratados pelo arquivo principal.
- Os dados de demonstração ficam no navegador de quem abrir (localStorage).
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).parent
SAIDA = RAIZ / "NORDEN_compartilhar.html"

paginas = sorted(p.name for p in RAIZ.glob("*.html") if p.name != SAIDA.name)
arquivos = {f"{d}/{p.name}": p.read_text(encoding="utf-8")
            for d in ("css", "js") for p in sorted((RAIZ / d).glob(f"*.{d}"))}
conteudo_paginas = {nome: (RAIZ / nome).read_text(encoding="utf-8") for nome in paginas}

# Confere se cada página só referencia arquivos que existem
for nome, html in conteudo_paginas.items():
    for ref in re.findall(r'(?:href|src)="((?:css|js)/[^"]+)"', html):
        if ref not in arquivos:
            raise SystemExit(f"{nome} referencia {ref}, que não existe")

dados = json.dumps({"paginas": conteudo_paginas, "arquivos": arquivos}, ensure_ascii=False)
dados = dados.replace("</", "<\\/")  # impede que "</script>" feche o bloco de dados

SHELL = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NORDEN — Salão Masculino</title>
<meta name="theme-color" content="#0B0B0D">
<style>
  html, body { margin: 0; height: 100%; background: #0B0B0D; }
  iframe { display: block; width: 100%; height: 100%; border: 0; }
</style>
</head>
<body>
<iframe id="quadro" title="NORDEN"></iframe>
<script id="norden-dados" type="application/json">__DADOS__</script>
<script>
(() => {
  const { paginas, arquivos } = JSON.parse(document.getElementById('norden-dados').textContent);
  const quadro = document.getElementById('quadro');
  const esc = s => JSON.stringify(s).replace(/</g, '\\\\u003c');

  // Separa "agendar.html?servico=barba#x" em página, query e hash
  function separar(url) {
    const m = String(url).match(/^([^?#]*)(\\?[^#]*)?(#.*)?$/) || [];
    const pagina = (m[1] || 'index.html').split('/').pop() || 'index.html';
    return { pagina: paginas[pagina] ? pagina : 'index.html', query: m[2] || '', hash: m[3] || '' };
  }

  function montar({ pagina, query, hash }) {
    let html = paginas[pagina];
    // Embute CSS e JS
    html = html.replace(/<link rel="stylesheet" href="((?:css)\\/[^"]+)">/g, (t, ref) => '<style>' + arquivos[ref] + '</style>');
    html = html.replace(/<script src="((?:js)\\/[^"]+)"><\\/script>/g, (t, ref) => '<script>' + arquivos[ref].replace(/<\\/script/gi, '<\\\\/script') + '<\\/script>');
    // Script de ponte: informa a página atual e intercepta links entre páginas
    // <base> faz links "#secao" ficarem dentro da própria página (e não do arquivo principal)
    const ponte = '<base href="about:srcdoc"><script>' +
      'window.__NORDEN_PAGINA=' + esc(pagina) + ';window.__NORDEN_QUERY=' + esc(query) + ';' +
      'window.__NORDEN_NAV=function(u){parent.postMessage({nordenNav:String(u)},"*")};' +
      (hash ? 'try{history.replaceState(null,"",' + esc(hash) + ')}catch(e){};' : '') +
      'document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;' +
      'var h=a.getAttribute("href");if(/^[a-z0-9_-]+\\\\.html/i.test(h)){e.preventDefault();window.__NORDEN_NAV(h);}},true);' +
      '<\\/script>';
    return html.replace(/<head>/i, '<head>' + ponte);
  }

  function abrir(url, registrar) {
    const destino = separar(url);
    quadro.srcdoc = montar(destino);
    const marca = '#' + destino.pagina + destino.query + destino.hash;
    if (registrar && location.hash !== marca) history.pushState(null, '', marca);
  }

  quadro.addEventListener('load', () => {
    try { document.title = quadro.contentDocument.title || 'NORDEN'; } catch (e) {}
  });
  window.addEventListener('message', e => {
    if (e.data && typeof e.data.nordenNav === 'string') abrir(e.data.nordenNav, true);
  });
  window.addEventListener('popstate', () => abrir(location.hash.slice(1) || 'index.html', false));

  abrir(location.hash.slice(1) || 'index.html', false);
})();
</script>
</body>
</html>
"""

SAIDA.write_text(SHELL.replace("__DADOS__", dados), encoding="utf-8")
print(f"Gerado: {SAIDA.name} ({SAIDA.stat().st_size / 1024:.0f} KB, {len(paginas)} páginas)")
