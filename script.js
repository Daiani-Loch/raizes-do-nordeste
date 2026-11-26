/* ELEMENTOS INICIAIS E CONTROLE DAS TELAS */
const botaoFazerPedido = document.getElementById("fazerPedido");

const telaInicial = document.querySelector(".tela_inicial");
const telaUnidades = document.querySelector(".tela_unidades");


/* REINICIAR A ROLAGEM SEMPRE QUE UMA NOVA TELA FOR ABERTA */
const telasPrincipais = document.querySelectorAll(
    ".tela_inicial, .tela_unidades, .tela_cardapio, " +
    ".tela_resumo, .tela_cadastro, #telaConfirmacao, " +
    "#telaAcompanhamento, .tela_promocoes, " +
    ".tela_acesso_fidelidade, .tela_fidelidade"
);

const observadorTelas = new MutationObserver(function (alteracoes) {
    alteracoes.forEach(function (alteracao) {
        const tela = alteracao.target;

        if (getComputedStyle(tela).display !== "none") {
            window.scrollTo(0, 0);
        }
    });
});

telasPrincipais.forEach(function (tela) {
    observadorTelas.observe(tela, {
        attributes: true,
        attributeFilter: ["style"]
    });
});

const telaCadastro = document.querySelector(".tela_cadastro");
const identificacaoCliente = document.getElementById("identificacaoCliente");
const formularioCadastro = document.getElementById("formularioCadastro");
const botaoVoltarResumo = document.getElementById("voltarResumo");
const tituloCadastro = document.getElementById("tituloCadastro");
let clienteEncontrado = null;
let cadastroVeioDaFidelidade = false;


/* MONTAGEM DA TELA DE CONFIRMAÇÃO DO PEDIDO */
function abrirTelaConfirmacao(cliente) {
    clienteEncontrado = cliente;

    /* Esconde as telas anteriores */
    telaCadastro.style.display = "none";
    telaResumo.style.display = "none";

    /* Mostra os dados do cliente */
    document.getElementById("dadosClienteConfirmacao").innerHTML = `
        <p><strong>Nome:</strong> ${cliente.nome}</p>
        <p><strong>E-mail:</strong> ${cliente.email}</p>
        <p><strong>Telefone:</strong> ${cliente.telefone}</p>
        <p><strong>CPF:</strong> ${cliente.cpf}</p>
    `;

    /* Mostra o endereço cadastrado */
    const endereco = cliente.endereco;

    if (endereco) {
        document.getElementById("enderecoClienteConfirmacao").innerHTML = `
            <p>${endereco.rua}, ${endereco.numero}</p>
            <p>${endereco.bairro} - ${endereco.cidade}/${endereco.estado}</p>
        `;

        document.getElementById("areaEnderecoConfirmacao").style.display = "block";
    }

    /* Mostra os produtos escolhidos no pedido */
    const itensConfirmacao = document.getElementById("itensPedidoConfirmacao");

    itensConfirmacao.innerHTML = "";

    produtosResumo.querySelectorAll(".card_resumo").forEach(function (item) {
        const nome = item.querySelector("h3")?.textContent.trim() || "";
        const preco = item.querySelector(".preco_resumo")?.textContent.trim() || "";
        const quantidade = item.querySelector(".quantidade_resumo")?.textContent.trim() || "Qtd.: 1";

        const produto = document.createElement("div");
        produto.classList.add("produto_confirmacao");

        produto.textContent = `${nome} — ${preco} — ${quantidade}`;

        itensConfirmacao.appendChild(produto);
    });

    /* Mostra o valor total do pedido */
    document.getElementById("totalPedidoConfirmacao").textContent =
        totalResumo.textContent;

    /* Mostra a unidade escolhida */
    const unidadeConfirmacao = document.getElementById("unidadePedidoConfirmacao");

    const nomesUnidades = {
        centro: "Centro",
        shopping: "Shopping",
        bairro: "Bairro Aimoré"
    };

    unidadeConfirmacao.textContent = nomesUnidades[cardapioAtual];

    /* Exibe a tela de confirmação */
    document.getElementById("telaConfirmacao").style.display = "block";
}


/* EXIBIR OS CAMPOS DE CARTÃO */
const opcoesPagamento = document.querySelectorAll(
    'input[name="formaPagamento"]'
);

const dadosCartao = document.getElementById("dadosCartao");

/* Formatação automática da validade do cartão */
const campoValidadeCartao = document.getElementById("validadeCartao");

campoValidadeCartao.addEventListener("input", function () {
    let numeros = this.value.replace(/\D/g, "").slice(0, 4);

    if (numeros.length > 2) {
        this.value = numeros.slice(0, 2) + "/" + numeros.slice(2);
    } else {
        this.value = numeros;
    }
});

opcoesPagamento.forEach(function (opcao) {
    opcao.addEventListener("change", function () {

        if (opcao.value === "Cartão de crédito ou débito" && opcao.checked) {
            dadosCartao.style.display = "block";
        } else if (opcao.checked) {
            dadosCartao.style.display = "none";
        }

    });
});


/* CONFIGURAÇÃO DA FORMA DE RECEBIMENTO */
const opcoesRecebimento = document.querySelectorAll('input[name="formaRecebimento"]');
const areaOutroEndereco = document.getElementById("areaOutroEndereco");

opcoesRecebimento.forEach(function (opcao) {
    opcao.addEventListener("change", function () {
        if (opcao.value === "Entrega" && opcao.checked) {
            areaOutroEndereco.style.display = "block";
        } else if (opcao.checked) {
            areaOutroEndereco.style.display = "none";
        }
    });
});


/* VALIDAÇÃO E REGISTRO DO PEDIDO */

/* CONVERSÃO DAS FORMAS DE PAGAMENTO PARA A API */
const formasPagamentoAPI = {
    "Pix": "pix",
    "Cartão de crédito ou débito": "cartao",
    "Dinheiro": "dinheiro"
};

const botaoConfirmarPedido = document.getElementById("confirmarPedido");
const campoOutroEndereco = document.getElementById("outroEndereco");

let intervaloStatus = null;

