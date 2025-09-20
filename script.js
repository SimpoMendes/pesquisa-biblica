document.addEventListener('DOMContentLoaded', () => {
  const popularKeywords = [
    "amor","fé","esperança","perdão","sabedoria","graça","justiça","paz",
    "misericórdia","oração","humildade","salvação","bênção","santidade",
    "luz","verdade","alegria","vida","coração","coragem"
  ];

  const ministracoes = {
    "amor": [
      {
        "reference": "1 Coríntios 13:4-7, João 15:12, 1 João 4:7-8, Romanos 12:9-10",
        "text": "O amor é a essência da vida cristã e o reflexo do caráter de Deus em nós..."
      }
    ],
    "fé": [
      {
        "reference": "Hebreus 11:1, Mateus 17:20, Marcos 11:22-24, Romanos 10:17",
        "text": "A fé é confiança em Deus mesmo sem ver. É o alicerce da vida espiritual..."
      }
    ]
    // adicione os demais tópicos aqui...
  };

  const keywordList = document.getElementById("keyword-list");
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.getElementById("loading");

  // Preenche a sidebar
  popularKeywords.forEach(palavra => {
    const li = document.createElement("li");
    li.dataset.keyword = palavra;
    li.innerHTML = `<i class="fas fa-scroll"></i> ${palavra.charAt(0).toUpperCase() + palavra.slice(1)}`;
    keywordList.appendChild(li);
  });

  // Clique em uma palavra-chave
  keywordList.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI" && e.target.tagName !== "I") return;
    const li = e.target.tagName === "LI" ? e.target : e.target.parentElement;
    const palavra = li.dataset.keyword;

    keywordList.querySelectorAll("li").forEach(i => i.classList.remove("active"));
    li.classList.add("active");

    resultsDiv.innerHTML = "";
    loadingDiv.style.display = "flex";

    setTimeout(() => { // simula loading
      loadingDiv.style.display = "none";
      const ministracao = ministracoes[palavra] || [];
      if (!ministracao.length) {
        resultsDiv.innerHTML = `<p>Nenhuma ministração encontrada para "${palavra}".</p>`;
        return;
      }
      ministracao.forEach(item => {
        const verseEl = document.createElement("div");
        verseEl.className = "verse";
        verseEl.innerHTML = `<strong>${item.reference}</strong>: ${item.text}`;
        resultsDiv.appendChild(verseEl);
      });
    }, 300); // 0,3s de loading
  });
});
