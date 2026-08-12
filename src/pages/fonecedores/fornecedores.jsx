// Esse arquivo contem um codigo de uma pagina para a alimentação do estoque sem estilização 
// Um cod base que faz integração com api do protype-erp 


import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"


function estoque() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [activeProdutos, setActiveProdutos] = useState("list");
    const [products, setProducts] = useState([])

    const [nomeFucio, setFuncionario] = useState("")
    const [fornecedorA, setFornecedorA] = useState([]);
    const [produtoAberto, setProdutoAberto] = useState("")

    const navigate = useNavigate()
    var token = localStorage.getItem("token")

    // constantes de confimação para adicionar produtos(MODAL)
    const [showModal, setShowModal] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [quantidade, setQuantidade] = useState(1);
    const [prodAdicionados, setProdAdic] = useState([])

    //constantes para a criação de produtos
    const [nome, setNome] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [modelagem, setModelagem] = useState("");
    const [cor, setCor] = useState("");
    const [precoCusto, setPrecoCusto] = useState("");
    const [precoVenda, setPrecoVenda] = useState("");
    const [telefone, setTelefone] = useState("");
    const [fornecedor, setFornecedor] = useState("");

    //constants para realizar os ajustes de um produto 
    const [prodAberto, setAbrirProd] = useState(null);
    const [nomeProduto, setNomeProduto] = useState("");

    //cosntande para barra de pesquisa
    const [pesquisa, setPesquisa] = useState("");

    //constates para os filtros no modal
    const [showFiltro, setShowFiltro] = useState(false);

    const [filtroAtivo, setFiltroAtivo] = useState(true);
    const [filtroNaoAtivo, setFiltroNaoAtivo] = useState(true);

    const [estoqueMin, setEstoqueMin] = useState("");
    const [estoqueMax, setEstoqueMax] = useState("");

    const [precoMin, setPrecoMin] = useState("");
    const [precoMax, setPrecoMax] = useState("");

    const [filtroNome, setFiltroNome] = useState("");
    const [filtroCnpj, setFiltroCnpj] = useState("");
    const [filtroEmail, setFiltroEmail] = useState("");
    const [filtroTelefone, setFiltroTelefone] = useState("");

    const [fornecedores, setFornecedores] = useState([]);

    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");

    //modal de confirmação
    const [showConfirm, setshowConfirm] = useState(false)
    const [loadingConfirm, setLoadingConfirm] = useState(false);


    // Puxa uma lista dos produtos e garda niam lista
    async function LoadProdutos() {
        try {

            const resposta = await axios.get(
                `${API_URL}/order/buscar`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const products = resposta.data.map((p) => {

                return {

                    // =========================
                    // IDENTIFICAÇÃO
                    // =========================

                    id: p.id,

                    nome: p.nome_peca ?? "Produto sem nome",

                    sku: p.sku ?? "Não informado",

                    tamanho: p.tamanho ?? "Não informado",

                    cor: p.cor ?? "Não informada",

                    modelagem:
                        p.modelagem ?? "Não informada",


                    // =========================
                    // ESTOQUE
                    // =========================

                    estoqueInicial:
                        p.estoqueInicial ?? 0,

                    reestoque:
                        p.reestoque ?? 0,

                    vendas:
                        p.vendas ?? 0,

                    estoque:
                        p.estoqueAtual ??
                        p.estoqueInicial ??
                        0,


                    // =========================
                    // PREÇOS
                    // =========================

                    precoCusto:
                        p.preco_custo ?? 0,

                    preco:
                        p.preco_venda ?? 0,


                    // =========================
                    // FORNECEDOR
                    // =========================

                    fornecedor:
                        p.fornecedor_id ?? "Não informado",


                    // =========================
                    // STATUS
                    // =========================

                    status:
                        p.status
                            ? "Ativo"
                            : "Não Ativo",


                    // =========================
                    // DATAS
                    // =========================

                    data: p.created_at
                        ? new Date(
                            p.created_at
                        ).toLocaleDateString("pt-BR")
                        : "Não informada",

                    created_at:
                        p.created_at ?? null,

                    updated_at:
                        p.updated_at ?? null,
                };
            });

            setProducts(products);

        } catch (err) {

            console.error(err);

            if (err.response?.status === 401) {

                navigate("/login");

            } else {

                alert("Erro ao carregar produtos.");

            }
        }
    }

    //Fução que carrega o usuario logado
    async function LoadFornecedores() {
        try {
            const resposta = await axios.get(
                `${API_URL}/order/listar-fornecedores`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const fornecedores = resposta.data
            console.log(fornecedores)
            setFornecedorA(fornecedores)
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }


    //Fução que carrega o usuario logado
    async function LoadUsuario() {
        try {
            const resposta = await axios.get(
                `${API_URL}/auth/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const nomeFuncionario = resposta.data
            setFuncionario(nomeFuncionario)
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }



    // entrda de estoque
    async function CriarFornecedor() {

        try {

            await axios.post(
                `${API_URL}/order/criar-fornecedor`,
                {
                    nome: nome,
                    cnpj: cnpj,
                    telefone: telefone,
                    email: email,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Produto cadastrado com sucesso!");

            // Opcional: recarregar a lista de produtos
            LoadProdutos();

        } catch (err) {

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            alert("Erro ao cadastrar produto.");
        }

    }



    async function AjustarEstoque(nome, cod, precoCusto, precoVenda) {

        try {

            await axios.put(
                `${API_URL}/order/ajustar-estoque`,
                {
                    nome_produto: nome,
                    codigo_barras: cod,
                    preco_custo: precoCusto,
                    preco_venda: precoVenda
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Produto ajustado com sucesso!");

        } catch (err) {

            if (err.response?.status === 401) {
                navigate("/login");
            }

            alert("Erro ao ajustar produto.");
        }

    }


    function RemoverProduto(idProduto) {
        setProdAdic(
            prodAdicionados.filter(produto => produto.id !== idProduto)
        );
    }



    useEffect(() => {
        LoadProdutos()
        LoadFornecedores()
    }, [])


    // const vendas = [
    //     {
    //         id: 15,
    //         funcionario: 1,
    //         cliente: 8,
    //         valor: 45.90,
    //         itens: 3,
    //         status: "PENDENTE",
    //         data: "18/06/2026",
    //     },
    // ];


    const produtorios = products.map((mov) => ({
        ...mov,

        nome_fornecedor: fornecedorA.find(
            (fornecedor) => fornecedor.id === mov.fornecedor
        )?.nome || "Usuário não encontrado",
    }));

    //ABAIXO SÃO OS FILTROS DE BUSCA DA BARRA DE PESQUISA E DO MODAL
    const fornecedoresFiltrados = fornecedores.filter((fornecedor) => {

        // ======================
        // PESQUISA
        // ======================

        const texto = pesquisa.toLowerCase();

        const passouPesquisa =
            String(fornecedor.id).includes(texto) ||
            fornecedor.nome?.toLowerCase().includes(texto) ||
            fornecedor.telefone?.toLowerCase().includes(texto) ||
            fornecedor.endereco?.toLowerCase().includes(texto) ||
            fornecedor.cnpj?.toLowerCase().includes(texto) ||
            fornecedor.email?.toLowerCase().includes(texto);

        if (!passouPesquisa) {
            return false;
        }

        // ======================
        // NOME
        // ======================

        if (
            filtroNome !== "" &&
            !fornecedor.nome
                ?.toLowerCase()
                .includes(filtroNome.toLowerCase())
        ) {
            return false;
        }

        // ======================
        // CNPJ
        // ======================

        if (
            filtroCnpj !== "" &&
            !fornecedor.cnpj
                ?.toLowerCase()
                .includes(filtroCnpj.toLowerCase())
        ) {
            return false;
        }

        // ======================
        // EMAIL
        // ======================

        if (
            filtroEmail !== "" &&
            !fornecedor.email
                ?.toLowerCase()
                .includes(filtroEmail.toLowerCase())
        ) {
            return false;
        }

        // ======================
        // TELEFONE
        // ======================

        if (
            filtroTelefone !== "" &&
            !fornecedor.telefone
                ?.toLowerCase()
                .includes(filtroTelefone.toLowerCase())
        ) {
            return false;
        }

        // ======================
        // PERÍODO
        // ======================

        if (
            dataInicial &&
            fornecedor.created_at.slice(0, 10) < dataInicial
        ) {
            return false;
        }

        if (
            dataFinal &&
            fornecedor.created_at.slice(0, 10) > dataFinal
        ) {
            return false;
        }

        return true;
    });



    const produtosFiltrados = produtorios
        .filter((produto) => {

            // ======================
            // PESQUISA
            // ======================

            const texto = pesquisa.toLowerCase();

            const passouPesquisa =
                produto.nome.toLowerCase().includes(texto) ||
                produto.sku.toLowerCase().includes(texto) ||
                produto.cor.toLowerCase().includes(texto) ||
                produto.tamanho.toLowerCase().includes(texto) ||
                produto.modelagem.toLowerCase().includes(texto) ||
                produto.id.toString().includes(texto);

            if (!passouPesquisa) return false;

            // ======================
            // STATUS
            // ======================

            if (!filtroAtivo && produto.status === "Ativo")
                return false;

            if (!filtroNaoAtivo && produto.status === "Não Ativo")
                return false;

            // ======================
            // ESTOQUE
            // ======================

            if (estoqueMin !== "" && produto.estoque < Number(estoqueMin))
                return false;

            if (estoqueMax !== "" && produto.estoque > Number(estoqueMax))
                return false;

            // ======================
            // PREÇO
            // ======================

            if (precoMin !== "" && produto.preco < Number(precoMin))
                return false;

            if (precoMax !== "" && produto.preco > Number(precoMax))
                return false;

            return true;
        })
        .sort((a, b) => a.id - b.id);


    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeProdutos) {
            case "list":
                return (
                    <div>

                        {/* =========================
                CABEÇALHO
            ========================= */}

                        <div className="mb-6">

                            <h1 className="text-2xl font-bold text-gray-800">
                                Fornecedores
                            </h1>

                            <p className="text-gray-500 mt-1">
                                Gerencie todos os fornecedores cadastrados no sistema.
                            </p>

                        </div>


                        {/* =========================
                TABELA
            ========================= */}

                        <div
                            className="rounded-xl overflow-hidden shadow-sm"
                            style={{
                                background: "#ffffff",
                                border: "1px solid #d9d9d9",
                            }}
                        >

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    {/* =========================
                            CABEÇALHO
                        ========================= */}

                                    <thead>

                                        <tr
                                            style={{
                                                background: "#f6f6f6",
                                                borderBottom: "1px solid #d9d9d9",
                                            }}
                                        >

                                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                                                ID
                                            </th>

                                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                                                Nome
                                            </th>

                                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                                                Telefone
                                            </th>

                                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                                                CNPJ
                                            </th>

                                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                                                E-mail
                                            </th>

                                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                                                Endereço
                                            </th>

                                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                                                Data
                                            </th>

                                        </tr>

                                    </thead>


                                    {/* =========================
                            CORPO
                        ========================= */}

                                    <tbody>

                                        {fornecedoresFiltrados.length > 0 ? (

                                            fornecedoresFiltrados.map((fornecedor, index) => {

                                                return (

                                                    <tr
                                                        key={fornecedor.id}

                                                        onClick={() => {

                                                            // Se quiser abrir o fornecedor:
                                                            setAbrirFornecedor(fornecedor);

                                                        }}

                                                        className="
                                                cursor-pointer
                                                transition-colors
                                                hover:bg-red-50
                                            "

                                                        style={{
                                                            background:
                                                                index % 2 === 0
                                                                    ? "#ffffff"
                                                                    : "#fafafa",

                                                            borderBottom:
                                                                "1px solid #ececec",
                                                        }}
                                                    >

                                                        {/* ID */}

                                                        <td className="px-4 py-3 font-medium text-gray-700">
                                                            #{fornecedor.id}
                                                        </td>


                                                        {/* NOME */}

                                                        <td className="px-4 py-3 text-gray-800 font-medium">
                                                            {fornecedor.nome}
                                                        </td>


                                                        {/* TELEFONE */}

                                                        <td className="px-4 py-3 text-gray-600">
                                                            {fornecedor.telefone}
                                                        </td>


                                                        {/* CNPJ */}

                                                        <td className="px-4 py-3 text-gray-600">
                                                            {fornecedor.cnpj}
                                                        </td>


                                                        {/* EMAIL */}

                                                        <td className="px-4 py-3 text-gray-600">
                                                            {fornecedor.email}
                                                        </td>


                                                        {/* ENDEREÇO */}

                                                        <td className="px-4 py-3 text-gray-600">
                                                            {fornecedor.endereco || "—"}
                                                        </td>


                                                        {/* DATA */}

                                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">

                                                            {fornecedor.created_at
                                                                ? new Date(
                                                                    fornecedor.created_at
                                                                ).toLocaleDateString(
                                                                    "pt-BR"
                                                                )
                                                                : "—"
                                                            }

                                                        </td>

                                                    </tr>

                                                );

                                            })

                                        ) : (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="px-4 py-10 text-center text-gray-500"
                                                >
                                                    Nenhum fornecedor encontrado.
                                                </td>

                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* =========================
                RODAPÉ
            ========================= */}

                        <div className="flex justify-between items-center mt-4">

                            <span className="text-sm text-gray-500">

                                {fornecedoresFiltrados.length} fornecedor
                                {fornecedoresFiltrados.length !== 1
                                    ? "es"
                                    : ""}

                                {" "}encontrado
                                {fornecedoresFiltrados.length !== 1
                                    ? "s"
                                    : ""}

                            </span>

                        </div>

                    </div>
                );



            case "new":
                return (
                    <div
                        className="min-h-screen py-10 px-8"
                        style={{
                            background: "#f5f5f5",
                        }}
                    >
                        <div
                            className="max-w-5xl mx-auto rounded-2xl shadow-xl p-8"
                            style={{
                                background: "#ffffff",
                            }}
                        >
                            {/* Cabeçalho */}
                            <div className="flex justify-between items-center mb-8">

                                <div>
                                    <h1
                                        className="text-3xl font-bold"
                                        style={{ color: "#202020" }}
                                    >
                                        Cadastro de Fornecedores
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#6b7280" }}
                                    >
                                        Preencha as informações para cadastrar um novo fornecedor.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setActiveProdutos("list");
                                    }}
                                    className="px-5 py-2 rounded-lg font-semibold transition"
                                    style={{
                                        background: "#4b5563",
                                        color: "white",
                                    }}
                                >
                                    Voltar
                                </button>

                            </div>

                            {/* Formulário */}

                            <div className="grid grid-cols-2 gap-6">

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Nome do fornecedor
                                    </label>

                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        className="w-full rounded-xl border px-4 py-3 outline-none transition"
                                        style={{
                                            borderColor: "#d1d5db",
                                            background: "#fafafa",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        CNPJ
                                    </label>

                                    <input
                                        type="text"
                                        value={cnpj}
                                        onChange={(e) => setCnpj(e.target.value)}
                                        className="w-full rounded-xl border px-4 py-3 outline-none"
                                        style={{
                                            borderColor: "#d1d5db",
                                            background: "#fafafa",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        E-mail
                                    </label>

                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border px-4 py-3 outline-none"
                                        style={{
                                            borderColor: "#d1d5db",
                                            background: "#fafafa",
                                        }}
                                    />
                                </div>



                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Telefone para Contato
                                    </label>

                                    <input
                                        type="text"
                                        value={telefone}
                                        onChange={(e) => setTelefone(e.target.value)}
                                        className="w-full rounded-xl border px-4 py-3 outline-none"
                                        style={{
                                            borderColor: "#d1d5db",
                                            background: "#fafafa",
                                        }}
                                    />
                                </div>



                            </div>

                            {/* Botões */}

                            <div className="flex justify-end gap-4 mt-10">

                                <button
                                    onClick={() => {
                                        setActiveProdutos("list");
                                    }}
                                    className="px-6 py-3 rounded-xl font-semibold transition"
                                    style={{
                                        background: "#6b7280",
                                        color: "white",
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={() => {
                                        setshowConfirm(true);
                                    }}
                                    className="px-8 py-3 rounded-xl font-semibold transition"
                                    style={{
                                        background: "#7f1d1d",
                                        color: "white",
                                    }}
                                >
                                    Cadastrar Fornecedor
                                </button>

                            </div>

                            {/* Modal */}

                            {showConfirm && (

                                <div
                                    style={{
                                        position: "fixed",
                                        inset: 0,
                                        background: "rgba(0,0,0,.55)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 1000,
                                    }}
                                >

                                    <div
                                        className="rounded-2xl shadow-2xl p-8"
                                        style={{
                                            width: "420px",
                                            background: "white",
                                        }}
                                    >

                                        {loadingConfirm ? (

                                            <div className="flex flex-col items-center py-8">

                                                <div
                                                    className="w-14 h-14 rounded-full border-4 animate-spin"
                                                    style={{
                                                        borderColor: "#e5e7eb",
                                                        borderTopColor: "#7f1d1d",
                                                    }}
                                                />

                                                <p
                                                    className="mt-5 font-medium"
                                                    style={{
                                                        color: "#4b5563",
                                                    }}
                                                >
                                                    Cadastrando fornecedor...
                                                </p>

                                            </div>

                                        ) : (

                                            <>

                                                <h2
                                                    className="text-2xl font-bold text-center mb-2"
                                                    style={{
                                                        color: "#202020",
                                                    }}
                                                >
                                                    Confirmar cadastro
                                                </h2>

                                                <p
                                                    className="text-center mb-8"
                                                    style={{
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    Deseja realmente cadastrar este fornecedor?
                                                </p>

                                                <div className="flex justify-end gap-4">

                                                    <button
                                                        onClick={() => setshowConfirm(false)}
                                                        className="px-5 py-2 rounded-lg font-semibold"
                                                        style={{
                                                            background: "#e5e7eb",
                                                            color: "#374151",
                                                        }}
                                                    >
                                                        Cancelar
                                                    </button>

                                                    <button
                                                        onClick={async () => {

                                                            setLoadingConfirm(true);

                                                            await CriarFornecedor();

                                                            setLoadingConfirm(false);

                                                            setshowConfirm(false);

                                                        }}
                                                        className="px-6 py-2 rounded-lg font-semibold"
                                                        style={{
                                                            background: "#7f1d1d",
                                                            color: "white",
                                                        }}
                                                    >
                                                        Continuar
                                                    </button>

                                                </div>

                                            </>

                                        )}

                                    </div>

                                </div>

                            )}

                        </div>
                    </div>
                );


            case "ajustar":

                return (

                    <div>

                        <button
                            onClick={() => {
                                setActiveProdutos("list");
                                LoadProdutos();
                                LoadFornecedores();
                            }}
                        >
                            Voltar
                        </button>

                        <h1>Ajustar Produto</h1>

                        <p>ID</p>

                        <input
                            value={prodAberto.id}
                            disabled
                        />

                        <p>Código de barras</p>

                        <input
                            value={prodAberto.cod}
                            disabled
                        />

                        <p>Nome</p>

                        <input
                            value={nomeProduto}
                            onChange={(e) => setNomeProduto(e.target.value)}
                        />

                        <p>Preço de custo</p>

                        <input
                            type="number"
                            value={precoCusto}
                            onChange={(e) => setCusto(e.target.value)}
                        />

                        <p>Preço de venda</p>

                        <input
                            type="number"
                            value={precoVenda}
                            onChange={(e) => setVenda(e.target.value)}
                        />

                        <button
                            onClick={async () => {

                                await AjustarEstoque(

                                    nomeProduto,
                                    prodAberto.cod,
                                    Number(precoCusto),
                                    Number(precoVenda)

                                );

                                LoadProdutos();
                                LoadFornecedores();
                                setActiveProdutos("list");

                            }}
                        >
                            Finalizar
                        </button>

                    </div>

                );



            default:
                return (
                    <h1>Página não encontrada</h1>
                )
        }
    }


    // // Aqui vai retornar uma pagina main que abre outras paginas
    // return (
    //     <div>
    //         <button
    //             onClick={() => {
    //                 setActiveVendas("new");
    //                 LoadProdutos();
    //                 LoadUsuario();
    //             }}
    //             style={{
    //                 border: "1px solid black",
    //                 padding: "10px",
    //                 backgroundColor: "#ddd",
    //                 cursor: "pointer"
    //             }}
    //         >
    //             Novo
    //         </button>
    //         <h1>Vendas</h1>
    //         {renderContent()}
    //     </div>
    // );

    return (
        <div
            className="min-h-screen"
            style={{
                background: "#f5f5f5",
                color: "#1f1f1f",
            }}
        >
            {/* TOOLBAR */}
            <div
                className="flex items-center gap-4 px-6 py-4"
                style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #d4d4d4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
            >
                {/* Botão Novo */}
                <button
                    onClick={() => {
                        setActiveProdutos("new");
                        LoadProdutos();
                        LoadFornecedores();
                        LoadUsuario();
                    }}
                    className="px-4 py-2 rounded-md font-semibold text-white transition-all"
                    style={{
                        background: "#6b1f2b",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#581822";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#6b1f2b";
                    }}
                >
                    + Novo
                </button>

                {/* Título */}
                <h1
                    style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: "600",
                        color: "#222",
                    }}
                >
                    Produtos
                </h1>

                {/* Busca */}
                <div
                    className="ml-6"
                    style={{
                        flex: 1,
                        maxWidth: "500px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #cfcfcf",
                            background: "#f8f8f8",
                            color: "#222",
                            outline: "none",
                        }}
                    />
                </div>

                {/* Botão filtros */}
                <button
                    onClick={() => setShowFiltro(true)}
                    style={{
                        marginLeft: "10px",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: "1px solid #cfcfcf",
                        background: "#f8f8f8",
                        color: "#333",
                        cursor: "pointer",
                        transition: ".2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ececec";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f8f8f8";
                    }}
                >
                    ⚙ Filtros
                </button>

                {/* Ícone Lista */}
                <div
                    style={{
                        marginLeft: "auto",
                        fontSize: "22px",
                        color: "#6b1f2b",
                        fontWeight: "bold",
                    }}
                >
                    ☰
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className="p-6">
                {renderContent()}


                {/* CRIA UM MODAL, JANELA FLUTANTE QUE TEM FILTROS PARA O ESTOQUE */}
                {
                    showFiltro && (

                        <div
                            style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(0,0,0,.45)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 1000
                            }}
                        >

                            <div
                                style={{
                                    width: "420px",
                                    background: "#1f2937",
                                    color: "white",
                                    borderRadius: "10px",
                                    padding: "20px",
                                    position: "relative"
                                }}
                            >

                                <button
                                    onClick={() => setShowFiltro(false)}
                                    style={{
                                        position: "absolute",
                                        right: 15,
                                        top: 10,
                                        background: "transparent",
                                        border: "none",
                                        color: "white",
                                        fontSize: "22px",
                                        cursor: "pointer"
                                    }}
                                >
                                    ×
                                </button>

                                <h2>Filtros</h2>

                                <hr />

                                {/* ====================== */}
                                {/* NOME */}
                                {/* ====================== */}

                                <p>Nome</p>

                                <input
                                    type="text"
                                    value={filtroNome}
                                    onChange={(e) => setFiltroNome(e.target.value)}
                                    placeholder="Nome do fornecedor"
                                    style={{ width: "100%" }}
                                />

                                {/* ====================== */}
                                {/* CNPJ */}
                                {/* ====================== */}

                                <p>CNPJ</p>

                                <input
                                    type="text"
                                    value={filtroCnpj}
                                    onChange={(e) => setFiltroCnpj(e.target.value)}
                                    placeholder="CNPJ"
                                    style={{ width: "100%" }}
                                />

                                {/* ====================== */}
                                {/* EMAIL */}
                                {/* ====================== */}

                                <p>Email</p>

                                <input
                                    type="text"
                                    value={filtroEmail}
                                    onChange={(e) => setFiltroEmail(e.target.value)}
                                    placeholder="Email"
                                    style={{ width: "100%" }}
                                />

                                {/* ====================== */}
                                {/* TELEFONE */}
                                {/* ====================== */}

                                <p>Telefone</p>

                                <input
                                    type="text"
                                    value={filtroTelefone}
                                    onChange={(e) => setFiltroTelefone(e.target.value)}
                                    placeholder="Telefone"
                                    style={{ width: "100%" }}
                                />

                                {/* ====================== */}
                                {/* PERÍODO */}
                                {/* ====================== */}

                                <p>Data inicial</p>

                                <input
                                    type="date"
                                    value={dataInicial}
                                    onChange={(e) => setDataInicial(e.target.value)}
                                    style={{ width: "100%" }}
                                />

                                <p>Data final</p>

                                <input
                                    type="date"
                                    value={dataFinal}
                                    onChange={(e) => setDataFinal(e.target.value)}
                                    style={{ width: "100%" }}
                                />

                                {/* ====================== */}
                                {/* BOTÕES */}
                                {/* ====================== */}

                                <div
                                    style={{
                                        marginTop: "20px",
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}
                                >

                                    <button
                                        onClick={() => {
                                            setFiltroNome("");
                                            setFiltroCnpj("");
                                            setFiltroEmail("");
                                            setFiltroTelefone("");
                                            setDataInicial("");
                                            setDataFinal("");
                                        }}
                                    >
                                        Limpar
                                    </button>

                                    <button
                                        onClick={() => setShowFiltro(false)}
                                    >
                                        Aplicar
                                    </button>

                                </div>

                            </div>

                        </div>

                    )
                }


            </div>
        </div>
    );
}

export default estoque;