botaoConfirmarPedido.addEventListener("click", async function () {

    const formaPagamento = document.querySelector(
        'input[name="formaPagamento"]:checked'
    );

    if (!formaPagamento) {
        alert("Selecione uma forma de pagamento.");
        return;
    }

    const formaRecebimento = document.querySelector(
        'input[name="formaRecebimento"]:checked'
    );

    if (!formaRecebimento) {
        alert("Selecione retirada ou entrega.");
        return;
    }
    
    /* Validar os dados do cartão */
    if (formaPagamento.value === "Cartão de crédito ou débito") {

        const numeroCartao = document.getElementById("numeroCartao").value.replace(/\D/g, "");
        console.log("Quantidade de dígitos:", numeroCartao.length);
        const nomeCartao = document.getElementById("nomeCartao").value.trim();
        const validadeCartao = document.getElementById("validadeCartao").value.trim();
        const cvvCartao = document.getElementById("cvvCartao").value.trim();
        const tipoCartao = document.getElementById("tipoCartao").value;

        if (numeroCartao.length !== 16) {
            alert("Preencha um número de cartão com 16 dígitos.");
            return;
        }

        if (nomeCartao === "") {
            alert("Preencha o nome impresso no cartão.");
            return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validadeCartao)) {
            alert("Preencha uma validade válida no formato MM/AA.");
            return;
        }

        if (!/^\d{3}$/.test(cvvCartao)) {
            alert("Preencha um CVV com 3 dígitos.");
            return;
        }

        if (tipoCartao === "") {
            alert("Selecione crédito ou débito.");
            return;
        }
    }
    
    console.log("Forma de recebimento:", formaRecebimento.value);
    console.log("Forma de pagamento:", formaPagamento.value);
    console.log("Cliente:", clienteEncontrado);
    console.log("Unidade:", cardapioAtual);
    console.log("Produtos:", produtosResumo.innerText);
    console.log("Total:", totalResumo.textContent);
    
    let enderecoEntrega = "";

    if (formaRecebimento.value === "Entrega") {
        const enderecoAlternativo = campoOutroEndereco.value.trim();

        if (enderecoAlternativo !== "") {
            enderecoEntrega = enderecoAlternativo;
        } else {
            const endereco = clienteEncontrado.endereco;

            enderecoEntrega = `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`;
        }
    }

    console.log("Endereço de entrega:", enderecoEntrega);

    /* Guardar os dados do pedido */
    const pedido = {
        id: "pedido-" + Date.now() + "-" + Math.random().toString(36).slice(2),
        cliente: clienteEncontrado,
        unidade: cardapioAtual,
        produtos: produtosResumo.innerText,
        total: totalResumo.textContent,
        formaPagamento: formaPagamento.value,
        formaRecebimento: formaRecebimento.value,
        endereco: enderecoEntrega
    };

    /* Verificar se existe um cupom aplicado */
    if (cupomAplicado) {

        const clientesAtualizados = JSON.parse(
            localStorage.getItem("clientesRaizesNordeste")
        ) || [];

        /* Normalizar o CPF do cupom */
            const cpfCupom = String(cupomAplicado.cpf || "")
            .replace(/\D/g, "");

        /* Buscar o cliente dono do cupom */
        const clienteCupom = clientesAtualizados.find(function (cliente) {
            return String(cliente.cpf || "").replace(/\D/g, "") === cpfCupom;
        });

        /* Verificar se o cliente é válido */
        if (!clienteCupom) {
            alert("Não foi possível localizar o cliente deste cupom.");
            return;
        }

        /* Garantir que a lista de cupons exista */
        const cuponsCliente = Array.isArray(clienteCupom.cuponsFidelidade)
            ? clienteCupom.cuponsFidelidade
            : [];

        /* Procurar o cupom informado */
        const cupom = cuponsCliente.find(function (item) {
            return item.codigo === cupomAplicado.codigo;
        });

        /* Verificar se o cupom existe e está disponível */
        if (!cupom || cupom.utilizado) {
            alert("Este cupom não está mais disponível. Confira o código.");
            return;
        }

        /* Atualizar o total do pedido com desconto */
        pedido.total = totalComDesconto.textContent;
    } 
    
    /* Enviar pagamento para api */
    try {
        const resposta = await fetch(
            "https://api-pagamento-raizes-do-nordeste.onrender.com/api/pagamentos",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    formaPagamento: formasPagamentoAPI[formaPagamento.value],
                    pedidoId: pedido.id
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(
                resultado.mensagem || "Não foi possível confirmar o pagamento."
            );
        }

        pedido.statusPedido = resultado.statusPedido;
        pedido.statusPagamento = resultado.statusPagamento;

    } catch (erro) {
        console.error("Erro ao confirmar pagamento:", erro);
        alert("Não foi possível confirmar o pagamento. Tente novamente.");
        return;
    }

    /* Exibir mensagem de confirmação do pagamento */
    const telaPagamentoAprovado = document.getElementById("telaPagamentoAprovado");
    const tituloPagamentoAprovado = document.getElementById("tituloPagamentoAprovado");
    const mensagemPagamentoAprovado = document.getElementById("mensagemPagamentoAprovado");

    if (formaPagamento.value === "Dinheiro") {
        tituloPagamentoAprovado.textContent = "Pedido confirmado!";
        mensagemPagamentoAprovado.textContent =
            "O pagamento será realizado no recebimento do pedido.";
    } else {
        tituloPagamentoAprovado.textContent = "Pagamento aprovado!";
        mensagemPagamentoAprovado.textContent =
            "Seu pagamento foi confirmado com sucesso.";
    }

    document.getElementById("telaConfirmacao").style.display = "none";
    telaPagamentoAprovado.style.display = "block";

    /* Manter a mensagem na tela por 5 segundos */
    await new Promise(function (resolve) {
        setTimeout(resolve, 10000);
    });

    telaPagamentoAprovado.style.display = "none";

    /* Mostrar o resumo do pedido */
    document.getElementById("resumoPedidoFinal").innerHTML = `
        <p><strong>Unidade:</strong> ${pedido.unidade}</p>
        <p><strong>Produtos:</strong></p>
        ${Array.from(produtosResumo.querySelectorAll(".card_resumo"))
            .map(function (item) {
                const nome = item.querySelector("h3")?.textContent.trim() || "";
                const preco = item.querySelector(".preco_resumo")?.textContent.trim() || "";
                const quantidade = item.querySelector(".quantidade_resumo")?.textContent.trim() || "Qtd.: 1";

                return `<p class="produto_acompanhamento">${nome} — ${preco} — ${quantidade}</p>`;
            }).join("")}
        <p><strong>Total:</strong> ${pedido.total}</p>
        <p><strong>Pagamento:</strong> ${pedido.formaPagamento}</p>
        <p><strong>Recebimento:</strong> ${pedido.formaRecebimento}</p>
        ${pedido.formaRecebimento === "Entrega"
            ? `<p><strong>Endereço:</strong> ${pedido.endereco}</p>`
            : ""}
    `;

    const statusPedido = document.getElementById("statusPedido");

    let etapasPedido;

    if (pedido.formaRecebimento === "Entrega") {
        etapasPedido = [
            "Pedido feito",
            pedido.statusPagamento,
            "Em preparação",
            "Saiu para entrega",
            "Pedido entregue!",
        ];
    } else {
        etapasPedido = [
            "Pedido feito",
            pedido.statusPagamento,
            "Em preparação",
            "Oba, o seu pedido está pronto! Você já pode vir retirar.",
            "Pedido entregue!",
        ];
    }

    let etapaAtual = 2;

    /* Gerar código único para cupom de fidelidade */
    function gerarCodigoCupom(clientes) {
        let codigo;
        let codigoExiste;

        do {
            codigo = "RAIZES50-" + Math.random().toString(36).substring(2, 8).toUpperCase();

            codigoExiste = clientes.some(function (cliente) {
                return Array.isArray(cliente.cuponsFidelidade) &&
                    cliente.cuponsFidelidade.some(function (cupom) {
                        return cupom.codigo === codigo;
                    });
            });

        } while (codigoExiste);

        return codigo;
    }

    /* Atualizar as etapas do acompanhamento do pedido */
    function atualizarStatus() {
        statusPedido.innerHTML = etapasPedido.map((etapa, indice) => {

            if (indice < etapaAtual) {

                /* Somente pedido entregue fica com a escrita verde */
                if (etapa === "Pedido entregue!") {
                   return `<p style="color: green; font-weight: bold;">✅ ${etapa}</p>`;
                }

                /* As outras etapas continuam como estavam */
                return `<p>✅ ${etapa}</p>`;

            } else if (indice === etapaAtual) {

                return `<p>🔵 ${etapa}</p>`;

            } else {

                return `<p>⏳ ${etapa}</p>`;

            }

        }).join("");
    }

    /* Parar um temporizador anterior, se existir */
    if (intervaloStatus) {
        clearInterval(intervaloStatus);
    }

    /* Esconder o bloco de novo pedido durante o acompanhamento */
    document.getElementById("blocoNovoPedido").style.display = "none";
    console.log("Bloco escondido:", document.getElementById("blocoNovoPedido").style.display);

    /* Mostrar a primeira etapa */
    atualizarStatus();

    /* Avançar uma etapa a cada 5 segundos */
    intervaloStatus = setInterval(function () {

        etapaAtual++;

        if (etapaAtual >= etapasPedido.length) {
            clearInterval(intervaloStatus);
            intervaloStatus = null;

            etapaAtual = etapasPedido.length;
            atualizarStatus();

            /* Contabilizar ponto no programa de fidelidade */
            const clientesFidelidade = JSON.parse(
                localStorage.getItem("clientesRaizesNordeste")
            ) || [];

            const cpfPedido = pedido.cliente.cpf.replace(/\D/g, "");

            const clienteFidelidade = clientesFidelidade.find(function (cliente) {
                return cliente.cpf.replace(/\D/g, "") === cpfPedido;
            });

            if (clienteFidelidade) {

                /* Preparar os dados de clientes antigos */
                clienteFidelidade.pontos = Number(clienteFidelidade.pontos) || 0;

                clienteFidelidade.pedidosConcluidos =
                    Number(clienteFidelidade.pedidosConcluidos) || 0;

                clienteFidelidade.pedidosContabilizados =
                    Array.isArray(clienteFidelidade.pedidosContabilizados)
                        ? clienteFidelidade.pedidosContabilizados
                        : [];

                /* Verificar se este pedido já gerou um ponto */
                if (!clienteFidelidade.pedidosContabilizados.includes(pedido.id)) {

                    clienteFidelidade.pontos++;
                    clienteFidelidade.pedidosConcluidos++;

                    clienteFidelidade.pedidosContabilizados.push(pedido.id);

                    /* Verificar se o cliente completou mais 10 pontos */
                    if (clienteFidelidade.pontos % 10 === 0) {

                        /* Garantir que o cliente tenha uma lista de cupons */
                        clienteFidelidade.cuponsFidelidade =
                            Array.isArray(clienteFidelidade.cuponsFidelidade)
                                ? clienteFidelidade.cuponsFidelidade
                                : [];

                        /* Gerar um cupom exclusivo */
                        const novoCupom = gerarCodigoCupom(clientesFidelidade);

                        /* Guardar o cupom vinculado ao cliente */
                        clienteFidelidade.cuponsFidelidade.push({
                            codigo: novoCupom,
                            utilizado: false
                        });

                        console.log("Cupom de fidelidade gerado:", novoCupom);
                    }

                    localStorage.setItem(
                        "clientesRaizesNordeste",
                        JSON.stringify(clientesFidelidade)
                    );

                    console.log("Ponto de fidelidade contabilizado!");
                }
            }

            /* Marcar o cupom como utilizado após a conclusão do pedido */
            if (cupomAplicado) {

                /* Garantir que o cliente foi encontrado */
                if (!clienteFidelidade) {
                    console.error("Cliente do cupom não encontrado.");
                    alert("Não foi possível validar o cupom. Entre em contato com o suporte.");
                    return;
                }

                /* Garantir que a lista de cupons exista */
                clienteFidelidade.cuponsFidelidade =
                    Array.isArray(clienteFidelidade.cuponsFidelidade)
                        ? clienteFidelidade.cuponsFidelidade
                        : [];

                /* Procurar o cupom utilizado no pedido */
                const cupomFinalizado = clienteFidelidade.cuponsFidelidade.find(
                    function (item) {
                        return item.codigo === cupomAplicado.codigo;
                    }
                );

                /* Verificar novamente se o cupom está disponível */
                if (!cupomFinalizado || cupomFinalizado.utilizado) {
                    console.error("Cupom não encontrado ou já utilizado.");
                    alert("Este cupom não está mais disponível.");
                    return;
                }

                /* Marcar o cupom como utilizado */
                cupomFinalizado.utilizado = true;

                /* Salvar os dados atualizados */
                localStorage.setItem(
                    "clientesRaizesNordeste",
                    JSON.stringify(clientesFidelidade)
                );

                console.log("Cupom utilizado com sucesso!");
            }

            const mensagemFinal = document.createElement("p");
            mensagemFinal.textContent = "Agradecemos pela preferência e esperamos te ver novamente no Raízes do Nordeste!❤️";
            mensagemFinal.style.fontWeight = "bold";

            document.getElementById("statusPedido").appendChild(mensagemFinal);

            /* Mostrar o link para fazer um novo pedido somente no final */
            document.getElementById("blocoNovoPedido").style.display = "block";

            return;
        }

        atualizarStatus();

    }, 5000);

    /* Trocar para a tela de acompanhamento */
    document.getElementById("telaConfirmacao").style.display = "none";
    document.getElementById("telaAcompanhamento").style.display = "block";
});


