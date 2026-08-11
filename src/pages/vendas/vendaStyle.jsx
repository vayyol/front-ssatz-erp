import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"


function Vendas() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [movimentacoes, setMovimentacoes] = useState([])
    const [activeVendas, setActiveVendas] = useState("list");
    const [Vendas, setVendas] = useState([]);
    const [products, setProducts] = useState([])
    const [nomeFucio, setFuncionario] = useState("")
    const [VendaAberto, setVendaAberto] = useState("")
    const [itensVenda, setItemVenda] = useState([])

    const [usuarios, setUsers] = useState([])

    const navigate = useNavigate()
    var token = localStorage.getItem("token")

    // constantes de confimação para adicionar produtos
    const [showModal, setShowModal] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [quantidade, setQuantidade] = useState(1);

    const [loadingModal, setLoadingModal] = useState(false);

    //modal de confirmação PARA REGISTRO DE CUSTOS
    const [showConfirm, setshowConfirm] = useState(false)
    const [loadingConfirm, setLoadingConfirm] = useState(false);

    const [showConfirmFinal, setShowConfirmFinal] = useState(false)
    const [loadingConfirmFinal, setLoadingConfirmFinal] = useState(false);

    const [showConfirmCancel, setShowConfirmCancel] = useState(false)
    const [loadingConfirmCancel, setLoadingConfirmCancel] = useState(false);

    // const [nomeItem, setNameitem] = useState("") //recebera o nome de determinado produto

    //constantes para a criação de custos
    const [tipo, setTipo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [quant, setQuantidadeS] = useState(0);
    const [valor, setValor] = useState(0);
    const [status, setStatus] = useState(null);
    const [vencimento, setVencimento] = useState("");
    const [quantParcelas, setQuantParcelas] = useState(1);

    //cosntande para barra de pesquisa
    const [pesquisa, setPesquisa] = useState("");

    //constamtes para a criação de filtros
    const [showFiltro, setShowFiltro] = useState(false);

    // Funcionário
    const [filtroUsuario, setFiltroUsuario] = useState("");

    // Valor total
    const [valorMin, setValorMin] = useState("");
    const [valorMax, setValorMax] = useState("");

    // Status
    const [filtroStatus, setFiltroStatus] = useState("");

    // Período
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");


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
                aditional_id: m.aditional_id,
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
                pertence: m.pertence,
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


    // Função que carrega a lista de Vendas
    async function LoadVendas() {
        try {
            const resposta = await axios.get(
                `${API_URL}/sales/buscar-vendas`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const listaVendas = resposta.data.map((Venda) => ({
                id: Venda.id,
                funcionario: Venda.usuario_id,
                valor: Number(Venda.valor_total),
                subtotal: Number(Venda.subtotal),
                status: Venda.status,
                // Data original (usar nos filtros)
                dataO: Venda.created_at,

                // Data formatada (usar na tabela)
                data: new Date(Venda.created_at).toLocaleDateString("pt-BR"),

            }));

            setVendas(listaVendas);
        } catch (err) {
            alert(err);

            if (err.response?.status === 401) {
                navigate("/login");
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

    // Registrar novo custo
    async function CriarCusto() {

        try {

            await axios.post(
                `${API_URL}/sales/registrar-custo-auto`,
                {
                    aditional_id: VendaAberto.id,
                    tipo: tipo,
                    descricao: descricao,
                    quantidade: Number(quantidade),
                    valor: Number(valor),
                    pertence: "Venda",
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

    async function ApagarCusto(id_custo) {
        try {
            const resposta = await axios.delete(
                `${API_URL}/sales/apagar-custo/${id_custo}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            await LoadProdInVenda(VendaAberto.id)
            await LoadMovimentacoes()

        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }


    //Funcao que verifica o status de uma Venda para abri o modo de vizualização corretamete
    function AbrirVenda(status) {
        if (status == "PENDENTE") {
            setActiveVendas("pendente");
            LoadMovimentacoes();
            LoadUsuario();
            LoadProdutos();
        } else if (status == "FINALIZADO") {
            setActiveVendas("finalizado");
            LoadUsuario();
            LoadProdutos();
        } else {
            setActiveVendas("cancelado");
            LoadUsuario();
            LoadProdutos();
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
            // cria uma cosnt da Venda atual e manda essa vend para verificação
            setVendaAberto(VendaAtual);
            LoadProdInVenda(VendaAtual.id);
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    //Fução que da inicio a uma nova Venda
    async function IniciarNovaVenda() {
        try {
            const resposta = await axios.post(
                `${API_URL}/sales/criar-venda`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const id_Venda = resposta.data.id_venda
            // pega o id da Venda iniciada e passa para a funcao
            await BuscarVenda(id_Venda)
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    async function CreateProdInVenda(id_Venda, id_prod, quant) {
        try {
            const resposta = await axios.post(
                `${API_URL}/sales/adicionar-item/${id_Venda}`,
                {
                    "produto_id": id_prod,
                    "quantidade": quant
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            await LoadProdInVenda(VendaAberto.id)

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

    async function removeProdInVenda(id_prod) {
        try {
            const resposta = await axios.post(
                `${API_URL}/sales/remover-item/${id_prod}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            await LoadProdInVenda(VendaAberto.id)

        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    async function CancelVenda(id_Venda) {
        try {
            const resposta = await axios.post(
                `${API_URL}/sales/cancelar-venda/${id_Venda}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )


        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    async function FinalVenda(id_Venda) {
        try {
            const resposta = await axios.post(
                `${API_URL}/sales/finalizar-venda/${id_Venda}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )


        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }


    useEffect(() => {
        LoadUsers()
        LoadVendas()
        LoadMovimentacoes()
    }, [])


    // const Vendas = [
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


    //cria uma constante de registros 
    const registros = movimentacoes
        .filter((mov) => mov.aditional_id === VendaAberto.id && mov.pertence === "Venda")
        .map((mov) => ({
            ...mov,

            nome_produto: products.find(
                (produto) => produto.id === mov.produto_id
            )?.nome || "Produto não encontrado",

            nome_usuario: usuarios.find(
                (usuario) => usuario.id === mov.usuario_id
            )?.nome || "Usuário não encontrado",
        }));

    // Cria uma lista de tipos de custos únicos a partir dos registros
    const tiposCustos = [
        ...new Set(movimentacoes.map((registro) => registro.tipo))
    ];

    // edição da constante de Vendas para incluir o nome do funcionário
    const newVendas = Vendas.map((Venda) => ({
        ...Venda,

        nome_usuario: usuarios.find(
            (usuario) => Number(usuario.id) === Number(Venda.funcionario)
        )?.nome || "Usuário não encontrado",
    }));

    //Tem a função de filtrar os Vendas de acordo com os filtros aplicados
    const VendasFiltrados = newVendas.filter((Venda) => {

        // ======================
        // PESQUISA
        // ======================

        const texto = pesquisa.toLowerCase();

        const passouPesquisa =
            String(Venda.id).includes(texto) ||
            Venda.nome_usuario?.toLowerCase().includes(texto) ||
            Venda.status?.toLowerCase().includes(texto);

        if (!passouPesquisa) return false;


        // Funcionário
        if (
            filtroUsuario &&
            !Venda.nome_usuario
                .toLowerCase()
                .includes(filtroUsuario.toLowerCase())
        ) {
            return false;
        }

        // Valor mínimo
        if (
            valorMin !== "" &&
            Number(Venda.valor) < Number(valorMin)
        ) {
            return false;
        }

        // Valor máximo
        if (
            valorMax !== "" &&
            Number(Venda.valor) > Number(valorMax)
        ) {
            return false;
        }

        // Status
        if (
            filtroStatus &&
            Venda.status !== filtroStatus
        ) {
            return false;
        }



        // Data inicial
        if (dataInicial) {
            const dataVenda = new Date(Venda.dataO);
            const inicio = new Date(dataInicial);

            if (dataVenda < inicio) {
                return false;
            }
        }

        // Data final
        if (dataFinal) {
            const dataVenda = new Date(Venda.dataO);
            const fim = new Date(dataFinal);

            fim.setHours(23, 59, 59, 999);

            if (dataVenda > fim) {
                return false;
            }
        }

        return true;
    });


    // FUNÇÃO PARA CRIAR OS CARDS NO TOPO DA TELA
    const cards = useMemo(() => {

        let valorTotal = 0;
        let subtotalTotal = 0;

        let pendentes = 0;
        let finalizados = 0;
        let cancelados = 0;

        VendasFiltrados.forEach((Venda) => {

            valorTotal += Number(Venda.valor);
            subtotalTotal += Number(Venda.subtotal);

            if (Venda.status === "PENDENTE") {
                pendentes++;
            } else if (Venda.status === "FINALIZADO") {
                finalizados++;
            } else if (Venda.status === "CANCELADO") {
                cancelados++;
            }

        });

        return {

            valorTotal,
            subtotalTotal,

            pendentes,
            finalizados,
            cancelados,

            quantidade: VendasFiltrados.length,

            ticketMedio:
                VendasFiltrados.length > 0
                    ? valorTotal / VendasFiltrados.length
                    : 0

        };

    }, [VendasFiltrados]);


    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeVendas) {
            case "list":
                return (
                    <div className="min-h-screen bg-gray-100 py-10 px-6">

                        <div
                            className="bg-white rounded-2xl p-8"
                            style={{
                                bsales: "1px solid #d4d4d4",
                                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                            }}
                        >

                            <div className="flex justify-between items-center mb-8">

                                <div>

                                    <h2
                                        className="text-3xl font-bold"
                                        style={{ color: "#222" }}
                                    >
                                        Lista de Vendas
                                    </h2>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Visualize todas as Vendas cadastradas.
                                    </p>

                                </div>

                            </div>

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr
                                            style={{
                                                background: "#fafafa",
                                                bsalesBottom: "1px solid #d4d4d4",
                                            }}
                                        >
                                            <th className="p-3 text-left" style={{ color: "#222" }}>ID</th>
                                            <th className="p-3 text-left" style={{ color: "#222" }}>Funcionário</th>
                                            <th className="p-3 text-left" style={{ color: "#222" }}>Valor Total</th>
                                            <th className="p-3 text-left" style={{ color: "#222" }}>Subtotal</th>
                                            <th className="p-3 text-left" style={{ color: "#222" }}>Status</th>
                                            <th className="p-3 text-left" style={{ color: "#222" }}>Data</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {VendasFiltrados.map((Venda) => (

                                            <tr
                                                key={Venda.id}
                                                onClick={() => {
                                                    AbrirVenda(Venda.status);
                                                    BuscarVenda(Venda.id);
                                                }}
                                                style={{
                                                    cursor: "pointer",
                                                    bsalesBottom: "1px solid #ececec",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "#f8f8f8";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "white";
                                                }}
                                            >

                                                <td className="p-3" style={{ color: "#222" }}>{Venda.id}</td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    {Venda.nome_usuario}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    R$ {Number(Venda.valor).toFixed(2)}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    R$ {Number(Venda.subtotal).toFixed(2)}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    {Venda.status}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    {Venda.data}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>
                );

            case "new":
                return (

                    <div className="min-h-screen bg-gray-100 py-10 px-6">

                        <div
                            className="bg-white rounded-2xl p-8"
                            style={{
                                bsales: "1px solid #d4d4d4",
                                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                            }}
                        >

                            <div className="flex justify-between items-center mb-8">

                                <div>

                                    <h1
                                        className="text-3xl font-bold"
                                        style={{ color: "#222" }}
                                    >
                                        Criação de Vendas
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Inicie uma nova Venda.
                                    </p>

                                </div>

                                <button
                                    onClick={() => {
                                        setActiveVendas("list");
                                        LoadVendas();
                                    }}
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

                            <div
                                className="grid grid-cols-2 gap-8"
                                style={{
                                    height: "calc(100vh - 220px)",
                                }}
                            >

                                {/* Lado Esquerdo */}

                                <div>

                                    <div
                                        className="rounded-xl p-6 mb-6"
                                        style={{
                                            background: "#fafafa",
                                            bsales: "1px solid #d4d4d4",
                                        }}
                                    >

                                        <p
                                            className="font-semibold mb-4"
                                            style={{ color: "#333" }}
                                        >
                                            Funcionário Logado
                                        </p>

                                        <h2
                                            className="text-2xl font-bold"
                                            style={{ color: "#222" }}
                                        >
                                            {nomeFucio.nome}
                                        </h2>

                                    </div>

                                    <button
                                        onClick={async () => {
                                            await IniciarNovaVenda();
                                            setActiveVendas("pendente");
                                            await LoadMovimentacoes();
                                            LoadUsuario();
                                            LoadProdutos();
                                        }}
                                        className="px-6 py-3 rounded-lg text-white transition"
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
                                        Iniciar nova Venda
                                    </button>

                                </div>

                                {/* Lado Direito */}

                                <div
                                    className="overflow-y-auto rounded-xl"
                                    style={{
                                        bsales: "1px solid #d4d4d4",
                                        background: "#fff",
                                    }}
                                >

                                    <table className="w-full">

                                        <thead
                                            className="sticky top-0"
                                            style={{
                                                background: "#f8f8f8",
                                                bsalesBottom: "1px solid #d4d4d4",
                                            }}
                                        >
                                            <tr>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>ID</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>Produto</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>SKU</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>Tam.</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>Cor</th>
                                                <th className="p-3 text-center" style={{ color: "#333" }}>Estoque</th>
                                                <th className="p-3 text-right" style={{ color: "#333" }}>Preço</th>
                                                <th className="p-3 text-center" style={{ color: "#333" }}>Status</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>Data</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {products.map((produto, index) => (

                                                <tr
                                                    key={produto.id}
                                                    style={{
                                                        background: index % 2 === 0 ? "#fff" : "#fafafa",
                                                        bsalesBottom: "1px solid #ececec",
                                                        cursor: "pointer",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "#f3f4f6";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            index % 2 === 0 ? "#fff" : "#fafafa";
                                                    }}
                                                >

                                                    <td className="p-3" style={{ color: "#222" }}>
                                                        {produto.id}
                                                    </td>

                                                    <td className="p-3">

                                                        <div
                                                            className="font-semibold"
                                                            style={{ color: "#222" }}
                                                        >
                                                            {produto.nome}
                                                        </div>

                                                        <div
                                                            style={{
                                                                color: "#777",
                                                                fontSize: "12px",
                                                            }}
                                                        >
                                                            {produto.modelagem}
                                                        </div>

                                                    </td>

                                                    <td className="p-3" style={{ color: "#444" }}>
                                                        {produto.sku}
                                                    </td>

                                                    <td className="p-3" style={{ color: "#444" }}>
                                                        {produto.tamanho}
                                                    </td>

                                                    <td className="p-3" style={{ color: "#444" }}>
                                                        {produto.cor}
                                                    </td>

                                                    <td
                                                        className="p-3 text-center font-semibold"
                                                        style={{
                                                            color:
                                                                produto.estoque > 0
                                                                    ? "#15803d"
                                                                    : "#b91c1c",
                                                        }}
                                                    >
                                                        {produto.estoque}
                                                    </td>

                                                    <td
                                                        className="p-3 text-right font-bold"
                                                        style={{
                                                            color: "#15803d",
                                                        }}
                                                    >
                                                        R$ {Number(produto.preco).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 text-center">

                                                        <span
                                                            className="px-2 py-1 rounded-full text-xs font-semibold"
                                                            style={{
                                                                background:
                                                                    produto.status === "Ativo"
                                                                        ? "#dcfce7"
                                                                        : "#fee2e2",

                                                                color:
                                                                    produto.status === "Ativo"
                                                                        ? "#166534"
                                                                        : "#991b1b",
                                                            }}
                                                        >
                                                            {produto.status}
                                                        </span>

                                                    </td>

                                                    <td
                                                        className="p-3"
                                                        style={{
                                                            color: "#666",
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        {produto.data}
                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    </div>
                );



            case "pendente":
                return (
                    <div
                        className="min-h-screen"
                        style={{
                            background: "#f3f4f6",
                            padding: "30px",
                        }}
                    >

                        <button
                            onClick={() => {
                                setActiveVendas("list");
                                LoadVendas();
                            }}
                            className="px-5 py-2 rounded-lg text-white transition"
                            style={{
                                background: "#6b1f2b",
                                bsales: "none",
                                cursor: "pointer",
                                marginBottom: "20px",
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

                        <h1
                            className="text-3xl font-bold mb-6"
                            style={{
                                color: "#222",
                            }}
                        >
                            Edição de Vendas
                        </h1>

                        <div
                            style={{
                                display: "flex",
                                height: "calc(100vh - 180px)",
                                background: "#fff",
                                bsales: "1px solid #d4d4d4",
                                bsalesRadius: "16px",
                                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                                overflow: "hidden",
                            }}
                        >

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    bsalesRight: "1px solid #e5e7eb",
                                    padding: "25px",
                                    background: "#fff",
                                }}
                            >
                                {/* Tela Esquerda */}

                                <div>

                                    <div
                                        className="flex justify-between items-center mb-6"
                                    >

                                        <div>

                                            <h2
                                                className="text-2xl font-bold"
                                                style={{ color: "#222" }}
                                            >
                                                Venda #{VendaAberto.id}
                                            </h2>

                                            <p style={{ color: "#666" }}>
                                                Status:
                                                <span
                                                    className="ml-2 px-2 py-1 rounded-full text-xs font-semibold"
                                                    style={{
                                                        background:
                                                            VendaAberto.status === "Pendente"
                                                                ? "#fef3c7"
                                                                : VendaAberto.status === "Finalizado"
                                                                    ? "#dcfce7"
                                                                    : "#fee2e2",

                                                        color:
                                                            VendaAberto.status === "Pendente"
                                                                ? "#92400e"
                                                                : VendaAberto.status === "Finalizado"
                                                                    ? "#166534"
                                                                    : "#991b1b",
                                                    }}
                                                >
                                                    {VendaAberto.status}
                                                </span>
                                            </p>

                                        </div>

                                    </div>

                                    <h3
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Peças do Venda
                                    </h3>

                                    <div
                                        className="rounded-xl overflow-hidden mb-6"
                                        style={{
                                            bsales: "1px solid #d4d4d4",
                                        }}
                                    >

                                        <table className="w-full">

                                            <thead
                                                style={{
                                                    background: "#f8f8f8",
                                                }}
                                            >
                                                <tr>
                                                    <th className="p-3 text-left" style={{ color: "#333" }}>Produto</th>
                                                    <th className="p-3 text-center" style={{ color: "#333" }}>ID</th>
                                                    <th className="p-3 text-center" style={{ color: "#333" }}>Qtd.</th>
                                                    <th className="p-3 text-right" style={{ color: "#333" }}>Preço</th>
                                                    <th className="p-3 text-center" style={{ color: "#333" }}>Remover</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {itensVenda.map((itens, index) => {

                                                    const produto = products.find(
                                                        (produto) => produto.id === itens.produto_id
                                                    );

                                                    return (

                                                        <tr
                                                            key={itens.id}
                                                            style={{
                                                                background: index % 2 === 0 ? "#fff" : "#fafafa",
                                                                bsalesBottom: "1px solid #ececec",
                                                            }}
                                                        >

                                                            <td className="p-3" style={{ color: "#222", fontWeight: 600 }}>
                                                                {produto?.nome}
                                                            </td>

                                                            <td className="p-3 text-center" style={{ color: "#444" }}>
                                                                {itens.produto_id}
                                                            </td>

                                                            <td className="p-3 text-center" style={{ color: "#222" }}>
                                                                {itens.quantidade}
                                                            </td>

                                                            <td className="p-3 text-right font-bold" style={{ color: "#15803d" }}>
                                                                R$ {Number(itens.preco_unitario).toFixed(2)}
                                                            </td>

                                                            <td className="p-3 text-center">

                                                                <button
                                                                    onClick={async () => {
                                                                        await removeProdInVenda(itens.id);
                                                                        await BuscarVenda(VendaAberto.id);
                                                                    }}
                                                                    className="w-8 h-8 rounded-full text-white font-bold"
                                                                    style={{
                                                                        background: "#b91c1c",
                                                                        bsales: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    −
                                                                </button>

                                                            </td>

                                                        </tr>

                                                    );

                                                })}

                                            </tbody>

                                        </table>

                                    </div>

                                    <div className="flex justify-between mb-6">

                                        <h3
                                            className="text-xl font-bold"
                                            style={{ color: "#222" }}
                                        >
                                            Subtotal
                                        </h3>



                                        <h3
                                            className="text-xl font-bold"
                                            style={{ color: "#15803d" }}
                                        >
                                            R$ {Number(VendaAberto.subtotal).toFixed(2)}
                                        </h3>

                                    </div>

                                    <div className="flex justify-between mb-6">
                                        <h3
                                            className="text-xl font-bold mb-3"
                                            style={{ color: "#222" }}
                                        >
                                            Valor Taxa R$ {Number(VendaAberto.valor_taxa).toFixed(2)}
                                        </h3>

                                        <input
                                            type="number"
                                            value={valor}
                                            onChange={(e) => setValor(e.target.value)}
                                            className="rounded-lg px-5 py-1 transition"
                                            style={{
                                                background: "#fafafa",
                                                border: "1px solid #d4d4d4",
                                                color: "#222",
                                            }}
                                        />

                                        <button
                                            // onClick={() => setshowConfirm(true)}
                                            className="px-6 py-1 rounded-lg text-white font-semibold transition"
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
                                            Inserir Taxa
                                        </button>

                                    </div>

                                    <h3
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Valor Desconto R$ {Number(VendaAberto.valor_desconto).toFixed(2)}
                                    </h3>

                                    <h3
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Frete R$ {Number(VendaAberto.frete).toFixed(2)}
                                    </h3>

                                    <h3
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Custos adicionais
                                    </h3>

                                    <div
                                        className="rounded-xl overflow-hidden"
                                        style={{
                                            bsales: "1px solid #d4d4d4",
                                        }}
                                    >

                                        <table className="w-full">

                                            <thead
                                                style={{
                                                    background: "#f8f8f8",
                                                }}
                                            >
                                                <tr>
                                                    <th className="p-3 text-left" style={{ color: "#333" }}>ID</th>
                                                    <th className="p-3 text-left" style={{ color: "#333" }}>Tipo</th>
                                                    <th className="p-3 text-right" style={{ color: "#333" }}>Valor</th>
                                                    <th className="p-3 text-center" style={{ color: "#333" }}>Qtd.</th>
                                                    <th className="p-3 text-center" style={{ color: "#333" }}>Vencimento</th>
                                                    <th className="p-3 text-center" style={{ color: "#333" }}>Status</th>
                                                    <th className="p-3 text-center" style={{ color: "#333" }}>Remover</th>

                                                </tr>
                                            </thead>

                                            <tbody>

                                                {registros.map((registro, index) => (

                                                    <tr
                                                        key={registro.id}
                                                        style={{
                                                            background: index % 2 === 0 ? "#fff" : "#fafafa",
                                                            bsalesBottom: "1px solid #ececec",
                                                        }}
                                                    >

                                                        <td className="p-3" style={{ color: "#222" }}>{registro.id}</td>

                                                        <td className="p-3" style={{ color: "#222" }}>{registro.tipo}</td>

                                                        <td className="p-3 text-right font-bold" style={{ color: "#15803d" }}>
                                                            R$ {Number(registro.valor).toFixed(2)}
                                                        </td>

                                                        <td className="p-3 text-center" style={{ color: "#222" }}>
                                                            {registro.quantidade}
                                                        </td>

                                                        <td className="p-3 text-center" style={{ color: "#666" }}>
                                                            {registro.vencimentoFormatado}
                                                        </td>

                                                        <td className="p-3 text-center">

                                                            <span
                                                                className="px-2 py-1 rounded-full text-xs font-semibold"
                                                                style={{
                                                                    background:
                                                                        registro.status === "Pago"
                                                                            ? "#dcfce7"
                                                                            : "#fee2e2",

                                                                    color:
                                                                        registro.status === "Pago"
                                                                            ? "#166534"
                                                                            : "#991b1b",
                                                                }}
                                                            >
                                                                {registro.status}
                                                            </span>

                                                        </td>

                                                        <td className="p-3 text-center">

                                                            <button
                                                                onClick={async () => {
                                                                    await ApagarCusto(registro.id);
                                                                    await BuscarVenda(VendaAberto.id);
                                                                    await LoadMovimentacoes();
                                                                }}
                                                                className="w-8 h-8 rounded-full text-white font-bold"
                                                                style={{
                                                                    background: "#b91c1c",
                                                                    bsales: "none",
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                −
                                                            </button>

                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                    <div className="flex justify-between items-center mt-8">

                                        <div>

                                            <p
                                                className="text-lg font-semibold"
                                                style={{ color: "#444" }}
                                            >
                                                Valor Total
                                            </p>

                                            <h2
                                                className="text-3xl font-bold"
                                                style={{ color: "#15803d" }}
                                            >
                                                R$ {Number(VendaAberto.valor_total).toFixed(2)}
                                            </h2>

                                        </div>

                                        <div className="flex gap-3">

                                            <button
                                                onClick={async () => {
                                                    setShowConfirmFinal(true);
                                                }}
                                                className="px-6 py-3 rounded-lg text-white font-semibold"
                                                style={{
                                                    background: "#15803d",
                                                    bsales: "none",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Finalizar
                                            </button>

                                            {/* MODAL DE CONFIRMAÇÃO */}

                                            {
                                                showConfirmFinal && (

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
                                                                bsalesRadius: "10px",
                                                                padding: "20px",
                                                                boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                                                textAlign: "center"
                                                            }}
                                                        >


                                                            {
                                                                loadingConfirmFinal ? (

                                                                    <div className="flex flex-col items-center gap-4 py-5">

                                                                        <div
                                                                            className="w-12 h-12 bsales-4 bsales-slate-300 bsales-t-blue-500 rounded-full animate-spin"
                                                                        ></div>


                                                                        <p className="text-slate-700">
                                                                            Finalizando...
                                                                        </p>


                                                                    </div>


                                                                ) : (


                                                                    <>


                                                                        <h2 className="text-lg font-semibold mb-5">
                                                                            Deseja finalizar este Venda?
                                                                        </h2>

                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "space-between"
                                                                            }}
                                                                        >

                                                                            <button
                                                                                onClick={() => setShowConfirmFinal(false)}
                                                                            >
                                                                                Cancelar
                                                                            </button>

                                                                            <button
                                                                                onClick={async () => {
                                                                                    setLoadingConfirmFinal(true);
                                                                                    await FinalVenda(VendaAberto.id);
                                                                                    await BuscarVenda(VendaAberto.id);
                                                                                    await LoadMovimentacoes();
                                                                                    setActiveVendas("finalizado");
                                                                                    LoadUsuario();
                                                                                    LoadProdutos();
                                                                                    setLoadingConfirmFinal(false);
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

                                            <button
                                                onClick={async () => {
                                                    setShowConfirmCancel(true);
                                                }}
                                                className="px-6 py-3 rounded-lg text-white font-semibold"
                                                style={{
                                                    background: "#b91c1c",
                                                    bsales: "none",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Cancelar
                                            </button>

                                            {/* MODAL DE CONFIRMAÇÃO */}

                                            {
                                                showConfirmCancel && (

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
                                                                bsalesRadius: "10px",
                                                                padding: "20px",
                                                                boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                                                textAlign: "center"
                                                            }}
                                                        >


                                                            {
                                                                loadingConfirmCancel ? (

                                                                    <div className="flex flex-col items-center gap-4 py-5">

                                                                        <div
                                                                            className="w-12 h-12 bsales-4 bsales-slate-300 bsales-t-blue-500 rounded-full animate-spin"
                                                                        ></div>


                                                                        <p className="text-slate-700">
                                                                            Cancelando...
                                                                        </p>


                                                                    </div>


                                                                ) : (


                                                                    <>


                                                                        <h2 className="text-lg font-semibold mb-5">
                                                                            Deseja cancelar este Venda?
                                                                        </h2>

                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "space-between"
                                                                            }}
                                                                        >

                                                                            <button
                                                                                onClick={() => setShowConfirmCancel(false)}
                                                                            >
                                                                                Cancelar
                                                                            </button>

                                                                            <button
                                                                                onClick={async () => {
                                                                                    setLoadingConfirmCancel(true);
                                                                                    await CancelVenda(VendaAberto.id);
                                                                                    await BuscarVenda(VendaAberto.id);
                                                                                    await LoadMovimentacoes();
                                                                                    setActiveVendas("cancelado");
                                                                                    LoadUsuario();
                                                                                    LoadProdutos();
                                                                                    setLoadingConfirmCancel(false);
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


                                        </div>

                                    </div>

                                </div>

                                <div
                                    className="mt-8 rounded-2xl p-6"
                                    style={{
                                        background: "#fafafa",
                                        bsales: "1px solid #d4d4d4",
                                    }}
                                >

                                    <h2
                                        className="text-2xl font-bold mb-6"
                                        style={{ color: "#222" }}
                                    >
                                        Cadastro Rápido de Custos
                                    </h2>

                                    {/* TIPO */}
                                    <div className="mb-4">

                                        <p
                                            className="mb-2 font-medium"
                                            style={{ color: "#444" }}
                                        >
                                            Tipo do Custo
                                        </p>

                                        <input
                                            list="tiposCustos"
                                            type="text"
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3"
                                            style={{
                                                bsales: "1px solid #d4d4d4",
                                                background: "#fff",
                                                color: "#222",
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

                                    {/* DESCRIÇÃO */}
                                    <div className="mb-4">

                                        <p
                                            className="mb-2 font-medium"
                                            style={{ color: "#444" }}
                                        >
                                            Descrição
                                        </p>

                                        <input
                                            type="text"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3"
                                            style={{
                                                bsales: "1px solid #d4d4d4",
                                                background: "#fff",
                                                color: "#222",
                                            }}
                                        />

                                    </div>

                                    <div className="grid grid-cols-2 gap-4">

                                        {/* QUANTIDADE */}
                                        <div>

                                            <p
                                                className="mb-2 font-medium"
                                                style={{ color: "#444" }}
                                            >
                                                Quantidade
                                            </p>

                                            <input
                                                type="number"
                                                value={quant}
                                                onChange={(e) => setQuantidadeS(e.target.value)}
                                                className="w-full rounded-lg px-4 py-3"
                                                style={{
                                                    bsales: "1px solid #d4d4d4",
                                                    background: "#fff",
                                                    color: "#222",
                                                }}
                                            />

                                        </div>

                                        {/* VALOR */}
                                        <div>

                                            <p
                                                className="mb-2 font-medium"
                                                style={{ color: "#444" }}
                                            >
                                                Valor
                                            </p>

                                            <input
                                                type="number"
                                                value={valor}
                                                onChange={(e) => setValor(e.target.value)}
                                                className="w-full rounded-lg px-4 py-3"
                                                style={{
                                                    bsales: "1px solid #d4d4d4",
                                                    background: "#fff",
                                                    color: "#222",
                                                }}
                                            />

                                        </div>

                                        {/* VENCIMENTO */}
                                        <div>

                                            <p
                                                className="mb-2 font-medium"
                                                style={{ color: "#444" }}
                                            >
                                                Data de Vencimento
                                            </p>

                                            <input
                                                type="date"
                                                value={vencimento}
                                                onChange={(e) => setVencimento(e.target.value)}
                                                className="w-full rounded-lg px-4 py-3"
                                                style={{
                                                    bsales: "1px solid #d4d4d4",
                                                    background: "#fff",
                                                    color: "#222",
                                                }}
                                            />

                                        </div>

                                        {/* PARCELAS */}
                                        <div>

                                            <p
                                                className="mb-2 font-medium"
                                                style={{ color: "#444" }}
                                            >
                                                Parcelas
                                            </p>

                                            <input
                                                type="number"
                                                value={quantParcelas}
                                                onChange={(e) => setQuantParcelas(e.target.value)}
                                                className="w-full rounded-lg px-4 py-3"
                                                style={{
                                                    bsales: "1px solid #d4d4d4",
                                                    background: "#fff",
                                                    color: "#222",
                                                }}
                                            />

                                        </div>

                                    </div>

                                    <div className="flex justify-end mt-6">

                                        <button
                                            onClick={() => {
                                                setshowConfirm(true);
                                            }}
                                            className="px-6 py-3 rounded-lg text-white font-semibold transition"
                                            style={{
                                                background: "#6b1f2b",
                                                bsales: "none",
                                                cursor: "pointer",
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
                                                    bsalesRadius: "10px",
                                                    padding: "20px",
                                                    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                                    textAlign: "center"
                                                }}
                                            >


                                                {
                                                    loadingConfirm ? (

                                                        <div className="flex flex-col items-center gap-4 py-5">

                                                            <div
                                                                className="w-12 h-12 bsales-4 bsales-slate-300 bsales-t-blue-500 rounded-full animate-spin"
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
                                                                        BuscarVenda(VendaAberto.id);

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
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    padding: "10px"
                                }}
                            >



                                {/* Tela Direita */}

                                <div
                                    className="overflow-y-auto rounded-xl"
                                    style={{
                                        bsales: "1px solid #d4d4d4",
                                        background: "#fff",
                                    }}
                                >

                                    <table className="w-full">

                                        <thead
                                            className="sticky top-0"
                                            style={{
                                                background: "#f8f8f8",
                                                bsalesBottom: "1px solid #d4d4d4",
                                            }}
                                        >
                                            <tr>
                                                <th className="p-3 text-center" style={{ color: "#333" }}>+</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>Produto</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>SKU</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>Tam.</th>
                                                <th className="p-3 text-left" style={{ color: "#333" }}>Cor</th>
                                                <th className="p-3 text-center" style={{ color: "#333" }}>Estoque</th>
                                                <th className="p-3 text-right" style={{ color: "#333" }}>Preço</th>
                                                <th className="p-3 text-center" style={{ color: "#333" }}>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {products.map((produto, index) => (

                                                <tr
                                                    key={produto.id}
                                                    style={{
                                                        background: index % 2 === 0 ? "#fff" : "#fafafa",
                                                        bsalesBottom: "1px solid #ececec",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "#f3f4f6";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            index % 2 === 0 ? "#fff" : "#fafafa";
                                                    }}
                                                >

                                                    <td className="p-3 text-center">

                                                        <button
                                                            onClick={() => {
                                                                setProdutoSelecionado(produto);
                                                                setQuantidade(1);
                                                                setShowModal(true);
                                                            }}
                                                            className="w-8 h-8 rounded-full text-white font-bold transition"
                                                            style={{
                                                                background: "#6b1f2b",
                                                                bsales: "none",
                                                                cursor: "pointer",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = "#581822";
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = "#6b1f2b";
                                                            }}
                                                        >
                                                            +
                                                        </button>

                                                    </td>

                                                    <td className="p-3">

                                                        <div
                                                            className="font-semibold"
                                                            style={{ color: "#222" }}
                                                        >
                                                            {produto.nome}
                                                        </div>

                                                        <div
                                                            style={{
                                                                color: "#777",
                                                                fontSize: "12px",
                                                            }}
                                                        >
                                                            {produto.modelagem}
                                                        </div>

                                                    </td>

                                                    <td className="p-3" style={{ color: "#444" }}>
                                                        {produto.sku}
                                                    </td>

                                                    <td className="p-3" style={{ color: "#444" }}>
                                                        {produto.tamanho}
                                                    </td>

                                                    <td className="p-3" style={{ color: "#444" }}>
                                                        {produto.cor}
                                                    </td>

                                                    <td
                                                        className="p-3 text-center font-semibold"
                                                        style={{
                                                            color:
                                                                produto.estoque > 0
                                                                    ? "#15803d"
                                                                    : "#b91c1c",
                                                        }}
                                                    >
                                                        {produto.estoque}
                                                    </td>

                                                    <td
                                                        className="p-3 text-right font-bold"
                                                        style={{
                                                            color: "#15803d",
                                                        }}
                                                    >
                                                        R$ {Number(produto.preco).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 text-center">

                                                        <span
                                                            className="px-2 py-1 rounded-full text-xs font-semibold"
                                                            style={{
                                                                background:
                                                                    produto.status === "Ativo"
                                                                        ? "#dcfce7"
                                                                        : "#fee2e2",

                                                                color:
                                                                    produto.status === "Ativo"
                                                                        ? "#166534"
                                                                        : "#991b1b",
                                                            }}
                                                        >
                                                            {produto.status}
                                                        </span>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>
                        {/* Abaixo tem um modal que é uma tela flutuante de confirmação */}

                        {
                            showModal && (

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
                                            bsalesRadius: "10px",
                                            padding: "20px",
                                            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                            textAlign: "center"
                                        }}
                                    >

                                        {
                                            loadingModal ? (

                                                <div className="flex flex-col items-center gap-4 py-5">

                                                    <div
                                                        className="w-12 h-12 bsales-4 bsales-slate-300 bsales-t-blue-500 rounded-full animate-spin"
                                                    ></div>

                                                    <p className="text-slate-700">
                                                        Adicionando produto...
                                                    </p>

                                                </div>

                                            ) : (

                                                <>

                                                    <h2 className="text-lg font-semibold mb-5">
                                                        Adicionar Produto
                                                    </h2>

                                                    <p className="mb-4">
                                                        Produto:
                                                        <strong> {produtoSelecionado.nome}</strong>
                                                    </p>

                                                    <p>Quantidade</p>

                                                    <input
                                                        type="number"
                                                        value={quantidade}
                                                        min={1}
                                                        onChange={(e) => setQuantidade(e.target.value)}
                                                        style={{
                                                            width: "100%",
                                                            padding: "8px",
                                                            marginBottom: "20px"
                                                        }}
                                                    />

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between"
                                                        }}
                                                    >

                                                        <button
                                                            onClick={() => setShowModal(false)}
                                                        >
                                                            Cancelar
                                                        </button>

                                                        <button
                                                            onClick={async () => {

                                                                try {

                                                                    setLoadingModal(true);

                                                                    await CreateProdInVenda(
                                                                        VendaAberto.id,
                                                                        produtoSelecionado.id,
                                                                        quantidade
                                                                    );

                                                                    await BuscarVenda(VendaAberto.id);

                                                                    setShowModal(false);

                                                                } finally {

                                                                    setLoadingModal(false);

                                                                }

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

                        {/* primeira div baerta */}
                    </div>
                )

            case "finalizado":
                return (
                    <div className="min-h-screen bg-gray-100 py-10 px-6">

                        <div
                            className="w-full bg-white rounded-2xl p-8"
                            style={{
                                bsales: "1px solid #d4d4d4",
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
                                        Vendas finalizadas
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Visualização dos produtos, custos e valores do Venda.
                                    </p>
                                </div>


                                <button
                                    onClick={() => {
                                        setActiveVendas("list");
                                        LoadVendas();
                                    }}
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



                            <div
                                className="grid grid-cols-2 gap-6"
                                style={{
                                    height: "calc(100vh - 220px)"
                                }}
                            >


                                {/* Lado esquerdo */}
                                <div
                                    className="overflow-y-auto pr-4"
                                    style={{
                                        bsalesRight: "1px solid #d4d4d4"
                                    }}
                                >

                                    <div className="mb-5">

                                        <p
                                            className="font-semibold"
                                            style={{ color: "#333" }}
                                        >
                                            Status: {VendaAberto.status}
                                        </p>

                                        <p
                                            style={{ color: "#666" }}
                                        >
                                            ID Venda: {VendaAberto.id}
                                        </p>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Produtos do Venda
                                    </h2>


                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead>
                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        bsalesBottom: "1px solid #d4d4d4"
                                                    }}
                                                >
                                                    <th className="p-3 text-left">Nome</th>
                                                    <th className="p-3 text-left">ID Produto</th>
                                                    <th className="p-3 text-left">Quantidade</th>
                                                    <th className="p-3 text-left">Preço</th>
                                                </tr>
                                            </thead>


                                            <tbody>

                                                {itensVenda.map((itens) => {

                                                    const produto = products.find(
                                                        (produto) => produto.id === itens.produto_id
                                                    );


                                                    return (

                                                        <tr
                                                            key={itens.id}
                                                            style={{
                                                                bsalesBottom: "1px solid #eee"
                                                            }}
                                                        >

                                                            <td className="p-3">
                                                                {produto?.nome}
                                                            </td>

                                                            <td className="p-3">
                                                                {itens.produto_id}
                                                            </td>

                                                            <td className="p-3">
                                                                {itens.quantidade}
                                                            </td>

                                                            <td className="p-3">
                                                                R$ {itens.preco_unitario}
                                                            </td>


                                                        </tr>
                                                    );
                                                })}


                                            </tbody>

                                        </table>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mt-6"
                                        style={{ color: "#222" }}
                                    >
                                        Subtotal: R$ {VendaAberto.subtotal}
                                    </h2>




                                    <h2
                                        className="text-xl font-bold mt-8 mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Custos adicionais
                                    </h2>



                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead>

                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        bsalesBottom: "1px solid #d4d4d4"
                                                    }}
                                                >
                                                    <th className="p-3 text-left">ID</th>
                                                    <th className="p-3 text-left">Tipo</th>
                                                    <th className="p-3 text-left">Valor</th>
                                                    <th className="p-3 text-left">Quantidade</th>
                                                    <th className="p-3 text-left">Vencimento</th>
                                                    <th className="p-3 text-left">Status</th>
                                                </tr>

                                            </thead>


                                            <tbody>

                                                {registros.map((registro) => (

                                                    <tr
                                                        key={registro.id}
                                                        style={{
                                                            bsalesBottom: "1px solid #eee"
                                                        }}
                                                    >

                                                        <td className="p-3">
                                                            {registro.id}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.tipo}
                                                        </td>

                                                        <td className="p-3">
                                                            R$ {Number(registro.valor).toFixed(2)}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.quantidade}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.vencimentoFormatado}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.status}
                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>


                                        </table>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mt-6"
                                        style={{ color: "#222" }}
                                    >
                                        Valor total: R$ {VendaAberto.valor_total}
                                    </h2>



                                </div>





                                {/* Lado direito */}
                                <div className="overflow-y-auto">


                                    <h2
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Produtos cadastrados
                                    </h2>


                                    <div className="overflow-x-auto">


                                        <table className="w-full text-sm">


                                            <thead>

                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        bsalesBottom: "1px solid #d4d4d4"
                                                    }}
                                                >

                                                    <th className="p-3 text-left">Nome</th>
                                                    <th className="p-3 text-left">Código</th>
                                                    <th className="p-3 text-left">Estoque</th>
                                                    <th className="p-3 text-left">Preço</th>
                                                    <th className="p-3 text-left">ID</th>
                                                    <th className="p-3 text-left">Status</th>
                                                    <th className="p-3 text-left">Criação</th>
                                                    <th className="p-3 text-left">Atualização</th>

                                                </tr>

                                            </thead>



                                            <tbody>


                                                {products.map((produto) => (

                                                    <tr
                                                        key={produto.id}
                                                        style={{
                                                            bsalesBottom: "1px solid #eee"
                                                        }}
                                                    >

                                                        <td className="p-3">
                                                            {produto.nome}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.cod}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.estoque}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.preco}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.id}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.status}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.data}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.datatualiza}
                                                        </td>

                                                    </tr>

                                                ))}


                                            </tbody>


                                        </table>


                                    </div>


                                </div>


                            </div>


                        </div>

                    </div>
                );

            case "cancelado":
                return (
                    <div className="min-h-screen bg-gray-100 py-10 px-6">

                        <div
                            className="w-full bg-white rounded-2xl p-8"
                            style={{
                                bsales: "1px solid #d4d4d4",
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
                                        Vendas finalizadas
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Visualização dos produtos, custos e valores do Venda.
                                    </p>
                                </div>


                                <button
                                    onClick={() => {
                                        setActiveVendas("list");
                                        LoadVendas();
                                    }}
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



                            <div
                                className="grid grid-cols-2 gap-6"
                                style={{
                                    height: "calc(100vh - 220px)"
                                }}
                            >


                                {/* Lado esquerdo */}
                                <div
                                    className="overflow-y-auto pr-4"
                                    style={{
                                        bsalesRight: "1px solid #d4d4d4"
                                    }}
                                >

                                    <div className="mb-5">

                                        <p
                                            className="font-semibold"
                                            style={{ color: "#333" }}
                                        >
                                            Status: {VendaAberto.status}
                                        </p>

                                        <p
                                            style={{ color: "#666" }}
                                        >
                                            ID Venda: {VendaAberto.id}
                                        </p>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Produtos do Venda
                                    </h2>


                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead>
                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        bsalesBottom: "1px solid #d4d4d4"
                                                    }}
                                                >
                                                    <th className="p-3 text-left">Nome</th>
                                                    <th className="p-3 text-left">ID Produto</th>
                                                    <th className="p-3 text-left">Quantidade</th>
                                                    <th className="p-3 text-left">Preço</th>
                                                </tr>
                                            </thead>


                                            <tbody>

                                                {itensVenda.map((itens) => {

                                                    const produto = products.find(
                                                        (produto) => produto.id === itens.produto_id
                                                    );


                                                    return (

                                                        <tr
                                                            key={itens.id}
                                                            style={{
                                                                bsalesBottom: "1px solid #eee"
                                                            }}
                                                        >

                                                            <td className="p-3">
                                                                {produto?.nome}
                                                            </td>

                                                            <td className="p-3">
                                                                {itens.produto_id}
                                                            </td>

                                                            <td className="p-3">
                                                                {itens.quantidade}
                                                            </td>

                                                            <td className="p-3">
                                                                R$ {itens.preco_unitario}
                                                            </td>


                                                        </tr>
                                                    );
                                                })}


                                            </tbody>

                                        </table>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mt-6"
                                        style={{ color: "#222" }}
                                    >
                                        Subtotal: R$ {VendaAberto.subtotal}
                                    </h2>




                                    <h2
                                        className="text-xl font-bold mt-8 mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Custos adicionais
                                    </h2>



                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead>

                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        bsalesBottom: "1px solid #d4d4d4"
                                                    }}
                                                >
                                                    <th className="p-3 text-left">ID</th>
                                                    <th className="p-3 text-left">Tipo</th>
                                                    <th className="p-3 text-left">Valor</th>
                                                    <th className="p-3 text-left">Quantidade</th>
                                                    <th className="p-3 text-left">Vencimento</th>
                                                    <th className="p-3 text-left">Status</th>
                                                </tr>

                                            </thead>


                                            <tbody>

                                                {registros.map((registro) => (

                                                    <tr
                                                        key={registro.id}
                                                        style={{
                                                            bsalesBottom: "1px solid #eee"
                                                        }}
                                                    >

                                                        <td className="p-3">
                                                            {registro.id}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.tipo}
                                                        </td>

                                                        <td className="p-3">
                                                            R$ {Number(registro.valor).toFixed(2)}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.quantidade}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.vencimentoFormatado}
                                                        </td>

                                                        <td className="p-3">
                                                            {registro.status}
                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>


                                        </table>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mt-6"
                                        style={{ color: "#222" }}
                                    >
                                        Valor total: R$ {VendaAberto.valor_total}
                                    </h2>



                                </div>





                                {/* Lado direito */}
                                <div className="overflow-y-auto">


                                    <h2
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Produtos cadastrados
                                    </h2>


                                    <div className="overflow-x-auto">


                                        <table className="w-full text-sm">


                                            <thead>

                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        bsalesBottom: "1px solid #d4d4d4"
                                                    }}
                                                >

                                                    <th className="p-3 text-left">Nome</th>
                                                    <th className="p-3 text-left">Código</th>
                                                    <th className="p-3 text-left">Estoque</th>
                                                    <th className="p-3 text-left">Preço</th>
                                                    <th className="p-3 text-left">ID</th>
                                                    <th className="p-3 text-left">Status</th>
                                                    <th className="p-3 text-left">Criação</th>
                                                    <th className="p-3 text-left">Atualização</th>

                                                </tr>

                                            </thead>



                                            <tbody>


                                                {products.map((produto) => (

                                                    <tr
                                                        key={produto.id}
                                                        style={{
                                                            bsalesBottom: "1px solid #eee"
                                                        }}
                                                    >

                                                        <td className="p-3">
                                                            {produto.nome}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.cod}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.estoque}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.preco}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.id}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.status}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.data}
                                                        </td>

                                                        <td className="p-3">
                                                            {produto.datatualiza}
                                                        </td>

                                                    </tr>

                                                ))}


                                            </tbody>


                                        </table>


                                    </div>


                                </div>


                            </div>


                        </div>

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
    //                 bsales: "1px solid black",
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
                    bsalesBottom: "1px solid #d4d4d4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
            >
                {/* Botão Novo */}
                <button
                    onClick={() => {
                        setActiveVendas("new");
                        LoadProdutos();
                        LoadVendas();
                        LoadUsuario();
                    }}
                    className="px-4 py-2 rounded-md font-semibold text-white transition-all"
                    style={{
                        background: "#6b1f2b",
                        bsales: "none",
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
                    Vendas
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
                            bsalesRadius: "8px",
                            bsales: "1px solid #cfcfcf",
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
                        bsalesRadius: "8px",
                        bsales: "1px solid #cfcfcf",
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
                {/* CARDS */}

                <div className="grid grid-cols-4 gap-4 mb-6">

                    {/* Valor Total */}
                    <div
                        className="rounded-xl shadow p-5 text-white"
                        style={{
                            background: "#6b1f2b",
                        }}
                    >
                        <h3 className="text-sm opacity-80">
                            Valor Total
                        </h3>

                        <p className="text-3xl font-bold mt-2">
                            R$ {cards.valorTotal.toFixed(2)}
                        </p>

                        <span className="text-sm opacity-80">
                            {cards.quantidade} Vendas
                        </span>
                    </div>

                    {/* Status */}
                    <div
                        className="rounded-xl shadow p-5"
                        style={{
                            background: "#f0fdf4",
                        }}
                    >
                        <h3 className="text-gray-600 text-sm">
                            Status
                        </h3>

                        <p className="text-orange-700 font-semibold mt-2">
                            Pendentes: {cards.pendentes}
                        </p>

                        <p className="text-green-700">
                            Finalizados: {cards.finalizados}
                        </p>

                        <p className="text-red-700">
                            Cancelados: {cards.cancelados}
                        </p>
                    </div>

                    {/* Valores */}
                    <div
                        className="rounded-xl shadow p-5"
                        style={{
                            background: "#fff7ed",
                        }}
                    >
                        <h3 className="text-gray-600 text-sm">
                            Valores
                        </h3>

                        <p className="text-orange-700 font-semibold mt-2">
                            Subtotal: R$ {cards.subtotalTotal.toFixed(2)}
                        </p>

                        <p className="text-red-700">
                            Ticket Médio: R$ {cards.ticketMedio.toFixed(2)}
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
                            Total de Vendas
                        </p>

                        <p className="text-3xl font-bold text-indigo-700">
                            {cards.quantidade}
                        </p>
                    </div>

                </div>

                {renderContent()}

                {/* CRIA UM MODAL, JANELA FLUTUANTE QUE TEM FILTROS */}
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
                                width: "600px",
                                background: "#1f2937",
                                color: "white",
                                bsalesRadius: "12px",
                                padding: "25px",
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
                                    bsales: "none",
                                    color: "white",
                                    fontSize: "24px",
                                    cursor: "pointer"
                                }}
                            >
                                ×
                            </button>

                            <h2>Filtros</h2>

                            <hr style={{ marginBottom: "20px" }} />

                            {/* FUNCIONÁRIO */}

                            <p>Funcionário</p>

                            <input
                                type="text"
                                value={filtroUsuario}
                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            />

                            {/* VALOR */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px",
                                    marginBottom: "20px"
                                }}
                            >

                                <div>

                                    <p>Valor Total Mínimo</p>

                                    <input
                                        type="number"
                                        value={valorMin}
                                        onChange={(e) => setValorMin(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>

                                <div>

                                    <p>Valor Total Máximo</p>

                                    <input
                                        type="number"
                                        value={valorMax}
                                        onChange={(e) => setValorMax(e.target.value)}
                                        style={{ width: "100%" }}
                                    />

                                </div>

                            </div>

                            {/* STATUS */}

                            <p>Status</p>

                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            >

                                <option value="">Todos</option>
                                <option value="PENDENTE">Pendente</option>
                                <option value="FINALIZADO">Finalizado</option>
                                <option value="CANCELADO">Cancelado</option>

                            </select>

                            {/* PERÍODO */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "20px",
                                    marginBottom: "25px"
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

                                        setValorMin("");
                                        setValorMax("");

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

export default Vendas;