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
    const [filtroProduto, setFiltroProduto] = useState("");

    const [quantidadeMin, setQuantidadeMin] = useState("");
    const [quantidadeMax, setQuantidadeMax] = useState("");

    const [filtroVencimento, setFiltroVencimento] = useState("");
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");

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



    // Função que pega todas as movimentações
    async function LoadMovimentacoes() {
        try {
            const resposta = await axios.get(
                `${API_URL}/registrations/buscar-movimentacoes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const movimentacoes = resposta.data.map((m) => ({
                id: m.id,
                quantidade: m.quantidade,
                produto_id: m.produto_id,
                precoVenda: Number(m.preco_venda),
                precoCusto: Number(m.preco_custo),
                usuario_id: m.usuario_id,
                tipo: m.tipo_movimentacao,
                estoqueAnterior: m.estoque_anterior,
                estoqueDepois: m.estoque_depois,

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
        // MOVIMENTO FINANCEIRO
        // =========================

        movimentoFinanceiro:
            mov.tipo === "VENDA"
                ? "SAIDA"
                : "ENTRADA",
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

        // ======================
        // PESQUISA
        // ======================

        const texto = pesquisa.toLowerCase();

        const passouPesquisa =
            String(registro.id).includes(texto) ||
            registro.nome_produto?.toLowerCase().includes(texto) ||
            registro.nome_usuario?.toLowerCase().includes(texto) ||
            registro.tipo?.toLowerCase().includes(texto);

        if (!passouPesquisa) {
            return false;
        }

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
        // TIPO DA MOVIMENTAÇÃO
        // ======================

        if (
            filtroTipo !== "" &&
            registro.tipo !== filtroTipo
        ) {
            return false;
        }

        // ======================
        // PREÇO DE VENDA
        // ======================

        if (
            valorMin !== "" &&
            registro.precoVenda < Number(valorMin)
        ) {
            return false;
        }

        if (
            valorMax !== "" &&
            registro.precoVenda > Number(valorMax)
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
        // PERÍODO
        // ======================

        if (
            dataInicial &&
            registro.created_at.slice(0, 10) < dataInicial
        ) {
            return false;
        }

        if (
            dataFinal &&
            registro.created_at.slice(0, 10) > dataFinal
        ) {
            return false;
        }

        return true;

    });


    // FUNÇÃO PARA CRIAR OS CARDS NO TOPO DA TELA
    const cards = useMemo(() => {

        let totalVenda = 0;
        let totalCusto = 0;

        let quantidadeEntrada = 0;
        let quantidadeSaida = 0;

        registrosFiltrados.forEach((registro) => {

            totalVenda += Number(registro.precoVenda) * Number(registro.quantidade);

            totalCusto += Number(registro.precoCusto) * Number(registro.quantidade);

            if (
                registro.tipo?.toUpperCase() === "ENTRADA"
            ) {

                quantidadeEntrada += registro.quantidade;

            }

            if (
                registro.tipo?.toUpperCase() === "SAIDA"
            ) {

                quantidadeSaida += registro.quantidade;

            }

        });

        return {

            totalVenda,

            totalCusto,

            lucroEstimado: totalVenda - totalCusto,

            quantidadeMovimentacoes: registrosFiltrados.length,

            quantidadeEntrada,

            quantidadeSaida

        };

    }, [registrosFiltrados]);


    // Função para agrupar os registros por dia, semana, mês ou ano
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


                    quantidadeTotal: 0,


                    quantidadeEntrada: 0,


                    quantidadeSaida: 0,



                    valorEntrada: 0,


                    valorSaida: 0,



                    valorVenda: 0,


                    valorCusto: 0,


                    lucro: 0,



                    registros: []

                };


            }



            const quantidade =
                Number(registro.quantidade) || 0;



            const precoVenda =
                Number(registro.precoVenda) || 0;



            const precoCusto =
                Number(registro.precoCusto) || 0;



            const valorVenda =
                precoVenda * quantidade;



            const valorCusto =
                precoCusto * quantidade;




            grupos[chave].quantidadeTotal += quantidade;



            grupos[chave].valorVenda += valorVenda;



            grupos[chave].valorCusto += valorCusto;



            grupos[chave].lucro =
                grupos[chave].valorVenda -
                grupos[chave].valorCusto;






            if (
                registro.tipo?.toUpperCase() === "ENTRADA"
            ) {


                grupos[chave].quantidadeEntrada += quantidade;


                grupos[chave].valorEntrada += valorCusto;


            }





            if (
                registro.tipo?.toUpperCase() === "SAIDA"
            ) {


                grupos[chave].quantidadeSaida += quantidade;


                grupos[chave].valorSaida += valorVenda;


            }





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

    // Tooltip do gráfico
    const TooltipGrafico = ({ active, payload }) => {

        if (!active || !payload || !payload.length) return null;

        const dados = payload[0].payload;

        return (

            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    minWidth: "230px",
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
                        marginBottom: "6px",
                    }}
                >
                    <span>Quantidade</span>

                    <strong>{dados.quantidade}</strong>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                    }}
                >
                    <span>Entradas</span>

                    <strong>{dados.entradas}</strong>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                    }}
                >
                    <span>Saídas</span>

                    <strong>{dados.saidas}</strong>
                </div>

                <hr />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "8px",
                        marginBottom: "6px",
                    }}
                >
                    <span>Valor Venda</span>

                    <strong
                        style={{
                            color: "#2563eb"
                        }}
                    >
                        R$ {dados.valorVenda.toFixed(2)}
                    </strong>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                    }}
                >
                    <span>Valor Custo</span>

                    <strong
                        style={{
                            color: "#ea580c"
                        }}
                    >
                        R$ {dados.valorCusto.toFixed(2)}
                    </strong>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <span>Lucro</span>

                    <strong
                        style={{
                            color:
                                dados.lucro >= 0
                                    ? "#15803d"
                                    : "#dc2626"
                        }}
                    >
                        R$ {dados.lucro.toFixed(2)}
                    </strong>
                </div>

            </div>

        );

    };


    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeProdutos) {
            case "list":
                return (
                    <div className="p-6">

                        <div
                            className="rounded-xl overflow-hidden bg-white"
                            style={{
                                border: "1px solid #d4d4d4",
                                boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                            }}
                        >

                            <table className="w-full text-sm">

                                <thead>

                                    <tr
                                        style={{
                                            background: "#f3f4f6",
                                            borderBottom: "2px solid #d4d4d4",
                                        }}
                                    >

                                        {[
                                            "ID",
                                            "Produto",
                                            "Usuário",
                                            "Tipo",
                                            "Movimento",
                                            "Qtd.",
                                            "Preço Custo",
                                            "Preço Venda",
                                            "Estoque Antes",
                                            "Estoque Depois",
                                            "Data",
                                        ].map((coluna) => (

                                            <th
                                                key={coluna}
                                                className="px-4 py-3 text-left font-semibold"
                                                style={{
                                                    color: "#333",
                                                }}
                                            >
                                                {coluna}
                                            </th>

                                        ))}

                                    </tr>

                                </thead>

                                <tbody>

                                    {registrosFiltrados.map((registro, index) => (

                                        <tr
                                            key={registro.id}

                                            onClick={() => {
                                                setAbrirProd(registro);
                                            }}

                                            className="cursor-pointer transition-colors hover:bg-gray-100"

                                            style={{
                                                background:
                                                    index % 2 === 0
                                                        ? "#ffffff"
                                                        : "#fafafa",

                                                borderBottom: "1px solid #ececec",
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
                                                    y: e.clientY
                                                });

                                            }}

                                        >

                                            <td className="px-4 py-3 font-medium">

                                                #{registro.id}

                                            </td>

                                            <td className="px-4 py-3">

                                                {registro.nome_produto}

                                            </td>

                                            <td className="px-4 py-3">

                                                {registro.nome_usuario}

                                            </td>

                                            <td className="px-4 py-3">

                                                {registro.tipo}

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

                                            <td className="px-4 py-3">

                                                {registro.quantidade}

                                            </td>

                                            <td className="px-4 py-3">

                                                R$ {registro.precoCusto.toFixed(2)}

                                            </td>

                                            <td className="px-4 py-3 font-semibold">

                                                R$ {registro.precoVenda.toFixed(2)}

                                            </td>

                                            <td className="px-4 py-3">

                                                {registro.estoqueAnterior}

                                            </td>

                                            <td className="px-4 py-3">

                                                {registro.estoqueDepois}

                                            </td>

                                            <td className="px-4 py-3">

                                                {registro.created_atFormatado}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                            {hoverRegistro && (

                                <div
                                    style={{
                                        position: "fixed",
                                        left: mousePos.x + 20,
                                        top: mousePos.y + 20,
                                        width: "340px",
                                        background: "white",
                                        color: "black",
                                        borderRadius: "10px",
                                        padding: "15px",
                                        boxShadow: "0 8px 20px rgba(0,0,0,.25)",
                                        zIndex: 9999,
                                        pointerEvents: "none",
                                        border: "1px solid #d1d5db"
                                    }}
                                >

                                    <h4 style={{ marginTop: 0 }}>
                                        Resumo da Movimentação
                                    </h4>

                                    <hr />

                                    <p><strong>Produto:</strong> {hoverRegistro.nome_produto}</p>

                                    <p><strong>Usuário:</strong> {hoverRegistro.nome_usuario}</p>

                                    <p><strong>Tipo:</strong> {hoverRegistro.tipo}</p>

                                    <p><strong>Quantidade:</strong> {hoverRegistro.quantidade}</p>

                                    <p><strong>Preço de Custo:</strong> R$ {hoverRegistro.precoCusto.toFixed(2)}</p>

                                    <p><strong>Preço de Venda:</strong> R$ {hoverRegistro.precoVenda.toFixed(2)}</p>

                                    <p><strong>Estoque:</strong> {hoverRegistro.estoqueAnterior} → {hoverRegistro.estoqueDepois}</p>

                                    <p style={{ marginBottom: 0 }}>

                                        <strong>Data:</strong> {hoverRegistro.created_atFormatado}

                                    </p>

                                </div>

                            )}

                        </div>

                    </div>
                );



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

                                {/* Movimentações agrupadas por período */}
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
                                                        color: "#2563eb",
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
                                                    {periodo.registros.length} movimentações
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#2563eb",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {periodo.quantidade} itens
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
                                                    minWidth: "1100px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Produto</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Preço Custo</th>
                                                        <th style={thStyle}>Preço Venda</th>
                                                        <th style={thStyle}>Estoque Antes</th>
                                                        <th style={thStyle}>Estoque Depois</th>
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

                                                            <td style={tdStyle}>
                                                                {registro.id}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_produto}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#DCFCE7"
                                                                                : "#FEE2E2",

                                                                        color:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#166534"
                                                                                : "#991B1B",

                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoCusto.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoVenda.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueAnterior}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueDepois}
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

                                {/* Movimentações agrupadas por período */}
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
                                                        color: "#2563eb",
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
                                                    {periodo.registros.length} movimentações
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#2563eb",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {periodo.quantidade} itens
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
                                                    minWidth: "1100px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Produto</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Preço Custo</th>
                                                        <th style={thStyle}>Preço Venda</th>
                                                        <th style={thStyle}>Estoque Antes</th>
                                                        <th style={thStyle}>Estoque Depois</th>
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

                                                            <td style={tdStyle}>
                                                                {registro.id}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_produto}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#DCFCE7"
                                                                                : "#FEE2E2",

                                                                        color:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#166534"
                                                                                : "#991B1B",

                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoCusto.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoVenda.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueAnterior}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueDepois}
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
                                            dataKey="entrada"
                                            name="Entradas"
                                            fill="#16a34a"
                                            radius={[8, 8, 0, 0]}
                                        />

                                        <Bar
                                            dataKey="saida"
                                            name="Saídas"
                                            fill="#dc2626"
                                            radius={[8, 8, 0, 0]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>



                                {/* Movimentações agrupadas por período */}
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
                                                        color: "#2563eb",
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
                                                    {periodo.registros.length} movimentações
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#2563eb",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {periodo.quantidade} itens
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
                                                    minWidth: "1100px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Produto</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Preço Custo</th>
                                                        <th style={thStyle}>Preço Venda</th>
                                                        <th style={thStyle}>Estoque Antes</th>
                                                        <th style={thStyle}>Estoque Depois</th>
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

                                                            <td style={tdStyle}>
                                                                {registro.id}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_produto}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#DCFCE7"
                                                                                : "#FEE2E2",

                                                                        color:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#166534"
                                                                                : "#991B1B",

                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoCusto.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoVenda.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueAnterior}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueDepois}
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
                                    <LineChart data={dadosGrafico}>

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
                                            dataKey="quantidadeEntrada"
                                            name="Entradas"
                                            stroke="#22c55e"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 7 }}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="quantidadeSaida"
                                            name="Saídas"
                                            stroke="#ef4444"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 7 }}
                                        />

                                    </LineChart>
                                </ResponsiveContainer>

                                {/* Movimentações agrupadas por período */}
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
                                                        color: "#2563eb",
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
                                                    {periodo.registros.length} movimentações
                                                </span>

                                            </div>

                                            <div
                                                style={{
                                                    background: "#2563eb",
                                                    color: "white",
                                                    padding: "10px 18px",
                                                    borderRadius: "10px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {periodo.quantidade} itens
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
                                                    minWidth: "1100px",
                                                }}
                                            >

                                                <thead>

                                                    <tr
                                                        style={{
                                                            background: "#f3f3f3",
                                                        }}
                                                    >

                                                        <th style={thStyle}>ID</th>
                                                        <th style={thStyle}>Produto</th>
                                                        <th style={thStyle}>Usuário</th>
                                                        <th style={thStyle}>Tipo</th>
                                                        <th style={thStyle}>Quantidade</th>
                                                        <th style={thStyle}>Preço Custo</th>
                                                        <th style={thStyle}>Preço Venda</th>
                                                        <th style={thStyle}>Estoque Antes</th>
                                                        <th style={thStyle}>Estoque Depois</th>
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

                                                            <td style={tdStyle}>
                                                                {registro.id}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_produto}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.nome_usuario}
                                                            </td>

                                                            <td style={tdStyle}>

                                                                <span
                                                                    style={{
                                                                        background:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#DCFCE7"
                                                                                : "#FEE2E2",

                                                                        color:
                                                                            registro.tipo === "ENTRADA"
                                                                                ? "#166534"
                                                                                : "#991B1B",

                                                                        padding: "4px 10px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {registro.tipo}
                                                                </span>

                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.quantidade}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoCusto.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                R$ {registro.precoVenda.toFixed(2)}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueAnterior}
                                                            </td>

                                                            <td style={tdStyle}>
                                                                {registro.estoqueDepois}
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
                {/* <button
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
                </button> */}

                {/* Título */}
                <h1
                    style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: "600",
                        color: "#222",
                    }}
                >
                    Registros do Estoque 
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
                        placeholder="Buscar registros..."
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
                {/* CARDS EM CIMA DA TELA */}

                <div className="grid grid-cols-4 gap-4 mb-6">

                    {/* Valor de Venda */}
                    <div
                        className="rounded-xl shadow p-5 text-white"
                        style={{
                            background: "#6b1f2b",
                        }}
                    >
                        <h3 className="text-sm opacity-80">
                            Valor de Venda
                        </h3>

                        <p className="text-3xl font-bold mt-2">
                            R$ {cards.totalVenda.toFixed(2)}
                        </p>

                        <span className="text-sm opacity-80">
                            {cards.quantidadeMovimentacoes} movimentações
                        </span>
                    </div>

                    {/* Custos */}
                    <div
                        className="rounded-xl shadow p-5"
                        style={{
                            background: "#f0fdf4",
                        }}
                    >
                        <h3 className="text-gray-600 text-sm">
                            Custos
                        </h3>

                        <p className="text-orange-700 font-semibold mt-2">
                            R$ {cards.totalCusto.toFixed(2)}
                        </p>

                        <p className="text-green-700">
                            Lucro: R$ {cards.lucroEstimado.toFixed(2)}
                        </p>
                    </div>

                    {/* Movimentações */}
                    <div
                        className="rounded-xl shadow p-5"
                        style={{
                            background: "#fff7ed",
                        }}
                    >
                        <h3 className="text-gray-600 text-sm">
                            Movimentações
                        </h3>

                        <p className="text-green-700 font-semibold mt-2">
                            Entradas: {cards.quantidadeEntrada}
                        </p>

                        <p className="text-red-700">
                            Saídas: {cards.quantidadeSaida}
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
                            Total de movimentações
                        </p>

                        <p className="text-3xl font-bold text-indigo-700">
                            {cards.quantidadeMovimentacoes}
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

                            <h2>Filtros de Movimentação</h2>

                            <hr style={{ marginBottom: "20px" }} />

                            {/* USUÁRIO */}
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

                            {/* PRODUTO */}
                            <p>Produto</p>

                            <input
                                type="text"
                                value={filtroProduto}
                                onChange={(e) => setFiltroProduto(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            />

                            {/* TIPO DA MOVIMENTAÇÃO */}
                            <p>Tipo da Movimentação</p>

                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            >
                                <option value="">Todos</option>
                                <option value="ENTRADA">Entrada</option>
                                <option value="SAIDA">Saída</option>
                            </select>

                            {/* PREÇO DE VENDA */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px",
                                    marginBottom: "20px"
                                }}
                            >

                                <div>

                                    <p>Preço mínimo</p>

                                    <input
                                        type="number"
                                        value={valorMin}
                                        onChange={(e) => setValorMin(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>

                                <div>

                                    <p>Preço máximo</p>

                                    <input
                                        type="number"
                                        value={valorMax}
                                        onChange={(e) => setValorMax(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>

                            </div>

                            {/* QUANTIDADE */}
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

                            {/* PERÍODO */}
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

                            {/* BOTÃO LIMPAR */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >

                                <button
                                    onClick={() => {

                                        setFiltroUsuario("");
                                        setFiltroProduto("");

                                        setFiltroTipo("");

                                        setValorMin("");
                                        setValorMax("");

                                        setQuantidadeMin("");
                                        setQuantidadeMax("");

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