/* REINICIALIZAÇÃO DOS DADOS DE PAGAMENTO E RECEBIMENTO AO VOLTAR */
const botaoVoltarConfirmacao = document.getElementById("voltarCadastroConfirmacao");

botaoVoltarConfirmacao.addEventListener("click", function () {

    /* Esconder a tela de confirmação */
    document.getElementById("telaConfirmacao").style.display = "none";

    /* Limpar as formas de pagamento */
    document.querySelectorAll('input[name="formaPagamento"]').forEach(function (opcao) {
        opcao.checked = false;
    });

    /* Esconder os dados do cartão */
    dadosCartao.style.display = "none";

    /* Limpar todo os campos do cartão */
    dadosCartao.querySelectorAll("input").forEach(function (campo) {
        campo.value = "";
    });

    document.getElementById("tipoCartao").value = "";

    /* Limpar as formas de recebimento */
    document.querySelectorAll('input[name="formaRecebimento"]').forEach(function (opcao) {
        opcao.checked = false;
    });

    /* Esconder e limpar o endereço alternativo */
    document.getElementById("areaOutroEndereco").style.display = "none";
    document.getElementById("outroEndereco").value = "";

    /* Retornar para a identificação do cliente */
    telaCadastro.style.display = "flex";
    identificacaoCliente.style.display = "block";
    formularioCadastro.style.display = "none";

});


/* IDENTIFICAÇÃO DO CLIENTE PELO CPF E SENHA */
const continuarJaCadastrado = document.getElementById("continuarJaCadastrado");
const cpfCliente = document.getElementById("cpfCliente");
const senhaLogin = document.getElementById("senhaLogin");

continuarJaCadastrado.addEventListener("click", function () {

    const numerosCPF = cpfCliente.value.replace(/\D/g, "");
    const senhaDigitada = senhaLogin.value;

    if (numerosCPF.length !== 11) {
        alert("Digite um CPF com 11 números.");
        return;
    }

    if (senhaDigitada === "") {
        alert("Digite sua senha.");
        return;
    }

    const clientes = JSON.parse(
        localStorage.getItem("clientesRaizesNordeste")
    ) || [];

    clienteEncontrado = clientes.find(function (cliente) {
        return cliente.cpf.replace(/\D/g, "") === numerosCPF;
    });

    if (!clienteEncontrado) {
        alert("Cadastro não encontrado. Confira o CPF ou crie sua conta.");
        return;
    }

    if (clienteEncontrado.senha !== senhaDigitada) {
        alert("Senha incorreta. Confira sua senha e tente novamente.");
        return;
    }

    senhaLogin.value = "";

    abrirTelaConfirmacao(clienteEncontrado);
});



/* FORMATAÇÃO AUTOMÁTICA DO TELEFONE */
const telefoneCliente = document.getElementById("telefoneCliente");

telefoneCliente.addEventListener("input", function () {

    let telefone = telefoneCliente.value.replace(/\D/g, "");

    telefone = telefone.substring(0, 11);

    if (telefone.length > 0) {
        telefone = "(" + telefone;
    }

    if (telefone.length > 3) {
        telefone = telefone.substring(0, 3) + ") " + telefone.substring(3);
    }

    if (telefone.length > 10) {
        telefone = telefone.substring(0, 10) + "-" + telefone.substring(10);
    }

    telefoneCliente.value = telefone;

});

botaoFazerPedido.addEventListener("click", function () {
    origemCardapio = "pedido";

    telaInicial.style.display = "none";
    telaUnidades.style.display = "flex";

});

const botaoVoltar = document.getElementById("voltarInicio");

botaoVoltar.addEventListener("click", function () {

    telaUnidades.style.display = "none";
    telaInicial.style.display = "flex";

});


/* TELA CARDÁPIO */
const telaCardapio = document.querySelector(".tela_cardapio");

const botoesUnidades = document.querySelectorAll(".nome_unidade");

const botaoVoltarUnidades = document.getElementById("voltarUnidades");

const cardapioBairro = document.getElementById("cardapioBairro");

const botaoVoltarUnidadesBairro = document.getElementById("voltarUnidadesBairro");

const botaoContinuarPedidoBairro = document.getElementById("continuarPedidoBairro");

const produtosBairro = document.querySelectorAll(".produtoBairro");

const totalPedidoBairro = document.getElementById("totalPedidoBairro");

const mensagemContinuarBairro = document.getElementById("mensagemContinuarBairro");

const totalPedido = document.getElementById("totalPedido");

const produtos = document.querySelectorAll(".produto");

const produtosShopping = document.querySelectorAll(".produtoShopping");

const totalPedidoShopping = document.getElementById("totalPedidoShopping");

const botaoContinuarPedidoShopping = document.getElementById("continuarPedidoShopping");

const telaResumo = document.querySelector(".tela_resumo");

const produtosResumo = document.getElementById("produtosResumo");

const totalResumo = document.getElementById("totalResumo");


/* CONTROLE DO CUPOM APLICADO */
let cupomAplicado = null;


/* ELEMENTOS DA ÁREA DE CUPOM */
const codigoCupom = document.getElementById("codigoCupom");
const botaoAplicarCupom = document.getElementById("aplicarCupom");
const mensagemCupom = document.getElementById("mensagemCupom");
const valorDesconto = document.getElementById("valorDesconto");
const totalComDesconto = document.getElementById("totalComDesconto");


/* APLICAR CUPOM DE DESCONTO */
botaoAplicarCupom.addEventListener("click", function () {

    /* Remover desconto anterior, se houver */
    cupomAplicado = null;

    mensagemCupom.textContent = "";
    valorDesconto.style.display = "none";

    const codigoDigitado = codigoCupom.value.trim().toUpperCase();

    if (codigoDigitado === "") {
        alert("Digite um código de cupom.");
        codigoCupom.value = "";
        totalComDesconto.textContent = "R$ 0,00";
        return;
    }

    /* Buscar os clientes cadastrados */
    const clientes = JSON.parse(
        localStorage.getItem("clientesRaizesNordeste")
    ) || [];

    /* Procurar o cliente pelo CPF */
    const cliente = clientes.find(function (clienteSalvo) {
        return clienteEncontrado &&
            clienteSalvo.cpf.replace(/\D/g, "") ===
            clienteEncontrado.cpf.replace(/\D/g, "");
    });

    if (!cliente) {
        alert("Cliente não encontrado.");
        codigoCupom.value = "";
        totalComDesconto.textContent = "R$ 0,00";
        return;
    }

    /* Procurar o cupom no cadastro do cliente */
    const cupons = Array.isArray(cliente.cuponsFidelidade)
        ? cliente.cuponsFidelidade
        : [];

    const cupom = cupons.find(function (item) {
        return item.codigo === codigoDigitado;
    });

    if (!cupom) {
        alert("Cupom inválido ou não pertence a este cliente.");
        codigoCupom.value = "";
        totalComDesconto.textContent = "R$ 0,00";
        return;
    }

    if (cupom.utilizado) {
        alert("Este cupom já foi utilizado.");
        codigoCupom.value = "";
        totalComDesconto.textContent = "R$ 0,00";
        return;
    }

    /* Calcular o desconto de 50% */
    const totalOriginal = Number(
        totalResumo.textContent
            .replace(/[^\d,]/g, "")
            .replace(",", ".")
    );

    const desconto = totalOriginal * 0.5;
    const totalFinal = totalOriginal - desconto;

    cupomAplicado = {
        codigo: cupom.codigo,
        cpf: cliente.cpf
    };

    mensagemCupom.textContent = "Cupom aplicado com sucesso!";
    valorDesconto.textContent = "Desconto: " +
        desconto.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    valorDesconto.style.display = "block";

    totalComDesconto.textContent = totalFinal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
});

const botaoVoltarCardapio = document.getElementById("voltarCardapio");

const botaoFinalizarPedido = document.getElementById("finalizarPedido");

botaoFinalizarPedido.addEventListener("click", function () {

    telaResumo.style.display = "none";
    telaCadastro.style.display = "flex";

    identificacaoCliente.style.display = "block";
    formularioCadastro.style.display = "none";

});

