document.addEventListener('DOMContentLoaded', () => {
  const popularKeywords = [
    "amor","fé","esperança","perdão","sabedoria","graça","justiça","paz",
    "misericórdia","oração","humildade","salvação","bênção","santidade",
    "luz","verdade","alegria","vida","coração","coragem"
  ];

  const keywordList = document.getElementById("keyword-list");
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.getElementById("loading");

  // Preenche a sidebar com as palavras-chave
  popularKeywords.forEach(palavra => {
    const li = document.createElement("li");
    li.dataset.keyword = palavra;
    li.innerHTML = `<i class="fas fa-scroll"></i> ${palavra.charAt(0).toUpperCase() + palavra.slice(1)}`;
    keywordList.appendChild(li);
  });

  // Função para buscar ministração do JSON via fetch
  async function buscarMinistracao(palavra) {
    try {
      // Use caminho relativo ao HTML, funciona no GitHub Pages
      const res = await fetch('./ministracoes.json'); 
      if (!res.ok) throw new Error(`Erro HTTP! Status: ${res.status}`);
      const data = await res.json();
      return data[palavra] || [];
    } catch (err) {
      console.error("Erro ao buscar JSON:", err);
      throw new Error("Não foi possível acessar o arquivo de ministrações.");
    }
  }

  // Clique em uma palavra-chave
  keywordList.addEventListener("click", async (e) => {
    if (e.target.tagName !== "LI" && e.target.tagName !== "I") return;
    const li = e.target.tagName === "LI" ? e.target : e.target.parentElement;
    const palavra = li.dataset.keyword;

    // Marcar ativo
    keywordList.querySelectorAll("li").forEach(i => i.classList.remove("active"));
    li.classList.add("active");

    // Exibir loading
    loadingDiv.style.display = "flex";
    resultsDiv.innerHTML = "";

    try {
      const ministracao = await buscarMinistracao(palavra);
      loadingDiv.style.display = "none";

      if (!ministracao.length) {
        resultsDiv.innerHTML = `<p>Nenhuma ministração encontrada para "${palavra}".</p>`;
        return;
      }

      // Exibir cada versículo ou trecho da ministração
      resultsDiv.innerHTML = "";
      ministracao.forEach(item => {
        const verseEl = document.createElement("div");
        verseEl.className = "verse";
        verseEl.innerHTML = `<strong>${item.reference || ""}</strong>: ${item.text || ""}`;
        resultsDiv.appendChild(verseEl);
      });

    } catch (err) {
      loadingDiv.style.display = "none";
      resultsDiv.innerHTML = `<p>Erro ao acessar a ministração: ${err.message}</p>`;
    }
  });
});
