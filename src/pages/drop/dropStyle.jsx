import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"



function drops() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [movimentacoes, setMovimentacoes] = useState([])
    const [activeDrops, setActiveDrops] = useState("list");
    const [Drops, setDrops] = useState([]);
    const [products, setProducts] = useState([])
    const [nomeFucio, setFuncionario] = useState("")
    const [DropAberto, setDropAberto] = useState("")
    const [itensDrop, setItemDrop] = useState([])

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


    // Função que carrega a lista de Drops
    async function LoadDrops() {
        try {
            const resposta = await axios.get(
                `${API_URL}/order/buscar-drops`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const listaDrops = resposta.data.map((drop) => ({
                id: drop.id,
                funcionario: drop.usuario_id,
                valor: Number(drop.valor_total),
                subtotal: Number(drop.subtotal),
                status: drop.status,
                // Data original (usar nos filtros)
                dataO: drop.created_at,

                // Data formatada (usar na tabela)
                data: new Date(drop.created_at).toLocaleDateString("pt-BR"),

            }));

            setDrops(listaDrops);
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
                `${API_URL}/order/registrar-custo-auto`,
                {
                    aditional_id: DropAberto.id,
                    tipo: tipo,
                    descricao: descricao,
                    quantidade: Number(quantidade),
                    valor: Number(valor),
                    pertence: "DROP",
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
                `${API_URL}/order/apagar-custo/${id_custo}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            await LoadProdInDrop(DropAberto.id)
            await LoadMovimentacoes()

        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }


    //Funcao que verifica o status de uma Drop para abri o modo de vizualização corretamete
    function AbrirDrop(status) {
        if (status == "PENDENTE") {
            setActiveDrops("pendente");
            LoadMovimentacoes();
            LoadUsuario();
            LoadProdutos();
        } else if (status == "FINALIZADO") {
            setActiveDrops("finalizado");
            LoadUsuario();
            LoadProdutos();
        } else {
            setActiveDrops("cancelado");
            LoadUsuario();
            LoadProdutos();
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
            setDropAberto(DropAtual);
            LoadProdInDrop(DropAtual.id);
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    //Fução que da inicio a uma nova Drop
    async function IniciarNovaDrop() {
        try {
            const resposta = await axios.post(
                `${API_URL}/order/criar-drop`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const id_Drop = resposta.data.id_drop
            // pega o id da Drop iniciada e passa para a funcao
            BuscarDrop(id_Drop)
        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    async function CreateProdInDrop(id_Drop, id_prod, quant) {
        try {
            const resposta = await axios.post(
                `${API_URL}/order/adicionar-item/${id_Drop}`,
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

            await LoadProdInDrop(DropAberto.id)

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

    async function removeProdInDrop(id_prod) {
        try {
            const resposta = await axios.post(
                `${API_URL}/order/remover-item/${id_prod}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            await LoadProdInDrop(DropAberto.id)

        } catch (err) {
            alert(err)
            if (err.response?.status === 401) {
                navigate("/login")
            }
        }
    }

    async function CancelDrop(id_Drop) {
        try {
            const resposta = await axios.post(
                `${API_URL}/order/cancelar-drop/${id_Drop}`,
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

    async function FinalDrop(id_Drop) {
        try {
            const resposta = await axios.post(
                `${API_URL}/order/finalizar-drop/${id_Drop}`,
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
        LoadDrops()
        LoadMovimentacoes()
    }, [])


    // const Drops = [
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
        .filter((mov) => mov.aditional_id === DropAberto.id && mov.pertence === "DROP")
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

    // edição da constante de Drops para incluir o nome do funcionário
    const newDrops = Drops.map((drop) => ({
        ...drop,

        nome_usuario: usuarios.find(
            (usuario) => Number(usuario.id) === Number(drop.funcionario)
        )?.nome || "Usuário não encontrado",
    }));

    //Tem a função de filtrar os Drops de acordo com os filtros aplicados
    const dropsFiltrados = newDrops.filter((drop) => {

        // ======================
        // PESQUISA
        // ======================

        const texto = pesquisa.toLowerCase();

        const passouPesquisa =
            String(drop.id).includes(texto) ||
            drop.nome_usuario?.toLowerCase().includes(texto) ||
            drop.status?.toLowerCase().includes(texto);

        if (!passouPesquisa) return false;


        // Funcionário
        if (
            filtroUsuario &&
            !drop.nome_usuario
                .toLowerCase()
                .includes(filtroUsuario.toLowerCase())
        ) {
            return false;
        }

        // Valor mínimo
        if (
            valorMin !== "" &&
            Number(drop.valor) < Number(valorMin)
        ) {
            return false;
        }

        // Valor máximo
        if (
            valorMax !== "" &&
            Number(drop.valor) > Number(valorMax)
        ) {
            return false;
        }

        // Status
        if (
            filtroStatus &&
            drop.status !== filtroStatus
        ) {
            return false;
        }



        // Data inicial
        if (dataInicial) {
            const dataDrop = new Date(drop.dataO);
            const inicio = new Date(dataInicial);

            if (dataDrop < inicio) {
                return false;
            }
        }

        // Data final
        if (dataFinal) {
            const dataDrop = new Date(drop.dataO);
            const fim = new Date(dataFinal);

            fim.setHours(23, 59, 59, 999);

            if (dataDrop > fim) {
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

        dropsFiltrados.forEach((drop) => {

            valorTotal += Number(drop.valor);
            subtotalTotal += Number(drop.subtotal);

            if (drop.status === "PENDENTE") {
                pendentes++;
            } else if (drop.status === "FINALIZADO") {
                finalizados++;
            } else if (drop.status === "CANCELADO") {
                cancelados++;
            }

        });

        return {

            valorTotal,
            subtotalTotal,

            pendentes,
            finalizados,
            cancelados,

            quantidade: dropsFiltrados.length,

            ticketMedio:
                dropsFiltrados.length > 0
                    ? valorTotal / dropsFiltrados.length
                    : 0

        };

    }, [dropsFiltrados]);


    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeDrops) {
            case "list":
                return (
                    <div className="min-h-screen bg-gray-100 py-10 px-6">

                        <div
                            className="bg-white rounded-2xl p-8"
                            style={{
                                border: "1px solid #d4d4d4",
                                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                            }}
                        >

                            <div className="flex justify-between items-center mb-8">

                                <div>

                                    <h2
                                        className="text-3xl font-bold"
                                        style={{ color: "#222" }}
                                    >
                                        Lista de Reestoques
                                    </h2>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Visualize todos os Reestoques cadastrados.
                                    </p>

                                </div>

                            </div>

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr
                                            style={{
                                                background: "#fafafa",
                                                borderBottom: "1px solid #d4d4d4",
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

                                        {dropsFiltrados.map((drop) => (

                                            <tr
                                                key={drop.id}
                                                onClick={() => {
                                                    AbrirDrop(drop.status);
                                                    BuscarDrop(drop.id);
                                                }}
                                                style={{
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid #ececec",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "#f8f8f8";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "white";
                                                }}
                                            >

                                                <td className="p-3" style={{ color: "#222" }}>{drop.id}</td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    {drop.nome_usuario}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    R$ {Number(drop.valor).toFixed(2)}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    R$ {Number(drop.subtotal).toFixed(2)}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    {drop.status}
                                                </td>

                                                <td className="p-3" style={{ color: "#222" }}>
                                                    {drop.data}
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
                                border: "1px solid #d4d4d4",
                                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                            }}
                        >

                            <div className="flex justify-between items-center mb-8">

                                <div>

                                    <h1
                                        className="text-3xl font-bold"
                                        style={{ color: "#222" }}
                                    >
                                        Criação de Reestoque
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Inicie um novo Reestoque
                                    </p>

                                </div>

                                <button
                                    onClick={() => {
                                        setActiveDrops("list");
                                        LoadDrops();
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
                                            border: "1px solid #d4d4d4",
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
                                        onClick={() => {
                                            IniciarNovaDrop();
                                            setActiveDrops("pendente");
                                            LoadMovimentacoes();
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
                                        Iniciar novo Reestoque
                                    </button>

                                </div>

                                {/* Lado Direito */}

                                <div
                                    className="overflow-y-auto rounded-xl"
                                    style={{
                                        border: "1px solid #d4d4d4",
                                        background: "#fff",
                                    }}
                                >

                                    <table className="w-full">

                                        <thead
                                            className="sticky top-0"
                                            style={{
                                                background: "#f8f8f8",
                                                borderBottom: "1px solid #d4d4d4",
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
                                                        borderBottom: "1px solid #ececec",
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
                                setActiveDrops("list");
                                LoadDrops();
                            }}
                            className="px-5 py-2 rounded-lg text-white transition"
                            style={{
                                background: "#6b1f2b",
                                border: "none",
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
                            Edição de Reestoque
                        </h1>

                        <div
                            style={{
                                display: "flex",
                                height: "calc(100vh - 180px)",
                                background: "#fff",
                                border: "1px solid #d4d4d4",
                                borderRadius: "16px",
                                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                                overflow: "hidden",
                            }}
                        >

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    borderRight: "1px solid #e5e7eb",
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
                                                Reestoque #{DropAberto.id}
                                            </h2>

                                            <p style={{ color: "#666" }}>
                                                Status:
                                                <span
                                                    className="ml-2 px-2 py-1 rounded-full text-xs font-semibold"
                                                    style={{
                                                        background:
                                                            DropAberto.status === "Pendente"
                                                                ? "#fef3c7"
                                                                : DropAberto.status === "Finalizado"
                                                                    ? "#dcfce7"
                                                                    : "#fee2e2",

                                                        color:
                                                            DropAberto.status === "Pendente"
                                                                ? "#92400e"
                                                                : DropAberto.status === "Finalizado"
                                                                    ? "#166534"
                                                                    : "#991b1b",
                                                    }}
                                                >
                                                    {DropAberto.status}
                                                </span>
                                            </p>

                                        </div>

                                    </div>

                                    <h3
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Peças do Reestoque
                                    </h3>

                                    <div
                                        className="rounded-xl overflow-hidden mb-6"
                                        style={{
                                            border: "1px solid #d4d4d4",
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

                                                {itensDrop.map((itens, index) => {

                                                    const produto = products.find(
                                                        (produto) => produto.id === itens.produto_id
                                                    );

                                                    return (

                                                        <tr
                                                            key={itens.id}
                                                            style={{
                                                                background: index % 2 === 0 ? "#fff" : "#fafafa",
                                                                borderBottom: "1px solid #ececec",
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
                                                                        await removeProdInDrop(itens.id);
                                                                        await BuscarDrop(DropAberto.id);
                                                                    }}
                                                                    className="w-8 h-8 rounded-full text-white font-bold"
                                                                    style={{
                                                                        background: "#b91c1c",
                                                                        border: "none",
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
                                            R$ {Number(DropAberto.subtotal).toFixed(2)}
                                        </h3>

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
                                                R$ {Number(DropAberto.valor_total).toFixed(2)}
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
                                                    border: "none",
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
                                                                borderRadius: "10px",
                                                                padding: "20px",
                                                                boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                                                textAlign: "center"
                                                            }}
                                                        >


                                                            {
                                                                loadingConfirmFinal ? (

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
                                                                            Deseja finalizar este drop?
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
                                                                                    await FinalDrop(DropAberto.id);
                                                                                    await BuscarDrop(DropAberto.id);
                                                                                    await LoadMovimentacoes();
                                                                                    setActiveDrops("finalizado");
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
                                                    border: "none",
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
                                                                borderRadius: "10px",
                                                                padding: "20px",
                                                                boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                                                textAlign: "center"
                                                            }}
                                                        >


                                                            {
                                                                loadingConfirmCancel ? (

                                                                    <div className="flex flex-col items-center gap-4 py-5">

                                                                        <div
                                                                            className="w-12 h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin"
                                                                        ></div>


                                                                        <p className="text-slate-700">
                                                                            Cancelando...
                                                                        </p>


                                                                    </div>


                                                                ) : (


                                                                    <>


                                                                        <h2 className="text-lg font-semibold mb-5">
                                                                            Deseja cancelar este drop?
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
                                                                                    await CancelDrop(DropAberto.id);
                                                                                    await BuscarDrop(DropAberto.id);
                                                                                    await LoadMovimentacoes();
                                                                                    setActiveDrops("cancelado");
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
                                        border: "1px solid #d4d4d4",
                                        background: "#fff",
                                    }}
                                >

                                    <table className="w-full">

                                        <thead
                                            className="sticky top-0"
                                            style={{
                                                background: "#f8f8f8",
                                                borderBottom: "1px solid #d4d4d4",
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
                                                        borderBottom: "1px solid #ececec",
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
                                            borderRadius: "10px",
                                            padding: "20px",
                                            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                                            textAlign: "center"
                                        }}
                                    >

                                        {
                                            loadingModal ? (

                                                <div className="flex flex-col items-center gap-4 py-5">

                                                    <div
                                                        className="w-12 h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin"
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

                                                                    await CreateProdInDrop(
                                                                        DropAberto.id,
                                                                        produtoSelecionado.id,
                                                                        quantidade
                                                                    );

                                                                    await BuscarDrop(DropAberto.id);

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
                                        Reestoques finalizados
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Visualização dos produtos, custos e valores do Reestoque.
                                    </p>
                                </div>


                                <button
                                    onClick={() => {
                                        setActiveDrops("list");
                                        LoadDrops();
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
                                        borderRight: "1px solid #d4d4d4"
                                    }}
                                >

                                    <div className="mb-5">

                                        <p
                                            className="font-semibold"
                                            style={{ color: "#333" }}
                                        >
                                            Status: {DropAberto.status}
                                        </p>

                                        <p
                                            style={{ color: "#666" }}
                                        >
                                            ID Reestoque: {DropAberto.id}
                                        </p>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Produtos do Reestoque
                                    </h2>


                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead>
                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        borderBottom: "1px solid #d4d4d4"
                                                    }}
                                                >
                                                    <th className="p-3 text-left">Nome</th>
                                                    <th className="p-3 text-left">ID Produto</th>
                                                    <th className="p-3 text-left">Quantidade</th>
                                                    <th className="p-3 text-left">Preço</th>
                                                </tr>
                                            </thead>


                                            <tbody>

                                                {itensDrop.map((itens) => {

                                                    const produto = products.find(
                                                        (produto) => produto.id === itens.produto_id
                                                    );


                                                    return (

                                                        <tr
                                                            key={itens.id}
                                                            style={{
                                                                borderBottom: "1px solid #eee"
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
                                        Subtotal: R$ {DropAberto.subtotal}
                                    </h2>




                    



                                    <h2
                                        className="text-xl font-bold mt-6"
                                        style={{ color: "#222" }}
                                    >
                                        Valor total: R$ {DropAberto.valor_total}
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
                                                        borderBottom: "1px solid #d4d4d4"
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
                                                            borderBottom: "1px solid #eee"
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
                                        Reestoque Cancelado
                                    </h1>

                                    <p
                                        className="mt-1"
                                        style={{ color: "#666" }}
                                    >
                                        Visualização dos produtos, custos e valores do Reestoque
                                    </p>
                                </div>


                                <button
                                    onClick={() => {
                                        setActiveDrops("list");
                                        LoadDrops();
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
                                        borderRight: "1px solid #d4d4d4"
                                    }}
                                >

                                    <div className="mb-5">

                                        <p
                                            className="font-semibold"
                                            style={{ color: "#333" }}
                                        >
                                            Status: {DropAberto.status}
                                        </p>

                                        <p
                                            style={{ color: "#666" }}
                                        >
                                            ID Reestoque: {DropAberto.id}
                                        </p>

                                    </div>



                                    <h2
                                        className="text-xl font-bold mb-3"
                                        style={{ color: "#222" }}
                                    >
                                        Produtos do Restoque
                                    </h2>


                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead>
                                                <tr
                                                    style={{
                                                        background: "#fafafa",
                                                        borderBottom: "1px solid #d4d4d4"
                                                    }}
                                                >
                                                    <th className="p-3 text-left">Nome</th>
                                                    <th className="p-3 text-left">ID Produto</th>
                                                    <th className="p-3 text-left">Quantidade</th>
                                                    <th className="p-3 text-left">Preço</th>
                                                </tr>
                                            </thead>


                                            <tbody>

                                                {itensDrop.map((itens) => {

                                                    const produto = products.find(
                                                        (produto) => produto.id === itens.produto_id
                                                    );


                                                    return (

                                                        <tr
                                                            key={itens.id}
                                                            style={{
                                                                borderBottom: "1px solid #eee"
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
                                        Subtotal: R$ {DropAberto.subtotal}
                                    </h2>






                                    <h2
                                        className="text-xl font-bold mt-6"
                                        style={{ color: "#222" }}
                                    >
                                        Valor total: R$ {DropAberto.valor_total}
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
                                                        borderBottom: "1px solid #d4d4d4"
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
                                                            borderBottom: "1px solid #eee"
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
    //                 setActiveDrops("new");
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
    //         <h1>Drops</h1>
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
                        setActiveDrops("new");
                        LoadProdutos();
                        LoadDrops();
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
                    Reestoque
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
                            {cards.quantidade} Reestoques
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
                            Total de reestoques
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
                                borderRadius: "12px",
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

export default drops;