botaoVoltarResumo.addEventListener("click", function () {

    telaCadastro.style.display = "none";
    telaResumo.style.display = "flex";

});

const botaoNaoPossuoCadastro = document.getElementById("naoPossuoCadastro");

botaoNaoPossuoCadastro.addEventListener("click", function () {
    botaoCadastrarFinalizar.textContent = "Cadastrar e finalizar pedido →";
    botoesCadastroCliente.classList.remove("botoes_fidelidade");

    identificacaoCliente.style.display = "none";
    formularioCadastro.style.display = "block";
    tituloCadastro.textContent = "Cadastro do Cliente";

});

const botaoVoltarIdentificacao = document.getElementById("voltarIdentificacao");
botaoVoltarIdentificacao.addEventListener("click", function () {

    formularioCadastro.style.display = "none";

    if (cadastroVeioDaFidelidade) {
        botoesCadastroCliente.classList.remove("botoes_fidelidade");

        cadastroVeioDaFidelidade = false;

        telaCadastro.style.display = "none";
        telaAcessoFidelidade.style.display = "flex";

        tituloCadastro.textContent = "Acesso ao Cadastro";

        return;
    }

    identificacaoCliente.style.display = "block";
    tituloCadastro.textContent = "Acesso ao Cadastro";

});


/* CADASTRO E VALIDAÇÃO DOS DADOS DO CLIENTE */
const botaoCadastrarFinalizar = document.getElementById("cadastrarFinalizar");
const botoesCadastroCliente = document.getElementById("botoesCadastroCliente");
const consentimentoCliente = document.getElementById("consentimentoCliente");
const mensagemConsentimento = document.getElementById("mensagemConsentimento");
const erroNomeCliente = document.getElementById("erroNomeCliente");
const erroEmailCliente = document.getElementById("erroEmailCliente");
const erroTelefoneCliente = document.getElementById("erroTelefoneCliente");
const erroCpfCadastro = document.getElementById("erroCpfCadastro");

botaoCadastrarFinalizar.addEventListener("click", function () {
    console.log("CLIQUE EM CADASTRAR E FINALIZAR");

    const nome = document.getElementById("nomeCliente").value.trim();
    const email = document.getElementById("emailCliente").value.trim();
    const telefone = document.getElementById("telefoneCliente").value.trim();
    const cpf = document.getElementById("cpfCadastro").value.trim();
    const senha = document.getElementById("senhaCadastro").value;
    const confirmarSenha = document.getElementById("confirmarSenhaCadastro").value;

    const rua = document.getElementById("ruaCliente").value.trim();
    const numero = document.getElementById("numeroCliente").value.trim();
    const bairro = document.getElementById("bairroCliente").value.trim();
    const cidade = document.getElementById("cidadeCliente").value.trim();
    const estado = document.getElementById("estadoCliente").value;

    /* Validação dos campos do cadastro */
    if (nome === "") {
        alert("Preencha o nome completo.");
        return;
    }

    if (email === "") {
        alert("Preencha o e-mail.");
        return;
    }

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
        alert("Preencha um e-mail válido.");
        return;
    }

    const numerosTelefone = telefone.replace(/\D/g, "");

    if (numerosTelefone.length !== 11) {
        alert("Preencha o número de telefone (ele deve conter exatamente 11 números).");
        return;
    }

    const numerosCPF = cpf.replace(/\D/g, "");

    if (numerosCPF.length !== 11) {
        alert("Preencha o seu CPF (ele deve conter exatamente 11 números).");
        return;
    }

    /* Validação da senha */
    if (senha.length < 6) {
        alert("A senha deve possuir pelo menos 6 caracteres.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem. Confira os campos.");
        return;
    }

    if (rua === "") {
        alert("Preencha o nome da rua.");
        return;
    }

    if (numero === "") {
    alert("Preencha o número da residência.");
    return;
    }

    if (bairro === "") {
        alert("Preencha o bairro.");
        return;
    }

    if (cidade === "") {
        alert("Preencha a cidade.");
        return;
    }

    if (estado === "") {
        alert("Selecione o estado.");
        return;
    }

    if (!consentimentoCliente.checked) {
        alert("É necessário aceitar a Política de Privacidade para continuar (Marque o campo correspondente)");
        return;
    }


    const cliente = {
        nome: nome,
        email: email,
        telefone: telefone,
        cpf: cpf,
        senha: senha,

        pontos: 0,
        pedidosConcluidos: 0,
        pedidosContabilizados: [],
        cuponsFidelidade: [],

        endereco: {
            rua: rua,
            numero: numero,
            bairro: bairro,
            cidade: cidade,
            estado: estado
        }
    };

    let clientes = JSON.parse(
        localStorage.getItem("clientesRaizesNordeste")
    ) || [];

    /* Compara os CPFs somente pelos números */
    const cpfJaCadastrado = clientes.some(function (clienteSalvo) {
        return clienteSalvo.cpf.replace(/\D/g, "") === numerosCPF;
    });

    /* Impede o cadastro duplicado */
    if (cpfJaCadastrado) {
        alert("Este CPF já possui cadastro. Volte à tela anterior para acessar sua conta.");
        return;
    }

    /* Salva o novo cliente */
    clientes.push(cliente);

    localStorage.setItem(
        "clientesRaizesNordeste",
        JSON.stringify(clientes)
    );

    console.log("Cliente cadastrado:", {
        nome: cliente.nome,
        cpf: cliente.cpf
    });

    if (cadastroVeioDaFidelidade) {

        /* Preencher o CPF do cliente recém-cadastrado */
        document.getElementById("cpfFidelidade").value = cliente.cpf;

        /* Preencher a senha do cliente recém-cadastrado */
        document.getElementById("senhaFidelidade").value = senha;

        /* Fechar a tela de cadastro */
        telaCadastro.style.display = "none";

        /* Atualizar a variável de controle */
        cadastroVeioDaFidelidade = false;

        /* Abrir a tela dos pontos usando a consulta já existente */
        botaoConsultarFidelidade.click();

    } else {

        /* Manter o funcionamento normal do pedido */
        abrirTelaConfirmacao(cliente);

    }

});

const mensagemContinuarCentro = document.getElementById("mensagemContinuarCentro");

const mensagemContinuarShopping = document.getElementById("mensagemContinuarShopping");


/* NAVEGAÇÃO ENTRE OS CARDÁPIOS DAS UNIDADES */
const cardapioCentro = document.querySelector(".tela_cardapio");
const cardapioShopping = document.getElementById("cardapioShopping");

botoesUnidades.forEach(function (botao) {

    botao.addEventListener("click", function () {

        telaUnidades.style.display = "none";

        if (botao.id === "centro") {

            cardapioAtual = "centro";
            cardapioCentro.style.display = "flex";

        }

        if (botao.id === "shopping") {

            cardapioAtual = "shopping";
            cardapioShopping.style.display = "flex";

        }

        if (botao.id === "bairro") {
            cardapioAtual = "bairro";
            cardapioBairro.style.display = "flex";
        }

    });

});


/* CONTROLE DOS PRODUTOS - CENTRO */
produtos.forEach(function (produto) {

    const item = produto.closest(".item_cardapio");
    const quantidade = item.querySelector(".quantidade");

    let valorQuantidade = 0;


    produto.addEventListener("change", function () {

        if (produto.checked) {

            valorQuantidade = 1;

            mostrarQuantidade();

        } else {

            valorQuantidade = 0;

            quantidade.innerHTML = "";

        }

        calcularTotal();

    });


    function mostrarQuantidade() {

        quantidade.innerHTML = "";


        if (valorQuantidade === 1) {

            quantidade.innerHTML = `
                <span class="numero_quantidade">1</span>
                <button class="botao_mais">+</button>
            `;

        } else if (valorQuantidade >= 2 && valorQuantidade <= 4) {

            quantidade.innerHTML = `
                <button class="botao_menos">−</button>
                <span class="numero_quantidade">${valorQuantidade}</span>
                <button class="botao_mais">+</button>
            `;

        } else if (valorQuantidade === 5) {

            quantidade.innerHTML = `
                <button class="botao_menos">−</button>
                <span class="numero_quantidade">5</span>
            `;

        }


        const botaoMais = quantidade.querySelector(".botao_mais");
        const botaoMenos = quantidade.querySelector(".botao_menos");


        if (botaoMais) {

            botaoMais.addEventListener("click", function () {

                if (valorQuantidade < 5) {

                    valorQuantidade++;

                    mostrarQuantidade();
                    calcularTotal();

                }

            });

        }


        if (botaoMenos) {

            botaoMenos.addEventListener("click", function () {

                if (valorQuantidade > 1) {

                    valorQuantidade--;

                    mostrarQuantidade();
                    calcularTotal();

                }

            });

        }

    }

    /* Função para a quantidade do produto */
    produto.getQuantidade = function () {
        return valorQuantidade;
    };

    produto.limparQuantidade = function () {
        valorQuantidade = 0;
        quantidade.innerHTML = "";
    };

});


