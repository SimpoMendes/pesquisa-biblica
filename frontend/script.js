document.addEventListener('DOMContentLoaded', () => {
  const popularKeywords = [
    "amor","fé","esperança","perdão","sabedoria","graça","justiça","paz",
    "misericórdia","oração","humildade","salvação","bênção","santidade",
    "luz","verdade","alegria","vida","coração","coragem"
  ];

  const keywordList = document.getElementById("keyword-list");
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.getElementById("loading");

  // Preenche sidebar
  popularKeywords.forEach(palavra => {
    const li = document.createElement("li");
    li.dataset.keyword = palavra;
    li.innerHTML = `<i class="fas fa-scroll"></i> ${palavra.charAt(0).toUpperCase() + palavra.slice(1)}`;
    keywordList.appendChild(li);
  });

  async function buscarVersiculos(palavra) {
    // Chama a rota do backend que retorna o JSON
    const res = await fetch('/ministracoes');
    if (!res.ok) throw new Error(`Erro no backend (${res.status})`);
    const data = await res.json();
    return data[palavra] || [];
  }

  keywordList.addEventListener("click", async (e) => {
    if (e.target.tagName !== "LI" && e.target.tagName !== "I") return;
    const li = e.target.tagName === "LI" ? e.target : e.target.parentElement;
    const palavra = li.dataset.keyword;

    keywordList.querySelectorAll("li").forEach(i => i.classList.remove("active"));
    li.classList.add("active");

    loadingDiv.style.display = "flex";
    resultsDiv.innerHTML = "";

    try {
      const versiculos = await buscarVersiculos(palavra);
      loadingDiv.style.display = "none";

      if (!versiculos.length) {
        resultsDiv.innerHTML = `<p>Nenhuma ministração encontrada para "${palavra}".</p>`;
        return;
      }

      resultsDiv.innerHTML = "";
      versiculos.forEach(item => {
        const verseEl = document.createElement("div");
        verseEl.className = "verse";

        // Transformar quebras de linha em parágrafos
        const formattedText = item.text
          .split(/\n+/)        // divide por qualquer sequência de \n
          .map(par => `<p>${par.trim()}</p>`)
          .join('');

        verseEl.innerHTML = `<strong>${item.reference}</strong>${formattedText}`;
        resultsDiv.appendChild(verseEl);
      });

    } catch (err) {
      loadingDiv.style.display = "none";
      console.error(err);
      resultsDiv.innerHTML = `<p>Erro ao acessar a ministração: ${err.message}</p>`;
    }
  });
});
