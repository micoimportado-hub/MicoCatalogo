/* --- ELEMENTOS --- */
const listaProdutos = document.getElementById("lista-produtos");
const containerFiltros = document.getElementById("container-filtros");

const detalhe = {
    secao: document.getElementById("produto-detalhe"),
    titulo: document.getElementById("detalhe-titulo"),
    galeria: document.getElementById("detalhe-galeria"),
    instagram: document.getElementById("detalhe-instagram"),
    cores: document.getElementById("detalhe-cores")
};

let todosProdutos = [];
let corEscolhida = "Padrão"; // Guarda a cor para a mensagem

/* --- 1. BUSCAR DADOS --- */
fetch("data/produtos.json")
    .then(res => res.json())
    .then(dados => {
        todosProdutos = dados;
        criarFiltros(todosProdutos);
        renderizarProdutos(todosProdutos);
        iniciarAnimacaoScroll();
    })
    .catch(err => console.error("Erro ao carregar produtos:", err));

/* --- 2. FILTROS --- */
function criarFiltros(produtos) {
    const categorias = ["Todos", ...new Set(produtos.map(p => p.categoria))];
    containerFiltros.innerHTML = "";
    categorias.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat;
        btn.className = "botao-filtro";
        if (cat === "Todos") btn.classList.add("ativo");
        btn.onclick = () => {
            document.querySelectorAll(".botao-filtro").forEach(b => b.classList.remove("ativo"));
            btn.classList.add("ativo");
            filtrar(cat);
        };
        containerFiltros.appendChild(btn);
    });
}

function filtrar(cat) {
    const filtrados = cat === "Todos" ? todosProdutos : todosProdutos.filter(p => p.categoria === cat);
    renderizarProdutos(filtrados);
}

/* --- 3. MOSTRAR CARDS NO CATÁLOGO --- */
function renderizarProdutos(lista) {
    listaProdutos.innerHTML = "";
    const formatar = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    lista.forEach(prod => {
        const card = document.createElement("article");
        card.className = "card-produto reveal";
        card.innerHTML = `
            <div class="img-container">
                <img src="${prod.imagemPrincipal}" alt="${prod.nome}">
                <span class="tag-categoria">${prod.categoria}</span>
            </div>
            <div class="info-produto">
                <h3>${prod.nome}</h3>
                <p class="preco">${formatar(prod.preco)}</p>
                <span>Ver detalhes</span>
            </div>
        `;
        card.onclick = () => abrirDetalhe(prod);
        listaProdutos.appendChild(card);
    });
    setTimeout(iniciarAnimacaoScroll, 100);
}

/* --- 4. ABRIR DETALHES (LOGICA TURBINADA) --- */
function abrirDetalhe(produto) {
    detalhe.titulo.textContent = produto.nome;
    
    // Link direto para o Direct (só vai ser acionado depois do alert)
    detalhe.instagram.href = "https://ig.me/m/micoimporta";

    detalhe.galeria.innerHTML = "";
    detalhe.cores.innerHTML = "";
    corEscolhida = "Única/Padrão";

    const areaCores = document.querySelector(".cores-selecao");

    if (produto.variantes && produto.variantes.length > 0) {
        areaCores.style.display = "block";
        produto.variantes.forEach((v, index) => {
            const bolinha = document.createElement("span");
            bolinha.className = "bolinha-cor";
            bolinha.style.backgroundColor = v.cor;

            bolinha.onclick = () => {
                document.querySelectorAll('.bolinha-cor').forEach(b => {
                    b.style.border = "2px solid rgba(255,255,255,0.3)";
                    b.style.transform = "scale(1)";
                });
                bolinha.style.border = "3px solid var(--cor-destaque-pri)";
                bolinha.style.transform = "scale(1.2)";
                
                // Salva a cor
                corEscolhida = v.cor;
                atualizarGaleria(v.fotos);
            };

            detalhe.cores.appendChild(bolinha);
            if (index === 0) bolinha.click();
        });
    } else {
        areaCores.style.display = "none";
        const fotosPadrao = produto.galeria || [produto.imagemPrincipal];
        atualizarGaleria(fotosPadrao);
    }

    // CONFIGURAÇÃO DO COPIAR MENSAGEM
    detalhe.instagram.onclick = () => {
        const msg = `Opa! Vi o ${produto.nome} (Cor: ${corEscolhida}) no catálogo e curti demais. Ainda está disponível?`;
        navigator.clipboard.writeText(msg).then(() => {
            alert("✅ Mensagem de interesse copiada! Agora é só colar no Direct que vai abrir.");
        });
    };

    detalhe.secao.classList.add("ativo");
    setTimeout(() => {
        detalhe.secao.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
}

function atualizarGaleria(fotos) {
    detalhe.galeria.innerHTML = "";
    fotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "fade-in";
        detalhe.galeria.appendChild(img);
    });
}

/* --- 5. INTERAÇÕES DE BOTÕES E SCROLL --- */

// Botão VOLTAR
document.querySelector(".botao-voltar").onclick = () => {
    detalhe.secao.classList.remove("ativo");
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
};

// --- AQUI ESTÁ A CORREÇÃO DAS SETAS ---
// Rolar para a ESQUERDA
document.querySelector(".botao-rolar.esquerda").onclick = () => {
    listaProdutos.scrollBy({ left: -300, behavior: "smooth" });
};

// Rolar para a DIREITA
document.querySelector(".botao-rolar.direita").onclick = () => {
    listaProdutos.scrollBy({ left: 300, behavior: "smooth" });
};

/* --- 6. ANIMAÇÃO AO ROLAR TELA --- */
function iniciarAnimacaoScroll() {
    const elementos = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((ents) => {
        ents.forEach(e => { if (e.isIntersecting) e.target.classList.add('ativo'); });
    }, { threshold: 0.1 });
    elementos.forEach(el => obs.observe(el));
}