/* CONTROLE DOS PRODUTOS - SHOPPING */
produtosShopping.forEach(function (produto) {

    const item = produto.closest(".item_cardapio");
    const quantidade = item.querySelector(".quantidade");

    let valorQuantidade = 0;


    produto.addEventListener("change", function () {

        if (produto.checked) {

            valorQuantidade = 1;

            mostrarQuantidade();

        } else {

            valorQuantidade = 0;

            quantidade.innerHTML = "";

        }

        calcularTotalShopping();

    });


    function mostrarQuantidade() {

        quantidade.innerHTML = "";


        if (valorQuantidade === 1) {

            quantidade.innerHTML = `
                <span class="numero_quantidade">1</span>
                <button class="botao_mais">+</button>
            `;

        } else if (valorQuantidade >= 2 && valorQuantidade <= 4) {

            quantidade.innerHTML = `
                <button class="botao_menos">−</button>
                <span class="numero_quantidade">${valorQuantidade}</span>
                <button class="botao_mais">+</button>
            `;

        } else if (valorQuantidade === 5) {

            quantidade.innerHTML = `
                <button class="botao_menos">−</button>
                <span class="numero_quantidade">5</span>
            `;

        }


        const botaoMais = quantidade.querySelector(".botao_mais");
        const botaoMenos = quantidade.querySelector(".botao_menos");


        if (botaoMais) {

            botaoMais.addEventListener("click", function () {

                if (valorQuantidade < 5) {

                    valorQuantidade++;

                    mostrarQuantidade();
                    calcularTotalShopping();

                }

            });

        }


        if (botaoMenos) {

            botaoMenos.addEventListener("click", function () {

                if (valorQuantidade > 1) {

                    valorQuantidade--;

                    mostrarQuantidade();
                    calcularTotalShopping();

                }

            });

        }

    }

    produto.getQuantidade = function () {
        return valorQuantidade;
    };

    produto.limparQuantidade = function () {
        valorQuantidade = 0;
        quantidade.innerHTML = "";
    };
});


/* CONTROLE DOS PRODUTOS - BAIRRO AIMORÉ */
produtosBairro.forEach(function (produto) {
    const item = produto.closest(".item_cardapio");
    const quantidade = item.querySelector(".quantidade");
    let valorQuantidade = 0;

    produto.addEventListener("change", function () {
        if (produto.checked) {
            valorQuantidade = 1;
            mostrarQuantidade();
        } else {
            valorQuantidade = 0;
            quantidade.innerHTML = "";
        }

        calcularTotalBairro();
    });

    function mostrarQuantidade() {
        quantidade.innerHTML = "";

        if (valorQuantidade === 1) {
            quantidade.innerHTML = `
                <span class="numero_quantidade">1</span>
                <button class="botao_mais">+</button>
            `;
        } else if (valorQuantidade >= 2 && valorQuantidade <= 4) {
            quantidade.innerHTML = `
                <button class="botao_menos">−</button>
                <span class="numero_quantidade">${valorQuantidade}</span>
                <button class="botao_mais">+</button>
            `;
        } else if (valorQuantidade === 5) {
            quantidade.innerHTML = `
                <button class="botao_menos">−</button>
                <span class="numero_quantidade">5</span>
            `;
        }

        const botaoMais = quantidade.querySelector(".botao_mais");
        const botaoMenos = quantidade.querySelector(".botao_menos");

        if (botaoMais) {
            botaoMais.addEventListener("click", function () {
                if (valorQuantidade < 5) {
                    valorQuantidade++;
                    mostrarQuantidade();
                    calcularTotalBairro();
                }
            });
        }

        if (botaoMenos) {
            botaoMenos.addEventListener("click", function () {
                if (valorQuantidade > 1) {
                    valorQuantidade--;
                    mostrarQuantidade();
                    calcularTotalBairro();
                }
            });
        }
    }

    produto.getQuantidade = function () {
        return valorQuantidade;
    };

    produto.limparQuantidade = function () {
        valorQuantidade = 0;
        quantidade.innerHTML = "";
    };
});


