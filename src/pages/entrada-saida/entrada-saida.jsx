// await axios.get(
//     "${API_URL}/registration/buscar-periodo",
//     {
//         params: {
//             data_inicial,
//             data_final
//         }
//     }
// );


// // GET /buscar-periodo?data_inicial=2026-07-01&data_final=2026-07-31


// Esse arquivo contem um codigo de uma pagina para a alimentação do estoque sem estilização 
// Um cod base que faz integração com api do protype-erp 


import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from "recharts";


function registros() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [activeProdutos, setActiveProdutos] = useState("list");
    const [products, setProducts] = useState([])
    const [movimentacoes, setMovimentacoes] = useState([])
    const [usuarios, setUsers] = useState([])

    const [nomeFucio, setFuncionario] = useState("")
    const [produtoAberto, setProdutoAberto] = useState("")

    const [itensVenda, setItemVenda] = useState([])
    const [itensDrop, setItemDrop] = useState([])

    const navigate = useNavigate()
    var token = localStorage.getItem("token")

    // constantes de confimação para adicionar produtos(MODAL)
    const [showModal, setShowModal] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [prodAdicionados, setProdAdic] = useState([])

    //constantes para a criação de produtos
    const [nome, setNameProduto] = useState("")
    const [codigoBarras, setCodigo] = useState("")
    const [precoCusto, setCusto] = useState("")
    const [precoVenda, setVenda] = useState("")
    const [estoque, setEstoque] = useState("")

    //constants para realizar os ajustes de um produto 
    const [prodAberto, setAbrirProd] = useState(null);
    const [nomeProduto, setNomeProduto] = useState("");

    //cosntande para barra de pesquisa
    const [pesquisa, setPesquisa] = useState("");

    //constates para os filtros no modal
    const [showFiltro, setShowFiltro] = useState(false);
    const [filtroUsuario, setFiltroUsuario] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");

    const [valorMin, setValorMin] = useState("");
    const [valorMax, setValorMax] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [quantidadeMin, setQuantidadeMin] = useState("");
    const [quantidadeMax, setQuantidadeMax] = useState("");

    const [filtroVencimento, setFiltroVencimento] = useState("");
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");
    const [filtroMovimento, setFiltroMovimento] = useState("");

    //modal de confirmação
    const [showConfirm, setshowConfirm] = useState(false)
    const [loadingConfirm, setLoadingConfirm] = useState(false);

    //constantes para a criação de custos
    const [tipo, setTipo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [quantidade, setQuantidade] = useState(0);
    const [valor, setValor] = useState(0);
    const [status, setStatus] = useState(null);
    const [vencimento, setVencimento] = useState("");
    const [quantParcelas, setQuantParcelas] = useState(1);

    //const para mostrar descrição usando o mouse hover
    const [hoverRegistro, setHoverRegistro] = useState(null);
    const [mousePos, setMousePos] = useState({
        x: 0,
        y: 0
    });

    const [viewModeGrafico, setViewModeGrafico] = useState("DIAS");
    //hvjgszhbskbj

    const [vendaSelecionada, setVendaSelecionada] = useState(null);
    const [dropSelecionado, setDropSelecionado] = useState(null);

    const [tipoModal, setTipoModal] = useState(null);

    //estilos criados para a tabela de registros, para não precisar ficar repetindo o mesmo estilo em cada td e th
    const thStyle = {
        padding: "14px",
        textAlign: "left",
        color: "#555",
        fontSize: "13px",
        fontWeight: "700",
        borderBottom: "2px solid #e5e5e5",
    };

    const tdStyle = {
        padding: "14px",
        color: "#444",
        fontSize: "14px",
    };


    const statusNormalizado = (status) => {
        if (
            status === true ||
            status === "true" ||
            status === "PAGO"
        ) {
            return "PAGO";
        }

        if (
            status === false ||
            status === "false" ||
            status === "NAOPAGO"
        ) {
            return "NAOPAGO";
        }

        return "PENDENTE";
    };

    // Função que pega todas as movimentações
    async function LoadMovimentacoes() {
        try {
            const resposta = await axios.get(
                `${API_URL}/registrations/buscar-registros`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const movimentacoes = resposta.data.map((m) => ({
                id: m.id,
                descricao: m.descricao,
                quantidade: m.quantidade,

                // Data original (usar nos filtros)
                vencimento: m.vencimento,

                // Data formatada (usar na tabela)
                vencimentoFormatado: new Date(m.vencimento).toLocaleDateString("pt-BR"),

                usuario_id: m.usuario_id,
                tipo: m.tipo,
                valor: Number(m.valor),
                status: statusNormalizado(m.status),

                created_at: m.created_at,
                created_atFormatado: new Date(m.created_at).toLocaleDateString("pt-BR"),
            }));

            setMovimentacoes(movimentacoes);
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                navigate("/login");
            } else {
                alert("Erro ao carregar as movimentações.");
            }
        }
    }

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

            const products = resposta.data.map((p) => ({
                id: p.id,
                nome: p.nome_peca,
                sku: p.sku,
                tamanho: p.tamanho,
                modelagem: p.modelagem,
                cor: p.cor,
                estoque: p.estoque,
                precoCusto: p.preco_custo,
                preco: p.preco_venda,
                status: p.status ? "Ativo" : "Não Ativo",
                data: new Date(p.created_at).toLocaleDateString("pt-BR"),
            }));

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

    // Registrar novo custo
    async function CriarCusto() {

        try {

            await axios.post(
                `${API_URL}/order/registrar-custo`,
                {
                    tipo: tipo,
                    descricao: descricao,
                    quantidade: Number(quantidade),
                    valor: Number(valor),
                    status: status,
                    vencimento: vencimento,
                    quant_parcelas: Number(quantParcelas)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            alert("Custo cadastrado com sucesso!");


            // Recarregar lista de custos
            LoadMovimentacoes();


        } catch (err) {


            if (err.response?.status === 401) {

                navigate("/login");
                return;

            }


            console.error(err);

            alert("Erro ao cadastrar custo.");

        }

    }


    // Puxa uma lista dos usuarios e guarda numa lista
    async function LoadUsers() {
        try {
            const resposta = await axios.get(
                `${API_URL}/auth/listar-user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const users = resposta.data.map((p) => ({ //percorre todos os elementos e cria um novo array transformando cada item
                nome: p.nome,
                cargo: p.cargo,
                user: p.user,
                id: p.id,
                status: p.ativo ? "Ativo" : "Não Ativo",
                data: new Date(
                    p.created_at
                ).toLocaleDateString("pt-BR"),

            }));

            setUsers(users);
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

    //Fução que da busca uma Venda por id
    async function BuscarVenda(id_Venda) {
        try {
            const resposta = await axios.get(
                `${API_URL}/sales/buscar-venda/${id_Venda}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const VendaAtual = resposta.data
            // cria uma cosnt da Venda atual e manda essa vend para 
            setVendaSelecionada(VendaAtual);
            await LoadProdInVenda(VendaAtual.id);
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    async function LoadProdInVenda(id_Venda) {
        try {
            const resposta = await axios.get(
                `${API_URL}/sales/buscar-itens/${id_Venda}`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const itens = resposta.data
            setItemVenda(itens);


        } catch (err) {
            if (err.response?.status !== 404) {
                alert(err)
            }

            if (err.response?.status === 401) {
                navigate("/login")
            } else if (err.response?.status === 404) {
                const itens = [
                    {
                        "id": 0,
                        "quantidade": 0,
                        "subtotal": 0,
                        "produto_id": 0,
                        "Venda_id": 0,
                        "preco_unitario": 0
                    }
                ]
                setItemVenda(itens);
            }
        }
    }

    //Fução que da busca uma Drop por id
    async function BuscarDrop(id_Drop) {
        try {
            const resposta = await axios.get(
                `${API_URL}/order/buscar-drop/${id_Drop}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const DropAtual = resposta.data
            // cria uma cosnt da Drop atual e manda essa vend para verificação
            setDropSelecionado(DropAtual);
            LoadProdInDrop(DropAtual.id);
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    async function LoadProdInDrop(id_Drop) {
        try {
            const resposta = await axios.get(
                `${API_URL}/order/buscar-itens/${id_Drop}`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const itens = resposta.data
            setItemDrop(itens);


        } catch (err) {
            if (err.response?.status !== 404) {
                alert(err)
            }

            if (err.response?.status === 401) {
                navigate("/login")
            } else if (err.response?.status === 404) {
                const itens = [
                    {
                        "id": 0,
                        "quantidade": 0,
                        "subtotal": 0,
                        "produto_id": 0,
                        "Drop_id": 0,
                        "preco_unitario": 0
                    }
                ]
                setItemDrop(itens);
            }
        }
    }




    function RemoverProduto(idProduto) {
        setProdAdic(
            prodAdicionados.filter(produto => produto.id !== idProduto)
        );
    }




    //cria uma constante de registros 
    const registros = movimentacoes.map((mov) => ({
        ...mov,

        nome_produto: products.find(
            (produto) => produto.id === mov.produto_id
        )?.nome || "Produto não encontrado",

        nome_usuario: usuarios.find(
            (usuario) => usuario.id === mov.usuario_id
        )?.nome || "Usuário não encontrado",

        // =========================
        // VALOR TOTAL
        // =========================

        valorTotal:
            Number(mov.quantidade ?? 0) *
            Number(mov.valor ?? 0),

        // =========================
        // MOVIMENTO FINANCEIRO
        // =========================

        movimentoFinanceiro:
            mov.tipo === "VENDA FINALIZADO"
                ? "ENTRADA"
                : "SAIDA",
    }));


    useEffect(() => {
        LoadProdutos()
        LoadMovimentacoes()
        LoadUsers()
    }, [])


    // [
    //     {
    //         id: 20,
    //         produto_id: 7,
    //         usuario_id: 3,
    //         tipo: "CRIACAO",
    //         quantidade: 50,
    //         precoVenda: 13.99,
    //         precoCusto: 4.5,
    //         estoqueAnterior: 0,
    //         estoqueDepois: 50,
    //         data: "05/06/2026",

    //         nome_produto: "Arroz",
    //         nome_usuario: "Guilherme"
    //     },
    //     ...
    // ]

    // Cria uma lista de tipos de custos únicos a partir dos registros
    const tiposCustos = [
        ...new Set(movimentacoes.map((registro) => registro.tipo))
    ];

    // ABAIXO SÃO OS FILTROS DE BUSCA DA BARRA DE PESQUISA E DO MODAL
    const registrosFiltrados = registros.filter((registro) => {


        // Não mostrar custos pendentes
        if (registro.status === "PENDENTE") {
            return false;
        }

        // ======================
        // PESQUISA
        // ======================

        const texto = pesquisa.toLowerCase();

        const passouPesquisa =
            String(registro.id).includes(texto) ||
            registro.nome_usuario?.toLowerCase().includes(texto) ||
            registro.tipo?.toLowerCase().includes(texto);

        if (!passouPesquisa) return false;


        // ======================
        // NOME DO USUÁRIO
        // ======================

        if (
            filtroUsuario !== "" &&
            !registro.nome_usuario
                ?.toLowerCase()
                .includes(filtroUsuario.toLowerCase())
        ) {
            return false;
        }


        // ======================
        // TIPO DO CUSTO
        // ======================

        if (
            filtroTipo !== "" &&
            registro.tipo !== filtroTipo
        ) {
            return false;
        }

        // ======================
        // MOVIMENTO FINANCEIRO
        // ======================

        if (
            filtroMovimento !== "" &&
            registro.movimentoFinanceiro !== filtroMovimento
        ) {
            return false;
        }


        // ======================
        // VALOR
        // ======================

        if (
            valorMin !== "" &&
            registro.valor < Number(valorMin)
        ) {
            return false;
        }


        if (
            valorMax !== "" &&
            registro.valor > Number(valorMax)
        ) {
            return false;
        }


        // ======================
        // QUANTIDADE
        // ======================

        if (
            quantidadeMin !== "" &&
            registro.quantidade < Number(quantidadeMin)
        ) {
            return false;
        }


        if (
            quantidadeMax !== "" &&
            registro.quantidade > Number(quantidadeMax)
        ) {
            return false;
        }


        // ======================
        // STATUS
        // ======================

        if (
            filtroStatus !== "" &&
            registro.status !== filtroStatus
        ) {
            return false;
        }

        // ======================
        // PERÍODO DE VENCIMENTO
        // ======================

        if (dataInicial && registro.created_at < dataInicial) {
            return false;
        }

        if (dataFinal && registro.created_at > dataFinal) {
            return false;
        }


        return true;
    });


    //FUNÇÃO PARA CRIAR OS CARDS NO TOPO DA TELA
    const cards = useMemo(() => {
        let totalCustos = 0;
        let totalPago = 0;
        let totalPendente = 0;

        let vencidos = 0;
        let proximos = 0;

        const hoje = new Date();
        const seteDias = new Date();
        seteDias.setDate(hoje.getDate() + 7);

        registrosFiltrados.forEach((registro) => {
            const valor = Number(registro.valor);

            totalCustos += valor;

            if (registro.status === "PAGO") {
                totalPago += valor;
            } else {
                totalPendente += valor;

                const vencimento = new Date(
                    registro.vencimento.split("/").reverse().join("-")
                );

                if (vencimento < hoje) {
                    vencidos++;
                } else if (vencimento <= seteDias) {
                    proximos++;
                }
            }
        });

        return {
            totalCustos,
            totalPago,
            totalPendente,
            quantidade: registrosFiltrados.length,
            vencidos,
            proximos
        };
    }, [registrosFiltrados]);


    //função para agrupar os registros por semana, mês ou ano
    function AgruparPeriodo(registros, modo) {

        const grupos = {};

        registros.forEach((registro) => {

            const data = new Date(registro.created_at);

            let chave = "";
            let titulo = "";

            switch (modo) {
                case "DIAS": {

                    chave = data.toISOString().split("T")[0];

                    titulo = data.toLocaleDateString("pt-BR");

                    break;

                }

                case "SEMANAS": {

                    const inicioSemana = new Date(data);

                    inicioSemana.setDate(
                        data.getDate() - data.getDay()
                    );

                    inicioSemana.setHours(0, 0, 0, 0);

                    const fimSemana = new Date(inicioSemana);

                    fimSemana.setDate(
                        inicioSemana.getDate() + 6
                    );

                    chave = inicioSemana.toISOString();

                    titulo =
                        `${inicioSemana.toLocaleDateString("pt-BR")} - ${fimSemana.toLocaleDateString("pt-BR")}`;

                    break;

                }

                case "MESES": {

                    chave =
                        `${data.getFullYear()}-${data.getMonth()}`;

                    titulo =
                        data.toLocaleDateString(
                            "pt-BR",
                            {
                                month: "long",
                                year: "numeric"
                            }
                        );

                    break;

                }

                case "ANOS": {

                    chave =
                        String(data.getFullYear());

                    titulo =
                        String(data.getFullYear());

                    break;

                }

                default:
                    return;

            }

            if (!grupos[chave]) {

                grupos[chave] = {

                    periodo: titulo,

                    quantidade: 0,

                    valor: 0,

                    registros: []

                };

            }

            grupos[chave].quantidade += registro.quantidade;

            grupos[chave].valor += Number(registro.valor);

            grupos[chave].registros.push(registro);

        });

        return Object.values(grupos);

    }


    //Dados do grafico
    const dadosGrafico = useMemo(() => {

        return AgruparPeriodo(
            registrosFiltrados,
            viewModeGrafico
        );

    }, [registrosFiltrados, viewModeGrafico]);

    //Tooltip do grafico
    const TooltipGrafico = ({ active, payload }) => {

        if (!active || !payload || !payload.length) return null;

        const dados = payload[0].payload;

        return (

            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    minWidth: "180px",
                    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                    border: "1px solid #ececec",
                }}
            >

                <div
                    style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#2b2b2b",
                        marginBottom: "12px",
                        borderBottom: "1px solid #efefef",
                        paddingBottom: "8px",
                    }}
                >
                    {dados.periodo}
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        fontSize: "14px",
                    }}
                >
                    <span
                        style={{
                            color: "#777",
                        }}
                    >
                        Quantidade
                    </span>

                    <span
                        style={{
                            fontWeight: "600",
                            color: "#333",
                        }}
                    >
                        {dados.quantidade}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                    }}
                >
                    <span
                        style={{
                            color: "#777",
                        }}
                    >
                        Valor
                    </span>

                    <span
                        style={{
                            fontWeight: "700",
                            color: "#8b2c2c",
                            fontSize: "16px",
                        }}
                    >
                        R$ {Number(dados.valor).toFixed(2)}
                    </span>
                </div>

            </div>

        );

    };


    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeProdutos) {
            case "list":
                return (

                    <div
                        className="rounded-xl overflow-hidden bg-white"
                        style={{
                            border: "1px solid #d4d4d4",
                            boxShadow: "0 2px 8px rgba(0,0,0,.05)",
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
                                            background: "#f3f4f6",
                                            borderBottom: "2px solid #d4d4d4",
                                        }}
                                    >

                                        {[
                                            "ID",
                                            "Usuário",
                                            "Tipo",
                                            "Movimento",
                                            "Valor Unitário",
                                            "Quantidade",
                                            "Valor Total",
                                            "Status",
                                            "Vencimento",
                                            "Data de Criação",
                                        ].map((coluna) => (

                                            <th
                                                key={coluna}
                                                className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                                                style={{
                                                    color: "#333",
                                                }}
                                            >
                                                {coluna}
                                            </th>

                                        ))}

                                    </tr>

                                </thead>


                                {/* =========================
                        CORPO
                    ========================= */}

                                <tbody>

                                    {registrosFiltrados.map((registro, index) => (

                                        <tr
                                            key={registro.id}

                                            onClick={async () => {

                                                if (registro.tipo === "CRIAÇÃO") {

                                                    const produto = produtos.find(
                                                        (p) => Number(p.id) === Number(registro.aditional_id)
                                                    );

                                                    if (produto) {
                                                        setProdutoSelecionado(produto);
                                                        setTipoModal("CRIACAO");
                                                        setAbrirProd(registro);
                                                    }

                                                } else if (
                                                    registro.tipo === "VENDA" ||
                                                    registro.tipo === "VENDA FINALIZADA"
                                                ) {

                                                    await BuscarVenda(registro.aditional_id);

                                                    setTipoModal("VENDA");
                                                    setAbrirProd(registro);

                                                } else if (registro.tipo === "REESTOQUE") {

                                                    await BuscarDrop(registro.aditional_id);

                                                    setTipoModal("REESTOQUE");
                                                    setAbrirProd(registro);

                                                }

                                            }}

                                            className="
                                                cursor-pointer
                                                transition-colors
                                                hover:bg-gray-100
                                            "

                                            style={{
                                                background:
                                                    index % 2 === 0
                                                        ? "#ffffff"
                                                        : "#fafafa",

                                                borderBottom:
                                                    "1px solid #ececec",
                                            }}

                                            onMouseEnter={() => {
                                                setHoverRegistro(registro);
                                            }}

                                            onMouseLeave={() => {
                                                setHoverRegistro(null);
                                            }}

                                            onMouseMove={(e) => {

                                                setMousePos({
                                                    x: e.clientX,
                                                    y: e.clientY,
                                                });

                                            }}
                                        >

                                            {/* =========================
                                    ID
                                ========================= */}

                                            <td className="px-4 py-3 font-medium">
                                                #{registro.id}
                                            </td>


                                            {/* =========================
                                    USUÁRIO
                                ========================= */}

                                            <td className="px-4 py-3">
                                                {registro.nome_usuario ?? "-"}
                                            </td>


                                            {/* =========================
                                    TIPO
                                ========================= */}

                                            <td className="px-4 py-3">
                                                {registro.tipo ?? "-"}
                                                {prodAberto && (

                                                    <div
                                                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                                                        onClick={() => {
                                                            setAbrirProd(null);
                                                            setTipoModal(null);
                                                        }}
                                                    >

                                                        <div
                                                            className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >

                                                            {/* =========================
                CRIAÇÃO
            ========================= */}

                                                            {tipoModal === "CRIACAO" && produtoSelecionado && (

                                                                <div>

                                                                    <h2 className="text-xl font-bold text-gray-800 mb-5">
                                                                        Produto criado
                                                                    </h2>

                                                                    <div className="grid grid-cols-2 gap-4">

                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                ID
                                                                            </p>

                                                                            <p className="font-medium">
                                                                                #{produtoSelecionado.id}
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                Produto
                                                                            </p>

                                                                            <p className="font-medium">
                                                                                {produtoSelecionado.nome}
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                SKU
                                                                            </p>

                                                                            <p className="font-medium">
                                                                                {produtoSelecionado.sku}
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                Estoque
                                                                            </p>

                                                                            <p className="font-medium">
                                                                                {produtoSelecionado.estoque}
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                Preço de custo
                                                                            </p>

                                                                            <p className="font-medium">
                                                                                {Number(
                                                                                    produtoSelecionado.precoCusto ?? 0
                                                                                ).toLocaleString("pt-BR", {
                                                                                    style: "currency",
                                                                                    currency: "BRL"
                                                                                })}
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                Preço de venda
                                                                            </p>

                                                                            <p className="font-medium">
                                                                                {Number(
                                                                                    produtoSelecionado.preco ?? 0
                                                                                ).toLocaleString("pt-BR", {
                                                                                    style: "currency",
                                                                                    currency: "BRL"
                                                                                })}
                                                                            </p>
                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            )}


                                                            {/* =========================
                VENDA
            ========================= */}

                                                            {tipoModal === "VENDA" && (

                                                                <div>

                                                                    <h2 className="text-xl font-bold text-gray-800 mb-5">
                                                                        Venda
                                                                    </h2>

                                                                    {vendaSelecionada && (

                                                                        <div className="mb-6">

                                                                            <p>
                                                                                <strong>ID da venda:</strong>{" "}
                                                                                #{vendaSelecionada.id}
                                                                            </p>

                                                                        </div>

                                                                    )}

                                                                    <h3 className="font-semibold text-gray-700 mb-3">
                                                                        Itens da venda
                                                                    </h3>

                                                                    <div className="space-y-2">

                                                                        {itensVenda.map((item) => (

                                                                            <div
                                                                                key={item.id}
                                                                                className="border rounded-lg p-3"
                                                                            >

                                                                                <div className="flex justify-between">

                                                                                    <span>
                                                                                        Produto #{item.produto_id}
                                                                                    </span>

                                                                                    <span>
                                                                                        Quantidade: {item.quantidade}
                                                                                    </span>

                                                                                </div>

                                                                                <div className="text-sm text-gray-500 mt-1">

                                                                                    Preço unitário:{" "}

                                                                                    {Number(
                                                                                        item.preco_unitario ?? 0
                                                                                    ).toLocaleString("pt-BR", {
                                                                                        style: "currency",
                                                                                        currency: "BRL"
                                                                                    })}

                                                                                </div>

                                                                            </div>

                                                                        ))}

                                                                    </div>

                                                                </div>

                                                            )}


                                                            {/* =========================
                REESTOQUE
            ========================= */}

                                                            {tipoModal === "REESTOQUE" && (

                                                                <div>

                                                                    <h2 className="text-xl font-bold text-gray-800 mb-5">
                                                                        Reestoque
                                                                    </h2>

                                                                    {dropSelecionado && (

                                                                        <div className="mb-6">

                                                                            <p>
                                                                                <strong>ID do reestoque:</strong>{" "}
                                                                                #{dropSelecionado.id}
                                                                            </p>

                                                                        </div>

                                                                    )}

                                                                    <h3 className="font-semibold text-gray-700 mb-3">
                                                                        Itens do reestoque
                                                                    </h3>

                                                                    <div className="space-y-2">

                                                                        {itensDrop.map((item) => (

                                                                            <div
                                                                                key={item.id}
                                                                                className="border rounded-lg p-3"
                                                                            >

                                                                                <div className="flex justify-between">

                                                                                    <span>
                                                                                        Produto #{item.produto_id}
                                                                                    </span>

                                                                                    <span>
                                                                                        Quantidade: {item.quantidade}
                                                                                    </span>

                                                                                </div>

                                                                                <div className="text-sm text-gray-500 mt-1">

                                                                                    Preço unitário:{" "}

                                                                                    {Number(
                                                                                        item.preco_unitario ?? 0
                                                                                    ).toLocaleString("pt-BR", {
                                                                                        style: "currency",
                                                                                        currency: "BRL"
                                                                                    })}

                                                                                </div>

                                                                            </div>

                                                                        ))}

                                                                    </div>

                                                                </div>

                                                            )}


                                                            {/* =========================
                BOTÃO FECHAR
            ========================= */}

                                                            <div className="flex justify-end mt-6">

                                                                <button
                                                                    onClick={() => {
                                                                        setAbrirProd(null);
                                                                        setTipoModal(null);
                                                                    }}
                                                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                                                                >
                                                                    Fechar
                                                                </button>

                                                            </div>

                                                        </div>

                                                    </div>

                                                )}

                                            </td>


                                            {/* =========================
                                    MOVIMENTO FINANCEIRO
                                ========================= */}

                                            <td className="px-4 py-3">

                                                <span
                                                    className="
                                            px-3
                                            py-1
                                            rounded-full
                                            text-xs
                                            font-semibold
                                        "
                                                    style={{
                                                        background:
                                                            registro.movimentoFinanceiro ===
                                                                "ENTRADA"
                                                                ? "#dcfce7"
                                                                : "#fee2e2",

                                                        color:
                                                            registro.movimentoFinanceiro ===
                                                                "ENTRADA"
                                                                ? "#166534"
                                                                : "#991b1b",
                                                    }}
                                                >
                                                    {registro.movimentoFinanceiro ===
                                                        "ENTRADA"
                                                        ? "Entrada"
                                                        : "Saída"}
                                                </span>

                                            </td>


                                            {/* =========================
                                    VALOR UNITÁRIO
                                ========================= */}

                                            <td className="px-4 py-3">

                                                {Number(
                                                    registro.valor ?? 0
                                                ).toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }
                                                )}

                                            </td>


                                            {/* =========================
                                    QUANTIDADE
                                ========================= */}

                                            <td className="px-4 py-3">
                                                {registro.quantidade ?? 0}
                                            </td>


                                            {/* =========================
                                    VALOR TOTAL
                                ========================= */}

                                            <td
                                                className="
                                        px-4
                                        py-3
                                        font-semibold
                                    "
                                            >

                                                {Number(
                                                    registro.valorTotal ?? 0
                                                ).toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }
                                                )}

                                            </td>


                                            {/* =========================
                                    STATUS
                                ========================= */}

                                            <td className="px-4 py-3">

                                                <span
                                                    className="
                                            px-3
                                            py-1
                                            rounded-full
                                            text-xs
                                            font-semibold
                                        "
                                                    style={{
                                                        background:
                                                            registro.status === "PAGO"
                                                                ? "#dcfce7"
                                                                : "#fbe4e6",

                                                        color:
                                                            registro.status === "PAGO"
                                                                ? "#166534"
                                                                : "#7f1d1d",
                                                    }}
                                                >
                                                    {registro.status === "PAGO"
                                                        ? "Pago"
                                                        : "Não Pago"}
                                                </span>

                                            </td>


                                            {/* =========================
                                    VENCIMENTO
                                ========================= */}

                                            <td className="px-4 py-3">
                                                {registro.vencimentoFormatado ?? "-"}
                                            </td>


                                            {/* =========================
                                    DATA DE CRIAÇÃO
                                ========================= */}

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {registro.created_atFormatado ?? "-"}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>


                        {/* =========================
                DESCRIÇÃO AO PASSAR MOUSE
            ========================= */}

                        {hoverRegistro && (

                            <div
                                style={{
                                    position: "fixed",

                                    left:
                                        mousePos.x + 20,

                                    top:
                                        mousePos.y + 20,

                                    width: "320px",

                                    background: "white",

                                    color: "black",

                                    borderRadius: "10px",

                                    padding: "15px",

                                    boxShadow:
                                        "0 8px 20px rgba(0,0,0,.25)",

                                    zIndex: 9999,

                                    pointerEvents: "none",

                                    border:
                                        "1px solid #d1d5db",
                                }}
                            >

                                <h4
                                    style={{
                                        marginTop: 0,
                                        fontWeight: "600",
                                    }}
                                >
                                    Descrição
                                </h4>

                                <hr />

                                <div className="mt-2 space-y-1">

                                    <p>
                                        <strong>Descrição:</strong>{" "}
                                        {hoverRegistro.descricao ?? "-"}
                                    </p>

                                    <p>
                                        <strong>Tipo:</strong>{" "}
                                        {hoverRegistro.tipo ?? "-"}
                                    </p>

                                    <p>
                                        <strong>Movimento:</strong>{" "}
                                        {hoverRegistro.movimentoFinanceiro ?? "-"}
                                    </p>

                                    <p>
                                        <strong>Valor unitário:</strong>{" "}
                                        {Number(
                                            hoverRegistro.valor ?? 0
                                        ).toLocaleString(
                                            "pt-BR",
                                            {
                                                style: "currency",
                                                currency: "BRL",
                                            }
                                        )}
                                    </p>

                                    <p>
                                        <strong>Quantidade:</strong>{" "}
                                        {hoverRegistro.quantidade ?? 0}
                                    </p>

                                    <p>
                                        <strong>Valor total:</strong>{" "}
                                        {Number(
                                            hoverRegistro.valorTotal ?? 0
                                        ).toLocaleString(
                                            "pt-BR",
                                            {
                                                style: "currency",
                                                currency: "BRL",
                                            }
                                        )}
                                    </p>

                                </div>

                            </div>

                        )}

                    </div>
                );



            case "new":
                return (
                    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-6">

                        <div
                            className="w-full max-w-5xl bg-white rounded-2xl p-8"
                            style={{
                                border: "1px solid #d4d4d4",
                                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                            }}
                        >

                            {/* Cabeçalho */}
                            <div className="flex justify-between items-center mb-8">

                                <div>

                                    <h1
                                        className="text-3xl font-bold"
                                        style={{ color: "#222" }}
                                    >
                                        Cadastro de Custos
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Registre um novo custo da empresa.
                                    </p>

                                </div>

                                <button
                                    onClick={() => setActiveProdutos("list")}
                                    className="px-5 py-2 rounded-lg text-white transition"
                                    style={{
                                        background: "#6b1f2b",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#581822";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#6b1f2b";
                                    }}
                                >
                                    Voltar
                                </button>

                            </div>



                            <div className="grid grid-cols-2 gap-6">

                                {/* Tipo */}
                                <div>

                                    <label
                                        className="block mb-2 font-medium"
                                        style={{ color: "#333" }}
                                    >
                                        Tipo do custo
                                    </label>

                                    <input
                                        list="tiposCustos"
                                        type="text"
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 transition"
                                        style={{
                                            background: "#fafafa",
                                            border: "1px solid #d4d4d4",
                                            color: "#222",
                                            outline: "none",
                                        }}
                                    />

                                    <datalist id="tiposCustos">
                                        {tiposCustos.map((item) => (
                                            <option
                                                key={item}
                                                value={item}
                                            />
                                        ))}
                                    </datalist>

                                </div>



                                {/* Status */}
                                <div>

                                    <label
                                        className="block mb-2 font-medium"
                                        style={{ color: "#333" }}
                                    >
                                        Status
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 transition"
                                        style={{
                                            background: "#fafafa",
                                            border: "1px solid #d4d4d4",
                                            color: "#222",
                                        }}
                                    >

                                        <option value="">Selecione</option>
                                        <option value="PAGO">Pago</option>
                                        <option value="NAOPAGO">Não Pago</option>

                                    </select>

                                </div>



                                {/* Descrição */}
                                <div className="col-span-2">

                                    <label
                                        className="block mb-2 font-medium"
                                        style={{ color: "#333" }}
                                    >
                                        Descrição
                                    </label>

                                    <textarea
                                        rows={6}
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        placeholder="Digite uma descrição detalhada..."
                                        className="w-full resize-none rounded-lg px-4 py-3 transition"
                                        style={{
                                            background: "#fafafa",
                                            border: "1px solid #d4d4d4",
                                            color: "#222",
                                        }}
                                    />

                                </div>



                                {/* Quantidade */}
                                <div>

                                    <label
                                        className="block mb-2 font-medium"
                                        style={{ color: "#333" }}
                                    >
                                        Quantidade
                                    </label>

                                    <input
                                        type="number"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 transition"
                                        style={{
                                            background: "#fafafa",
                                            border: "1px solid #d4d4d4",
                                            color: "#222",
                                        }}
                                    />

                                </div>



                                {/* Valor */}
                                <div>

                                    <label
                                        className="block mb-2 font-medium"
                                        style={{ color: "#333" }}
                                    >
                                        Valor
                                    </label>

                                    <input
                                        type="number"
                                        value={valor}
                                        onChange={(e) => setValor(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 transition"
                                        style={{
                                            background: "#fafafa",
                                            border: "1px solid #d4d4d4",
                                            color: "#222",
                                        }}
                                    />

                                </div>



                                {/* Vencimento */}
                                <div>

                                    <label
                                        className="block mb-2 font-medium"
                                        style={{ color: "#333" }}
                                    >
                                        Data de vencimento
                                    </label>

                                    <input
                                        type="date"
                                        value={vencimento}
                                        onChange={(e) => setVencimento(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 transition"
                                        style={{
                                            background: "#fafafa",
                                            border: "1px solid #d4d4d4",
                                            color: "#222",
                                        }}
                                    />

                                </div>



                                {/* Parcelas */}
                                <div>

                                    <label
                                        className="block mb-2 font-medium"
                                        style={{ color: "#333" }}
                                    >
                                        Quantidade de parcelas
                                    </label>

                                    <input
                                        type="number"
                                        min={1}
                                        value={quantParcelas}
                                        onChange={(e) => setQuantParcelas(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 transition"
                                        style={{
                                            background: "#fafafa",
                                            border: "1px solid #d4d4d4",
                                            color: "#222",
                                        }}
                                    />

                                </div>

                            </div>



                            <div className="flex justify-end gap-4 mt-10">

                                <button
                                    onClick={() => setActiveProdutos("list")}
                                    className="px-6 py-3 rounded-lg transition"
                                    style={{
                                        background: "#ececec",
                                        border: "1px solid #d4d4d4",
                                        color: "#444",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#dddddd";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#ececec";
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={() => setshowConfirm(true)}
                                    className="px-6 py-3 rounded-lg text-white font-semibold transition"
                                    style={{
                                        background: "#6b1f2b",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#581822";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#6b1f2b";
                                    }}
                                >
                                    Cadastrar Custo
                                </button>

                            </div>

                        </div>








                        {/* MODAL DE CONFIRMAÇÃO */}

                        {
                            showConfirm && (

                                <div
                                    style={{
                                        position: "fixed",
                                        inset: 0,
                                        background: "rgba(0,0,0,0.4)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 1000
                                    }}
                                >


                                    <div
                                        style={{
                                            width: "350px",
                                            background: "white",
                                            color: "black",
                                            borderRadius: "10px",
                                            padding: "20px",
                                            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                            textAlign: "center"
                                        }}
                                    >


                                        {
                                            loadingConfirm ? (

                                                <div className="flex flex-col items-center gap-4 py-5">

                                                    <div
                                                        className="w-12 h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin"
                                                    ></div>


                                                    <p className="text-slate-700">
                                                        Finalizando...
                                                    </p>


                                                </div>


                                            ) : (


                                                <>


                                                    <h2 className="text-lg font-semibold mb-5">
                                                        Deseja cadastrar este custo?
                                                    </h2>



                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between"
                                                        }}
                                                    >



                                                        <button
                                                            onClick={() => setshowConfirm(false)}
                                                        >
                                                            Cancelar
                                                        </button>





                                                        <button
                                                            onClick={async () => {

                                                                setLoadingConfirm(true);


                                                                await CriarCusto();


                                                                setLoadingConfirm(false);
                                                                setshowConfirm(false);

                                                            }}
                                                        >
                                                            Continuar
                                                        </button>



                                                    </div>


                                                </>


                                            )
                                        }



                                    </div>


                                </div>

                            )
                        }


                    </div >
                )

            case "grafico":
                return (

                    <div>

                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "12px",
                                boxShadow: "0 6px 18px rgba(0,0,0,.08)",
                                overflow: "hidden",
                                marginBottom: "25px",
                            }}
                        >

                            {/* Cabeçalho */}

                            <div
                                style={{
                                    padding: "22px 28px 10px",
                                }}
                            >
                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: "28px",
                                        fontWeight: 700,
                                        color: "#202020",
                                    }}
                                >
                                    Relatórios
                                </h1>

                                <p
                                    style={{
                                        marginTop: 6,
                                        color: "#8a8a8a",
                                        fontSize: "14px",
                                    }}
                                >
                                    Visualização de lançamentos por período
                                </p>
                            </div>

                            {/* Tabs */}

                            <div
                                style={{
                                    display: "flex",
                                    borderBottom: "1px solid #e5e5e5",
                                    paddingLeft: "15px",
                                }}
                            >

                                {[
                                    "ANOS",
                                    "MESES",
                                    "SEMANAS",
                                    "DIAS",
                                ].map((item) => (

                                    <button
                                        key={item}
                                        onClick={() => setViewModeGrafico(item)}
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",

                                            padding: "14px 22px",

                                            fontWeight:
                                                viewModeGrafico === item
                                                    ? 600
                                                    : 500,

                                            fontSize: "14px",

                                            color:
                                                viewModeGrafico === item
                                                    ? "#6b1f1f"
                                                    : "#7c7c7c",

                                            borderBottom:
                                                viewModeGrafico === item
                                                    ? "3px solid #8b2c2c"
                                                    : "3px solid transparent",

                                            transition: ".2s",
                                        }}
                                    >
                                        {item.charAt(0) +
                                            item
                                                .slice(1)
                                                .toLowerCase()}
                                    </button>

                                ))}

                            </div>

                        </div>

                        {/* CONTEÚDO */}

                        {viewModeGrafico === "ANOS" && (

                            <div
                                style={{
                                    width: "100%",
                                    height: "800px",          // altura fixa do card
                                    background: "#ffffff",
                                    borderRadius: "14px",
                                    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                                    padding: "24px",
                                    overflow: "auto",         // cria scroll interno
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "24px",
                                }}
                            >

                                <ResponsiveContainer
                                    width="100%"
                                    height={400}
                                >

                                    <BarChart
                                        data={dadosGrafico}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 0,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis
                                            dataKey="periodo"
                                        />

                                        <YAxis />

                                        <Tooltip
                                            content={<TooltipGrafico />}
                                        />

                                        <Legend />

                                        <Bar
                                            dataKey="valor"
                                            name="Valor Total"

                                            fill="#7c3aed"

                                            radius={[8, 8, 0, 0]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                                {/* Custos agrupados por período */}
                                {dadosGrafico.map((periodo) => (

                                    <div
                                        key={periodo.periodo}
                                        style={{
                                            background: "#fafafa",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            marginBottom: "28px",
                                            border: "1px solid #ececec",
                                        }}
                                    >

                                        {/* Cabeçalho */}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "18px",
                                                flexWrap: "wrap",
                                                gap: "12px",
                                            }}
                                        >

                                            <div>

                                                <h2
                                                    style={{
                                                        margin: 0,
                                                        color: "#8b2c2c",
                                                        fontSize: "22px",
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    {periodo.periodo}
                                                </h2>

                                                <span
                                                    style={{
                                                        color: "#888",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {periodo.registros.length} registros
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#8b2c2c",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                    fontSize: "18px",
                                                }}
                                            >
                                                R$ {periodo.valor.toFixed(2)}
                                            </div>

                                        </div>

                                        {/* Tabela */}

                                        <div
                                            style={{
                                                overflowX: "auto",
                                            }}
                                        >

                                            <table
                                                style={{
                                                    width: "100%",
                                                    borderCollapse: "collapse",
                                                    minWidth: "900px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Valor</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Status</th>
                                                        <th style={thStyle}>Data</th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {periodo.registros.map((registro) => (

                                                        <tr
                                                            key={registro.id}
                                                            style={{
                                                                borderBottom: "1px solid #ececec",
                                                            }}
                                                        >

                                                            <td style={tdStyle}>{registro.id}</td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background: "#f8d7da",
                                                                        color: "#8b2c2c",
                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td
                                                                style={{
                                                                    ...tdStyle,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                R$ {Number(registro.valor).toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        padding: "4px 12px",
                                                                        borderRadius: "20px",
                                                                        fontWeight: 600,
                                                                        fontSize: "12px",
                                                                        color:
                                                                            registro.status
                                                                                ? "#1b5e20"
                                                                                : "#8b2c2c",

                                                                        background:
                                                                            registro.status
                                                                                ? "#dff5e1"
                                                                                : "#fde2e2",
                                                                    }}
                                                                >
                                                                    {registro.status
                                                                        ? "Pago"
                                                                        : "Não Pago"}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.created_atFormatado}
                                                            </td>

                                                        </tr>

                                                    ))}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                ))}


                            </div>



                        )}

                        {viewModeGrafico === "MESES" && (

                            <div
                                style={{
                                    width: "100%",
                                    height: "700px",          // altura fixa do card
                                    background: "#ffffff",
                                    borderRadius: "14px",
                                    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                                    padding: "24px",
                                    overflow: "auto",         // cria scroll interno
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "24px",
                                }}
                            >

                                <ResponsiveContainer
                                    width="100%"
                                    height={400}
                                >

                                    <LineChart
                                        data={dadosGrafico}
                                    >

                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis dataKey="periodo" />

                                        <YAxis />

                                        <Tooltip
                                            content={<TooltipGrafico />}
                                        />

                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="valor"
                                            name="Valor Total"

                                            stroke="#2563eb"

                                            strokeWidth={3}

                                            dot={{
                                                r: 5
                                            }}

                                            activeDot={{
                                                r: 8
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                                {/* Custos agrupados por período */}
                                {dadosGrafico.map((periodo) => (

                                    <div
                                        key={periodo.periodo}
                                        style={{
                                            background: "#fafafa",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            marginBottom: "28px",
                                            border: "1px solid #ececec",
                                        }}
                                    >

                                        {/* Cabeçalho */}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "18px",
                                                flexWrap: "wrap",
                                                gap: "12px",
                                            }}
                                        >

                                            <div>

                                                <h2
                                                    style={{
                                                        margin: 0,
                                                        color: "#8b2c2c",
                                                        fontSize: "22px",
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    {periodo.periodo}
                                                </h2>

                                                <span
                                                    style={{
                                                        color: "#888",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {periodo.registros.length} registros
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#8b2c2c",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                    fontSize: "18px",
                                                }}
                                            >
                                                R$ {periodo.valor.toFixed(2)}
                                            </div>

                                        </div>

                                        {/* Tabela */}

                                        <div
                                            style={{
                                                overflowX: "auto",
                                            }}
                                        >

                                            <table
                                                style={{
                                                    width: "100%",
                                                    borderCollapse: "collapse",
                                                    minWidth: "900px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Valor</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Status</th>
                                                        <th style={thStyle}>Data</th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {periodo.registros.map((registro) => (

                                                        <tr
                                                            key={registro.id}
                                                            style={{
                                                                borderBottom: "1px solid #ececec",
                                                            }}
                                                        >

                                                            <td style={tdStyle}>{registro.id}</td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background: "#f8d7da",
                                                                        color: "#8b2c2c",
                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td
                                                                style={{
                                                                    ...tdStyle,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                R$ {Number(registro.valor).toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        padding: "4px 12px",
                                                                        borderRadius: "20px",
                                                                        fontWeight: 600,
                                                                        fontSize: "12px",
                                                                        color:
                                                                            registro.status
                                                                                ? "#1b5e20"
                                                                                : "#8b2c2c",

                                                                        background:
                                                                            registro.status
                                                                                ? "#dff5e1"
                                                                                : "#fde2e2",
                                                                    }}
                                                                >
                                                                    {registro.status
                                                                        ? "Pago"
                                                                        : "Não Pago"}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.created_atFormatado}
                                                            </td>

                                                        </tr>

                                                    ))}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}


                        {viewModeGrafico === "SEMANAS" && (

                            <div
                                style={{
                                    width: "100%",
                                    height: "700px",          // altura fixa do card
                                    background: "#ffffff",
                                    borderRadius: "14px",
                                    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                                    padding: "24px",
                                    overflow: "auto",         // cria scroll interno
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "24px",
                                }}
                            >

                                <ResponsiveContainer
                                    width="100%"
                                    height={400}
                                >

                                    <BarChart
                                        data={dadosGrafico}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="periodo"
                                        />

                                        <YAxis />

                                        <Tooltip
                                            content={<TooltipGrafico />}
                                        />

                                        <Legend />

                                        <Bar
                                            dataKey="valor"
                                            name="Valor Total"

                                            fill="#2563eb"

                                            radius={[8, 8, 0, 0]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>



                                {/* Custos agrupados por período */}
                                {dadosGrafico.map((periodo) => (

                                    <div
                                        key={periodo.periodo}
                                        style={{
                                            background: "#fafafa",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            marginBottom: "28px",
                                            border: "1px solid #ececec",
                                        }}
                                    >

                                        {/* Cabeçalho */}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "18px",
                                                flexWrap: "wrap",
                                                gap: "12px",
                                            }}
                                        >

                                            <div>

                                                <h2
                                                    style={{
                                                        margin: 0,
                                                        color: "#8b2c2c",
                                                        fontSize: "22px",
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    {periodo.periodo}
                                                </h2>

                                                <span
                                                    style={{
                                                        color: "#888",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {periodo.registros.length} registros
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#8b2c2c",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                    fontSize: "18px",
                                                }}
                                            >
                                                R$ {periodo.valor.toFixed(2)}
                                            </div>

                                        </div>

                                        {/* Tabela */}

                                        <div
                                            style={{
                                                overflowX: "auto",
                                            }}
                                        >

                                            <table
                                                style={{
                                                    width: "100%",
                                                    borderCollapse: "collapse",
                                                    minWidth: "900px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Valor</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Status</th>
                                                        <th style={thStyle}>Data</th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {periodo.registros.map((registro) => (

                                                        <tr
                                                            key={registro.id}
                                                            style={{
                                                                borderBottom: "1px solid #ececec",
                                                            }}
                                                        >

                                                            <td style={tdStyle}>{registro.id}</td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background: "#f8d7da",
                                                                        color: "#8b2c2c",
                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td
                                                                style={{
                                                                    ...tdStyle,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                R$ {Number(registro.valor).toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        padding: "4px 12px",
                                                                        borderRadius: "20px",
                                                                        fontWeight: 600,
                                                                        fontSize: "12px",
                                                                        color:
                                                                            registro.status
                                                                                ? "#1b5e20"
                                                                                : "#8b2c2c",

                                                                        background:
                                                                            registro.status
                                                                                ? "#dff5e1"
                                                                                : "#fde2e2",
                                                                    }}
                                                                >
                                                                    {registro.status
                                                                        ? "Pago"
                                                                        : "Não Pago"}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.created_atFormatado}
                                                            </td>

                                                        </tr>

                                                    ))}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )
                        }

                        {viewModeGrafico === "DIAS" && (

                            <div
                                style={{
                                    width: "100%",
                                    height: "700px",          // altura fixa do card
                                    background: "#ffffff",
                                    borderRadius: "14px",
                                    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                                    padding: "24px",
                                    overflow: "auto",         // cria scroll interno
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "24px",
                                }}
                            >

                                <ResponsiveContainer
                                    width="100%"
                                    height={400}
                                >

                                    <LineChart
                                        data={dadosGrafico}
                                    >

                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis
                                            dataKey="periodo"
                                        />

                                        <YAxis />

                                        <Tooltip
                                            content={<TooltipGrafico />}
                                        />

                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="valor"
                                            name="Valor Total"

                                            stroke="#ef4444"

                                            strokeWidth={3}

                                            dot={{ r: 4 }}

                                            activeDot={{ r: 7 }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                                {/* Custos agrupados por período */}
                                {dadosGrafico.map((periodo) => (

                                    <div
                                        key={periodo.periodo}
                                        style={{
                                            background: "#fafafa",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            marginBottom: "28px",
                                            border: "1px solid #ececec",
                                        }}
                                    >

                                        {/* Cabeçalho */}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "18px",
                                                flexWrap: "wrap",
                                                gap: "12px",
                                            }}
                                        >

                                            <div>

                                                <h2
                                                    style={{
                                                        margin: 0,
                                                        color: "#8b2c2c",
                                                        fontSize: "22px",
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    {periodo.periodo}
                                                </h2>

                                                <span
                                                    style={{
                                                        color: "#888",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {periodo.registros.length} registros
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#8b2c2c",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                    fontSize: "18px",
                                                }}
                                            >
                                                R$ {periodo.valor.toFixed(2)}
                                            </div>

                                        </div>

                                        {/* Tabela */}

                                        <div
                                            style={{
                                                overflowX: "auto",
                                            }}
                                        >

                                            <table
                                                style={{
                                                    width: "100%",
                                                    borderCollapse: "collapse",
                                                    minWidth: "900px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Valor</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Status</th>
                                                        <th style={thStyle}>Data</th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {periodo.registros.map((registro) => (

                                                        <tr
                                                            key={registro.id}
                                                            style={{
                                                                borderBottom: "1px solid #ececec",
                                                            }}
                                                        >

                                                            <td style={tdStyle}>{registro.id}</td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background: "#f8d7da",
                                                                        color: "#8b2c2c",
                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td
                                                                style={{
                                                                    ...tdStyle,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                R$ {Number(registro.valor).toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        padding: "4px 12px",
                                                                        borderRadius: "20px",
                                                                        fontWeight: 600,
                                                                        fontSize: "12px",
                                                                        color:
                                                                            registro.status
                                                                                ? "#1b5e20"
                                                                                : "#8b2c2c",

                                                                        background:
                                                                            registro.status
                                                                                ? "#dff5e1"
                                                                                : "#fde2e2",
                                                                    }}
                                                                >
                                                                    {registro.status
                                                                        ? "Pago"
                                                                        : "Não Pago"}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.created_atFormatado}
                                                            </td>

                                                        </tr>

                                                    ))}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div >

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
                    Entrada e Saida de Caixa
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
                        placeholder="Buscar custos..."
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

                {/* Botão gráfico */}
                {/* <button
                    onClick={() => setActiveProdutos("grafico")}
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
                    ⚙ Graficos
                </button> */}

                {/* Ícone Lista */}
                <div
                    onClick={() => setActiveProdutos("list")}
                    style={{
                        marginLeft: "auto",
                        fontSize: "22px",
                        color: "#6b1f2b",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    ☰
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className="p-6">
                {/* CARDS ENCIMA DA TELÇA */}

                <div className="grid grid-cols-4 gap-4 mb-6">

                    {/* Total de Custos */}
                    <div
                        className="rounded-xl shadow p-5 text-white"
                        style={{
                            background: "#6b1f2b",
                        }}
                    >
                        <h3 className="text-sm opacity-80">
                            Custos
                        </h3>

                        <p className="text-3xl font-bold mt-2">
                            R$ {cards.totalCustos.toFixed(2)}
                        </p>

                        <span className="text-sm opacity-80">
                            {cards.quantidade} registros
                        </span>
                    </div>

                    {/* Pagamentos */}
                    <div
                        className="rounded-xl shadow p-5"
                        style={{
                            background: "#f0fdf4",
                        }}
                    >
                        <h3 className="text-gray-600 text-sm">
                            Pagamentos
                        </h3>

                        <p className="text-green-700 font-semibold mt-2">
                            Pago: R$ {cards.totalPago.toFixed(2)}
                        </p>

                        <p className="text-red-700">
                            Pendente: R$ {cards.totalPendente.toFixed(2)}
                        </p>
                    </div>

                    {/* Vencimentos */}
                    <div
                        className="rounded-xl shadow p-5"
                        style={{
                            background: "#fff7ed",
                        }}
                    >
                        <h3 className="text-gray-600 text-sm">
                            Vencimentos
                        </h3>

                        <p className="text-red-700 font-semibold mt-2">
                            {cards.vencidos} vencidos
                        </p>

                        <p className="text-orange-600">
                            {cards.proximos} próximos
                        </p>
                    </div>

                    {/* Resumo */}
                    <div
                        className="rounded-xl shadow p-5"
                        style={{
                            background: "#eef2ff",
                        }}
                    >
                        <h3 className="text-gray-600 text-sm">
                            Resumo
                        </h3>

                        <p className="font-semibold mt-2 text-gray-700">
                            Total de registros
                        </p>

                        <p className="text-3xl font-bold text-indigo-700">
                            {cards.quantidade}
                        </p>
                    </div>

                </div>
                {renderContent()}


                {/* CRIA UM MODAL, JANELA FLUTANTE QUE TEM FILTROS PARA O ESTOQUE */}
                {showFiltro && (

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
                                width: "700px",
                                background: "#1f2937",
                                color: "white",
                                borderRadius: "12px",
                                padding: "25px",
                                position: "relative",
                                maxHeight: "90vh",
                                overflowY: "auto"
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
                                    fontSize: "24px",
                                    cursor: "pointer"
                                }}
                            >
                                ×
                            </button>

                            <h2>Filtros</h2>

                            <hr style={{ marginBottom: "20px" }} />



                            {/* ======================== */}
                            {/* USUÁRIO */}
                            {/* ======================== */}

                            <p>Nome do Usuário</p>

                            <input
                                type="text"
                                value={filtroUsuario}
                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            />



                            {/* ======================== */}
                            {/* TIPO */}
                            {/* ======================== */}

                            <p>Tipo do Custo</p>

                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            >

                                <option value="">Todos</option>

                                {tiposCustos.map((tipo) => (

                                    <option
                                        key={tipo}
                                        value={tipo}
                                    >
                                        {tipo}
                                    </option>

                                ))}

                            </select>


                            <p>Movimento Financeiro</p>

                            <select
                                value={filtroMovimento}
                                onChange={(e) => setFiltroMovimento(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            >
                                <option value="">Todos</option>

                                <option value="ENTRADA">
                                    Entrada
                                </option>

                                <option value="SAIDA">
                                    Saída
                                </option>
                            </select>


                            {/* ======================== */}
                            {/* VALORES */}
                            {/* ======================== */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px",
                                    marginBottom: "20px"
                                }}
                            >

                                <div>

                                    <p>Valor mínimo</p>

                                    <input
                                        type="number"
                                        value={valorMin}
                                        onChange={(e) => setValorMin(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>


                                <div>

                                    <p>Valor máximo</p>

                                    <input
                                        type="number"
                                        value={valorMax}
                                        onChange={(e) => setValorMax(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>

                            </div>




                            {/* ======================== */}
                            {/* QUANTIDADE */}
                            {/* ======================== */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px",
                                    marginBottom: "20px"
                                }}
                            >

                                <div>

                                    <p>Quantidade mínima</p>

                                    <input
                                        type="number"
                                        value={quantidadeMin}
                                        onChange={(e) => setQuantidadeMin(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>


                                <div>

                                    <p>Quantidade máxima</p>

                                    <input
                                        type="number"
                                        value={quantidadeMax}
                                        onChange={(e) => setQuantidadeMax(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>

                            </div>




                            {/* ======================== */}
                            {/* STATUS */}
                            {/* ======================== */}

                            <p>Status</p>

                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "30px"
                                }}
                            >
                                <option value="">Todos</option>
                                <option value="PAGO">Pago</option>
                                <option value="NAOPAGO">Não Pago</option>
                            </select>


                            {/* ======================== */}
                            {/* PERÍODO */}
                            {/* ======================== */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px",
                                    marginBottom: "30px"
                                }}
                            >
                                <div>

                                    <p>Data Inicial</p>

                                    <input
                                        type="date"
                                        value={dataInicial}
                                        onChange={(e) => setDataInicial(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>

                                <div>

                                    <p>Data Final</p>

                                    <input
                                        type="date"
                                        value={dataFinal}
                                        onChange={(e) => setDataFinal(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>
                            </div>




                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >

                                <button
                                    onClick={() => {

                                        setFiltroUsuario("");
                                        setFiltroTipo("");
                                        setFiltroMovimento("");

                                        setValorMin("");
                                        setValorMax("");

                                        setQuantidadeMin("");
                                        setQuantidadeMax("");

                                        setFiltroStatus("");

                                        setDataInicial("");
                                        setDataFinal("");

                                    }}
                                >
                                    Limpar
                                </button>

                            </div>

                        </div>

                    </div>

                )}


            </div>
        </div>
    );
}

export default registros;