/* CALCULAR TOTAL - CENTRO */
function calcularTotal() {

    let total = 0;

    produtos.forEach(function (produto) {

        if (produto.checked) {

            const preco = Number(produto.dataset.preco);

            const quantidade = produto.getQuantidade();

            total += preco * quantidade;

        }

    });


    totalPedido.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


/* CALCULAR TOTAL - SHOPPING */
function calcularTotalShopping() {

    let total = 0;

    produtosShopping.forEach(function (produto) {

        if (produto.checked) {

            const preco = Number(produto.dataset.preco);

            const quantidade = produto.getQuantidade();

            total += preco * quantidade;

        }

    });


    totalPedidoShopping.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


/* CALCULAR TOTAL - BAIRRO AIMORÉ */
function calcularTotalBairro() {
    let total = 0;

    produtosBairro.forEach(function (produto) {
        if (produto.checked) {
            const preco = Number(produto.dataset.preco);
            const quantidade = produto.getQuantidade();
            total += preco * quantidade;
        }
    });

    totalPedidoBairro.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


/* ADICIONAR PROMOÇÕES AO RESUMO */
function adicionarPromocoesAoResumo(unidade) {
    let totalPromocoes = 0;

    promocoesSelecionadas.forEach(function (promocao) {
        if (promocao.unidade !== unidade) {
            return;
        }

        const card = document.createElement("div");
        card.classList.add("card_resumo");

        card.innerHTML = `
            <h3>${promocao.nome}</h3>

            ${promocao.descricao ? `<p>${promocao.descricao}</p>` : ""}

            <div class="informacoes_resumo">
                <span class="preco_resumo">
                    ${promocao.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                    })}
                </span>

                <span class="quantidade_resumo">
                    Qtd.: ${promocao.quantidade}
                </span>
            </div>
        `;

        produtosResumo.appendChild(card);

        totalPromocoes += promocao.preco * promocao.quantidade;
    });

    return totalPromocoes;
}


/* ABRIR RESUMO DO PEDIDO - CENTRO */
const botaoContinuarPedido = document.getElementById("continuarPedido");

botaoContinuarPedido.addEventListener("click", function () {

    const algumProdutoSelecionado = Array.from(produtos).some(function (produto) {
        return produto.checked;
    });

    if (!algumProdutoSelecionado) {
        alert("Selecione pelo menos um produto para continuar.");
        return;
    }
    
    cardapioAtual = "centro";

    produtosResumo.innerHTML = "";

    let total = 0;

    produtos.forEach(function (produto) {

        if (produto.checked) {

            const item = produto.closest(".item_cardapio");

            const nome = item.querySelector("h3").textContent;

            const descricaoElemento = item.querySelector("p");

            const descricao = descricaoElemento
                ? descricaoElemento.textContent
                : "";

            const preco = Number(produto.dataset.preco);

            const quantidade = produto.getQuantidade();

            total += preco * quantidade;

            const card = document.createElement("div");

            card.classList.add("card_resumo");

            card.innerHTML = `
                <h3>${nome}</h3>

                ${descricao ? `<p>${descricao}</p>` : ""}

                <div class="informacoes_resumo">

                    <span class="preco_resumo">
                        ${preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                        })}
                    </span>

                    <span class="quantidade_resumo">
                        Qtd.: ${quantidade}
                    </span>

                </div>
            `;

            produtosResumo.appendChild(card);

        }

    });

    total += adicionarPromocoesAoResumo("centro");

    totalResumo.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    telaCardapio.style.display = "none";
    telaResumo.style.display = "flex";

});


/* ABRIR RESUMO DO PEDIDO - SHOPPING */
botaoContinuarPedidoShopping.addEventListener("click", function () {

    const algumProdutoSelecionado = Array.from(produtosShopping).some(function (produto) {
        return produto.checked;
    });

    if (!algumProdutoSelecionado) {
        alert("Selecione pelo menos um produto para continuar.");
        return;
    }

    cardapioAtual = "shopping";

    produtosResumo.innerHTML = "";

    let total = 0;

    produtosShopping.forEach(function (produto) {

        if (produto.checked) {

            const item = produto.closest(".item_cardapio");

            const nome = item.querySelector("h3").textContent;

            const descricaoElemento = item.querySelector("p");

            const descricao = descricaoElemento
                ? descricaoElemento.textContent
                : "";

            const preco = Number(produto.dataset.preco);

            const quantidade = produto.getQuantidade();

            total += preco * quantidade;

            const card = document.createElement("div");

            card.classList.add("card_resumo");

            card.innerHTML = `
                <h3>${nome}</h3>

                ${descricao ? `<p>${descricao}</p>` : ""}

                <div class="informacoes_resumo">

                    <span class="preco_resumo">
                        ${preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                        })}
                    </span>

                    <span class="quantidade_resumo">
                        Qtd.: ${quantidade}
                    </span>

                </div>
            `;

            produtosResumo.appendChild(card);

        }

    });

    total += adicionarPromocoesAoResumo("shopping");

    totalResumo.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cardapioShopping.style.display = "none";
    telaResumo.style.display = "flex";

});


/* ABRIR RESUMO DO PEDIDO - BAIRRO AIMORÉ */
botaoContinuarPedidoBairro.addEventListener("click", function () {

    const algumProdutoSelecionado = Array.from(produtosBairro).some(function (produto) {
        return produto.checked;
    });

    if (!algumProdutoSelecionado) {
        alert("Selecione pelo menos um produto para continuar.");
        return;
    }

    cardapioAtual = "bairro";
    produtosResumo.innerHTML = "";

    let total = 0;

    produtosBairro.forEach(function (produto) {

        if (produto.checked) {

            const item = produto.closest(".item_cardapio");

            const nome = item.querySelector("h3").textContent;

            const descricaoElemento = item.querySelector("p");

            const descricao = descricaoElemento
                ? descricaoElemento.textContent
                : "";

            const preco = Number(produto.dataset.preco);

            const quantidade = produto.getQuantidade();

            total += preco * quantidade;

            const card = document.createElement("div");

            card.classList.add("card_resumo");

            card.innerHTML = `
                <h3>${nome}</h3>

                ${descricao ? `<p>${descricao}</p>` : ""}

                <div class="informacoes_resumo">

                    <span class="preco_resumo">
                        ${preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                        })}
                    </span>

                    <span class="quantidade_resumo">
                        Qtd.: ${quantidade}
                    </span>

                </div>
            `;

            produtosResumo.appendChild(card);
        }
    });

    total += adicionarPromocoesAoResumo("bairro");

    totalResumo.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cardapioBairro.style.display = "none";
    telaResumo.style.display = "flex";
});


/* VOLTAR DO RESUMO PARA O CARDÁPIO */
let cardapioAtual = "centro";
let origemCardapio = "pedido";
let veioDasPromocoes = false;
let veioDasPromocoesParaCardapio = false;

botaoVoltarCardapio.addEventListener("click", function () {

    telaResumo.style.display = "none";

    /* Se veio diretamente das promoções, volta para elas */
    if (veioDasPromocoes) {
        telaPromocoes.style.display = "block";
        veioDasPromocoes = false;
        return;
    }

    /* Caso contrário, volta para o cardápio normal */
    if (cardapioAtual === "centro") {
        cardapioCentro.style.display = "flex";
    }

    if (cardapioAtual === "shopping") {
        cardapioShopping.style.display = "flex";
    }

    if (cardapioAtual === "bairro") {
        cardapioBairro.style.display = "flex";
    }

});


/* VOLTAR DO CARDÁPIO CENTRO PARA AS UNIDADES */
botaoVoltarUnidades.addEventListener("click", function () {
    if (veioDasPromocoesParaCardapio) {

        /* Zera os produtos do cardápio completo */
        produtos.forEach(function (produto) {
            produto.checked = false;
            produto.limparQuantidade();
        });

        calcularTotal();
        mensagemContinuarCentro.style.display = "none";

        telaCardapio.style.display = "none";
        telaPromocoes.style.display = "block";
        return;
    }

    /* Zera todos os produtos */
    produtos.forEach(function (produto) {

        produto.checked = false;

        const item = produto.closest(".item_cardapio");
        const quantidade = item.querySelector(".quantidade");

        quantidade.innerHTML = "";

    });

    calcularTotal();

    mensagemContinuarCentro.style.display = "none";

    telaCardapio.style.display = "none";
    telaUnidades.style.display = "flex";

});


/* VOLTAR DO CARDÁPIO SHOPPING PARA AS UNIDADES */
const botaoVoltarUnidadesShopping = document.getElementById("voltarUnidadesShopping");

botaoVoltarUnidadesShopping.addEventListener("click", function () {
    if (veioDasPromocoesParaCardapio) {

        /* Zera os produtos do cardápio completo */
        produtosShopping.forEach(function (produto) {
            produto.checked = false;
            produto.limparQuantidade();
        });

        calcularTotalShopping();
        mensagemContinuarShopping.style.display = "none";

        cardapioShopping.style.display = "none";
        telaPromocoes.style.display = "block";
        return;
    }
    
    /* Zera todos os produtos */
    produtosShopping.forEach(function (produto) {
        produto.checked = false;

        const item = produto.closest(".item_cardapio");
        const quantidade = item.querySelector(".quantidade");

        quantidade.innerHTML = "";
    });

    calcularTotalShopping();

    mensagemContinuarShopping.style.display = "none";

    cardapioShopping.style.display = "none";
    telaUnidades.style.display = "flex";
});


/* VOLTAR DO CARDÁPIO BAIRRO PARA AS UNIDADES */
botaoVoltarUnidadesBairro.addEventListener("click", function () {
    if (veioDasPromocoesParaCardapio) {

        /* Zera os produtos do cardápio completo */
        produtosBairro.forEach(function (produto) {
            produto.checked = false;
            produto.limparQuantidade();
        });

        calcularTotalBairro();
        mensagemContinuarBairro.style.display = "none";

        cardapioBairro.style.display = "none";
        telaPromocoes.style.display = "block";
        return;
    }

    /* Zera todos os produtos */
    produtosBairro.forEach(function (produto) {
        produto.checked = false;

        const item = produto.closest(".item_cardapio");
        const quantidade = item.querySelector(".quantidade");

        quantidade.innerHTML = "";
    });

    calcularTotalBairro();

    mensagemContinuarBairro.style.display = "none";

    cardapioBairro.style.display = "none";
    telaUnidades.style.display = "flex";
});


const botaoNovoPedido = document.getElementById("botaoNovoPedido");


/* FAZER UM NOVO PEDIDO */
botaoNovoPedido.addEventListener("click", function (event) {
    event.preventDefault();

    /* Parar o acompanhamento do pedido anterior */
    if (intervaloStatus) {
        clearInterval(intervaloStatus);
        intervaloStatus = null;
    }

    /* Esconder as telas do pedido anterior */
    document.getElementById("telaAcompanhamento")?.style && (document.getElementById("telaAcompanhamento").style.display = "none");
    document.getElementById("telaConfirmacao")?.style && (document.getElementById("telaConfirmacao").style.display = "none");
    document.getElementById("telaCadastro")?.style && (document.getElementById("telaCadastro").style.display = "none");
    document.getElementById("telaResumo")?.style && (document.getElementById("telaResumo").style.display = "none");
    document.querySelector(".tela_unidades")?.style && (document.querySelector(".tela_unidades").style.display = "none");
    document.querySelector(".tela_cardapio")?.style && (document.querySelector(".tela_cardapio").style.display = "none");
    document.getElementById("cardapioShopping")?.style && (document.getElementById("cardapioShopping").style.display = "none");
    document.getElementById("cardapioBairro")?.style && (document.getElementById("cardapioBairro").style.display = "none");

    /* Voltar para a tela inicial */
    document.querySelector(".tela_inicial").style.display = "flex";

    /* Desmarcar todos os produtos dos cardápios */
    document.querySelectorAll(
        ".item_cardapio input[type='checkbox']"
        ).forEach(function (checkbox) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });

    /* Limpar os produtos do Centro */
    produtos.forEach(function (produto) {
        const checkbox = produto.querySelector("input[type='checkbox']");
        const quantidade = produto.querySelector(".quantidade");

        if (checkbox) {
            checkbox.checked = false;
        }

        if (produto.limparQuantidade) {
            produto.limparQuantidade();
        }
    });

    /* Limpar os produtos do Shopping */
    produtosShopping.forEach(function (produto) {
        const checkbox = produto.querySelector("input[type='checkbox']");
        const quantidade = produto.querySelector(".quantidade");

        if (checkbox) {
            checkbox.checked = false;
        }

        if (produto.limparQuantidade) {
            produto.limparQuantidade();
        }
    });

    /* Limpar os produtos do Bairro Aimoré */
    produtosBairro.forEach(function (produto) {
        const checkbox = produto.querySelector("input[type='checkbox']");
        const quantidade = produto.querySelector(".quantidade");

        if (checkbox) {
            checkbox.checked = false;
        }

        if (produto.limparQuantidade) {
            produto.limparQuantidade();
        }
    });

    /* Zerar os totais */
    calcularTotal();
    calcularTotalShopping();
    calcularTotalBairro();

    /* Limpar os resumos e o acompanhamento */
    document.getElementById("produtosResumo").innerHTML = "";
    document.getElementById("totalResumo").innerHTML = "";
    document.getElementById("resumoPedidoFinal").innerHTML = "";
    document.getElementById("statusPedido").innerHTML = "";

    /* Limpar mensagens de erro */
    const erroPagamento = document.getElementById("erroPagamento");
    const erroConfirmacao = document.getElementById("erroConfirmacao");

    if (erroPagamento) {
        erroPagamento.style.display = "none";
    }

    if (erroConfirmacao) {
        erroConfirmacao.style.display = "none";
    }

    /* Limpar mensagens de continuação */
    const mensagensContinuar = [
        "mensagemContinuarCentro",
        "mensagemContinuarShopping",
        "mensagemContinuarBairro"
    ];

    mensagensContinuar.forEach(function (id) {
        const mensagem = document.getElementById(id);

        if (mensagem) {
            mensagem.style.display = "none";
        }
    });

    /* Limpar os campos da confirmação */
    document.querySelectorAll(
        "#telaConfirmacao input, #telaConfirmacao textarea, #telaConfirmacao select"
    ).forEach(function (campo) {
        if (
            campo.type === "radio" ||
            campo.type === "checkbox"
        ) {
            campo.checked = false;
        } else {
            campo.value = "";
        }
    });

    /* Fechar e reiniciar os dados do cartão */
    const dadosCartao = document.getElementById("dadosCartao");

    if (dadosCartao) {
        dadosCartao.style.display = "none";
    }

    /* Limpar o campo de outro endereço */
    const outroEndereco = document.getElementById("outroEndereco");
    const areaOutroEndereco = document.getElementById("areaOutroEndereco");

    if (outroEndereco) {
        outroEndereco.value = "";
    }

    if (areaOutroEndereco) {
        areaOutroEndereco.style.display = "none";
    }
    
    /* Limpar promoções do pedido anterior */
    promocoesSelecionadas = [];

    /* Zerar as quantidades exibidas nas promoções */
    document.querySelectorAll(".card_promocao .valor_quantidade").forEach(function (campo) {
        campo.textContent = "0";
    });

    /* Limpar o cupom aplicado anteriormente */
    cupomAplicado = null;

    /* Limpar o campo de digitação do cupom */
    codigoCupom.value = "";

    /* Limpar mensagens do cupom */
    mensagemCupom.textContent = "";

    /* Esconder o valor do desconto */
    valorDesconto.style.display = "none";

    /* Restaurar o total com desconto */
    totalComDesconto.textContent = "R$ 0,00";

    /* Limpar os dados do cliente e preparar o cardápio */
    clienteEncontrado = null;
    cardapioAtual = "centro";

});


/* TELA DE PROMOÇÕES */
const botaoAbrirPromocoes = document.getElementById("promocoes");
const telaPromocoes = document.getElementById("telaPromocoes");

const botoesUnidadesPromocoes = document.querySelectorAll(
    ".unidade_promocao"
);

const secoesPromocoes = document.querySelectorAll(
    ".promocoes_unidade"
);

const botaoVoltarInicioPromocoes = document.getElementById(
    "voltarInicioPromocoes"
);


/* ABRIR A TELA DE PROMOÇÕES */
botaoAbrirPromocoes.addEventListener("click", function () {
    telaInicial.style.display = "none";
    telaUnidades.style.display = "none";

    document.querySelectorAll(".tela_cardapio").forEach(function (tela) {
        tela.style.display = "none";
    });

    telaResumo.style.display = "none";
    telaCadastro.style.display = "none";

    telaPromocoes.style.display = "block";
});


/* TROCAR A UNIDADE DAS PROMOÇÕES */
botoesUnidadesPromocoes.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const unidadeSelecionada = botao.dataset.unidade;

        /* Verifica se já existe uma promoção selecionada de outra unidade */
        const temPromocaoDeOutraUnidade = promocoesSelecionadas.some(function (promocao) {
            return promocao.unidade !== unidadeSelecionada;
        });

        if (temPromocaoDeOutraUnidade) {
            /* Remove as promoções selecionadas anteriormente */
            promocoesSelecionadas = [];

            /* Zera as quantidades de todas as promoções */
            document.querySelectorAll(".card_promocao .valor_quantidade").forEach(function (campo) {
                campo.textContent = "0";
            });
        }

        botoesUnidadesPromocoes.forEach(function (outroBotao) {
            outroBotao.classList.remove("selecionada");
        });

        botao.classList.add("selecionada");

        secoesPromocoes.forEach(function (secao) {
            secao.hidden = true;
        });

        const secoesPorUnidade = {
            centro: document.getElementById("promocoesCentro"),
            shopping: document.getElementById("promocoesShopping"),
            bairro: document.getElementById("promocoesBairro")
        };

        secoesPorUnidade[unidadeSelecionada].hidden = false;
    });
});


/* GUARDAR AS PROMOÇÕES SELECIONADAS PARA O PEDIDO */
let promocoesSelecionadas = [];


/* CONTROLAR A QUANTIDADE DE CADA PROMOÇÃO */
document.querySelectorAll(".card_promocao").forEach(function (card) {
    const botaoDiminuir = card.querySelector('[data-acao="diminuir"]');
    const botaoAumentar = card.querySelector('[data-acao="aumentar"]');
    const campoQuantidade = card.querySelector(".valor_quantidade");

    function atualizarPromocaoSelecionada() {
        const quantidade = Number(campoQuantidade.textContent);
        const id = card.dataset.promocaoId;

        const secao = card.closest(".promocoes_unidade");

        const unidades = {
            promocoesCentro: "centro",
            promocoesShopping: "shopping",
            promocoesBairro: "bairro"
        };

        const promocaoExistente = promocoesSelecionadas.findIndex(
            function (promocao) {
                return promocao.id === id;
            }
        );

        if (quantidade === 0) {
            if (promocaoExistente !== -1) {
                promocoesSelecionadas.splice(promocaoExistente, 1);
            }

            return;
        }

        const promocao = {
            id: id,
            unidade: unidades[secao.id],
            nome: card.querySelector("h3").textContent.trim(),
            descricao: card.querySelector("p:not(.preco_normal):not(.preco_promocional)")?.textContent.trim() || "",
            preco: Number(card.dataset.precoPromocional),
            quantidade: quantidade
        };

        if (promocaoExistente !== -1) {
            promocoesSelecionadas[promocaoExistente] = promocao;
        } else {
            promocoesSelecionadas.push(promocao);
        }
    }

    botaoDiminuir.addEventListener("click", function () {
        let quantidade = Number(campoQuantidade.textContent);

        if (quantidade > 0) {
            quantidade--;
            campoQuantidade.textContent = quantidade;

            atualizarPromocaoSelecionada();
        }
    });

    botaoAumentar.addEventListener("click", function () {
        let quantidade = Number(campoQuantidade.textContent);

        if (quantidade < 3) {
            quantidade++;
            campoQuantidade.textContent = quantidade;

            atualizarPromocaoSelecionada();
        } else {
            alert("Você pode pedir no máximo 3 unidades desta promoção.");
        }
    });
});


/* VOLTAR PARA A PÁGINA INICIAL */
botaoVoltarInicioPromocoes.addEventListener("click", function () {

    /* Limpa as promoções selecionadas */
    promocoesSelecionadas = [];

    /* Zera as quantidades exibidas nas promoções */
    document.querySelectorAll(".card_promocao .valor_quantidade").forEach(function (campo) {
        campo.textContent = "0";
    });

    /* Volta para a tela inicial */
    telaPromocoes.style.display = "none";
    telaInicial.style.display = "flex";

});


/* ABRIR O CARDÁPIO NORMAL A PARTIR DAS PROMOÇÕES */
const botaoAdicionarCardapio = document.getElementById("acrescentarCardapio");

botaoAdicionarCardapio.addEventListener("click", function () {
    origemCardapio = "promocoes";
    
    const algumaPromocaoSelecionada = promocoesSelecionadas.some(function (promocao) {
        return promocao.quantidade > 0;
    });

    if (!algumaPromocaoSelecionada) {
        alert('Caso não queira adquirir nenhuma das promoções, volte à página inicial e realize o seu pedido pela aba "Fazer Pedido".');
        return;
    }
    veioDasPromocoesParaCardapio = true;
    veioDasPromocoes = false;

    /* Esconde a tela de promoções */
    telaPromocoes.style.display = "none";

    /* Abre o cardápio da unidade selecionada */
    if (document.getElementById("promocoesCentro").hidden === false) {
        cardapioAtual = "centro";
        document.querySelector(".tela_cardapio").style.display = "flex";
    } else if (document.getElementById("promocoesShopping").hidden === false) {
        cardapioAtual = "shopping";
        document.getElementById("cardapioShopping").style.display = "flex";
    } else if (document.getElementById("promocoesBairro").hidden === false) {
        cardapioAtual = "bairro";
        document.getElementById("cardapioBairro").style.display = "flex";
    }
});


/* CONCLUIR PEDIDO SOMENTE COM PROMOÇÕES */
const botaoConcluirPromocoes = document.getElementById("concluirPromocoes");

botaoConcluirPromocoes.addEventListener("click", function () {
    let unidadeSelecionada = "";

    if (document.getElementById("promocoesCentro").hidden === false) {
        unidadeSelecionada = "centro";
    } else if (document.getElementById("promocoesShopping").hidden === false) {
        unidadeSelecionada = "shopping";
    } else if (document.getElementById("promocoesBairro").hidden === false) {
        unidadeSelecionada = "bairro";
    }

    const temPromocao = promocoesSelecionadas.some(function (promocao) {
        return promocao.unidade === unidadeSelecionada &&
            promocao.quantidade > 0;
    });

    if (!temPromocao) {
        alert("Selecione pelo menos uma promoção antes de continuar.");
        return;
    }

    cardapioAtual = unidadeSelecionada;

    produtosResumo.innerHTML = "";

    const total = adicionarPromocoesAoResumo(unidadeSelecionada);

    totalResumo.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    veioDasPromocoes = true;

    telaPromocoes.style.display = "none";
    telaResumo.style.display = "flex";
});


/* NAVEGAÇÃO DO PROGRAMA FIDELIDADE */
const botaoFidelidade = document.getElementById("fidelidade");
const telaAcessoFidelidade = document.getElementById("telaAcessoFidelidade");
const telaFidelidade = document.getElementById("telaFidelidade");
const botaoVoltarFidelidade = document.getElementById("voltarInicioFidelidade");
const botaoVoltarDaFidelidade = document.getElementById("voltarInicioDaFidelidade");

function abrirTelaAcessoFidelidade() {
    document.querySelectorAll(
        ".tela_inicial, .tela_unidades, .tela_cardapio, .tela_resumo, " +
        ".tela_cadastro, .tela_confirmacao, .tela_promocoes, #telaAcompanhamento, " +
        ".tela_fidelidade"
    ).forEach(tela => {
        tela.style.display = "none";
    });

    telaAcessoFidelidade.style.display = "flex";
}

function voltarInicioFidelidade() {
    telaAcessoFidelidade.style.display = "none";
    telaFidelidade.style.display = "none";

    document.querySelector(".tela_inicial").style.display = "flex";
}

if (botaoFidelidade) {
    botaoFidelidade.addEventListener("click", abrirTelaAcessoFidelidade);
}

if (botaoVoltarFidelidade) {
    botaoVoltarFidelidade.addEventListener("click", voltarInicioFidelidade);
}

if (botaoVoltarDaFidelidade) {
    botaoVoltarDaFidelidade.addEventListener("click", voltarInicioFidelidade);
}


/* CADASTRO INICIADO PELA FIDELIDADE */
const botaoCriarContaFidelidade =
    document.getElementById("cadastrarFidelidade");

if (botaoCriarContaFidelidade) {
    botoesCadastroCliente.classList.add("botoes_fidelidade");
    botaoCadastrarFinalizar.textContent = "Cadastrar";
    
    botaoCriarContaFidelidade.addEventListener("click", function () {
        cadastroVeioDaFidelidade = true;

        telaAcessoFidelidade.style.display = "none";
        telaFidelidade.style.display = "none";

        telaCadastro.style.display = "flex";
        identificacaoCliente.style.display = "none";
        formularioCadastro.style.display = "block";

        tituloCadastro.textContent = "Cadastro para Fidelidade";
        botaoCadastrarFinalizar.textContent = "Cadastrar →";

        document.getElementById("cpfCadastro").value =
            document.getElementById("cpfFidelidade").value.trim();

        document.getElementById("erroCpfCadastro").style.display = "none";
    });
}


/* CONSULTAR CADASTRO NA FIDELIDADE */
const botaoConsultarFidelidade =
    document.getElementById("continuarFidelidade");

if (botaoConsultarFidelidade) {
    botaoConsultarFidelidade.addEventListener("click", function () {
        const campoCPF = document.getElementById("cpfFidelidade");
        const erroCPF = document.getElementById("erroCpfFidelidade");

        const campoSenha = document.getElementById("senhaFidelidade");
        const senhaDigitada = campoSenha.value;

        const numerosCPF = campoCPF.value.replace(/\D/g, "");

        if (numerosCPF.length !== 11) {
            alert("Digite um CPF com 11 números.");
            return;
        }

        if (senhaDigitada.trim() === "") {
            alert("Digite sua senha para consultar a fidelidade.");
            return;
        }

        const clientes = JSON.parse(
            localStorage.getItem("clientesRaizesNordeste")
        ) || [];

        const cliente = clientes.find(function (clienteSalvo) {
            return clienteSalvo.cpf.replace(/\D/g, "") === numerosCPF;
        });

        if (!cliente) {
            alert("Cadastro não encontrado. Confira o CPF ou crie sua conta para participar do programa.");
            return;
        }

        /* Conferir a senha do cliente */
        if (cliente.senha !== senhaDigitada) {
            alert("Senha incorreta. Confira sua senha e tente novamente.");
            return;
        }

        /* Limpar o campo de senha após o acesso */
        campoSenha.value = "";

        /* Garantir os dados dos clientes antigos */
        cliente.pontos = Number(cliente.pontos) || 0;

        cliente.pedidosConcluidos =
            Number(cliente.pedidosConcluidos) || 0;

        cliente.pedidosContabilizados =
            Array.isArray(cliente.pedidosContabilizados)
                ? cliente.pedidosContabilizados
                : [];

        /* Preparar a lista de cupons do cliente */
        cliente.cuponsFidelidade = Array.isArray(cliente.cuponsFidelidade)
            ? cliente.cuponsFidelidade
            : [];

        /* Buscar a área dos cupons */
        const areaCupons = document.getElementById("areaCuponsFidelidade");
        const listaCupons = document.getElementById("listaCuponsFidelidade");

        /* Limpar a lista antes de atualizar */
        listaCupons.innerHTML = "";

        /* Mostrar ou esconder a área conforme os cupons existentes */
        areaCupons.style.display =
            cliente.cuponsFidelidade.length > 0 ? "block" : "none";

        /* Criar um cartão para cada cupom */
        cliente.cuponsFidelidade.forEach(function (cupom) {

            const cartao = document.createElement("div");
            cartao.classList.add("cupom_fidelidade");

            if (cupom.utilizado) {
                cartao.classList.add("utilizado");
            }

            const codigo = document.createElement("p");
            codigo.classList.add("codigo_cupom_fidelidade");
            codigo.textContent = cupom.codigo;

            const status = document.createElement("span");
            status.classList.add("status_cupom_fidelidade");

            status.textContent = cupom.utilizado
                ? "Utilizado"
                : "Disponível";

            cartao.appendChild(codigo);
            cartao.appendChild(status);

            /* Criar botão para copiar o cupom */
            if (!cupom.utilizado) {

                const botaoCopiar = document.createElement("button");

                botaoCopiar.type = "button";
                botaoCopiar.classList.add("botao_copiar_cupom");
                botaoCopiar.textContent = "Copiar código";

                botaoCopiar.addEventListener("click", async function () {

                    try {

                        await navigator.clipboard.writeText(cupom.codigo);

                        botaoCopiar.textContent = "Copiado!";

                        setTimeout(function () {
                            botaoCopiar.textContent = "Copiar código";
                        }, 2000);

                    } catch (erro) {

                        alert("Não foi possível copiar automaticamente. Código: " + cupom.codigo);

                    }

                });

                cartao.appendChild(botaoCopiar);
            }

            listaCupons.appendChild(cartao);
        });

        /* Atualizar os dados salvos */
        localStorage.setItem(
            "clientesRaizesNordeste",
            JSON.stringify(clientes)
        );

        /* Mostrar pedidos concluídos */
        document.getElementById("totalPedidosFidelidade").textContent =
            cliente.pedidosConcluidos;

        /* Mostrar o progresso para a próxima recompensa */
        const pontosExibidos = cliente.pontos % 10;

        document.getElementById("pontosFidelidade").textContent =
            pontosExibidos;

        /* Atualizar casinhas de progresso */
        const casinhasPontos = document.querySelectorAll(
            "#barraPontosFidelidade .casinha_ponto"
        );

        casinhasPontos.forEach(function (casinha, indice) {

            if (indice < pontosExibidos) {
                casinha.classList.add("preenchido");
            } else {
                casinha.classList.remove("preenchido");
            }

        });

        /* Atualizar acessibilidade do progresso */
        document.getElementById("barraPontosFidelidade")
            .setAttribute("aria-valuenow", pontosExibidos);

        /* Atualizar mensagens da fidelidade */
        const mensagemPontos = document.getElementById("mensagemPontosFidelidade");
        const avisoFidelidade = document.getElementById("avisoFidelidade");

        /* Mensagem abaixo das casinhas */
        if (pontosExibidos === 0 && cliente.pontos > 0) {
            mensagemPontos.textContent =
                "Parabéns, você conquistou a sua recompensa! Continue acumulando pontos para o próximo cupom!";
        } else {
            mensagemPontos.textContent =
                "Faltam " + (10 - pontosExibidos) +
                " pontos para você ganhar um cupom de 50% de desconto!";
        }

        /* Aviso para quem ainda não realizou pedidos */
        if (cliente.pedidosConcluidos === 0) {
            avisoFidelidade.style.display = "flex";
        } else {
            avisoFidelidade.style.display = "none";
        }

        telaAcessoFidelidade.style.display = "none";
        telaFidelidade.style.display = "flex";
    });
}


/* POLÍTICA DE PRIVACIDADE */
const botaoAbrirPolitica = document.getElementById(
    "abrirPoliticaPrivacidade"
);

const janelaPolitica = document.getElementById(
    "janelaPoliticaPrivacidade"
);

const botaoFecharPolitica = document.getElementById(
    "fecharPoliticaPrivacidade"
);

const botaoEntendiPolitica = document.getElementById(
    "entendiPolitica"
);

function abrirJanelaPolitica() {

    janelaPolitica.classList.add("aberto");

    janelaPolitica.setAttribute("aria-hidden", "false");

    botaoFecharPolitica.focus();
}

function fecharJanelaPolitica() {

    janelaPolitica.classList.remove("aberto");

    janelaPolitica.setAttribute("aria-hidden", "true");

    botaoAbrirPolitica.focus();
}

/* Abrir */
botaoAbrirPolitica.addEventListener(
    "click",
    abrirJanelaPolitica
);

/* Fechar no X */
botaoFecharPolitica.addEventListener(
    "click",
    fecharJanelaPolitica
);

/* Fechar no botão entendi */
botaoEntendiPolitica.addEventListener(
    "click",
    fecharJanelaPolitica
);

/* Fechar ao clicar fora */
janelaPolitica.addEventListener("click", function(event) {

    if (event.target === janelaPolitica) {
        fecharJanelaPolitica();
    }

});

/* Fechar com esc */
document.addEventListener("keydown", function(event) {

    if (
        event.key === "Escape" &&
        janelaPolitica.classList.contains("aberto")
    ) {
        fecharJanelaPolitica();
    }

});