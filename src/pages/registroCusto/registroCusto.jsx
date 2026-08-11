// await axios.get(
//     "http://127.0.0.1:8000/registration/buscar-periodo",
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




function registros() {
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
    const [filtroStatus, setFiltroStatus] = useState("");

    const [quantidadeMin, setQuantidadeMin] = useState("");
    const [quantidadeMax, setQuantidadeMax] = useState("");

    const [filtroVencimento, setFiltroVencimento] = useState("");

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


    // Função que pega todas as movimentações
    async function LoadMovimentacoes() {
        try {
            const resposta = await axios.get(
                "http://127.0.0.1:8000/registrations/buscar-registros",
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
                vencimento: new Date(m.vencimento).toLocaleDateString("pt-BR"),
                usuario_id: m.usuario_id,
                tipo: m.tipo,
                valor: Number(m.valor),
                
                status:
                    m.status === "true"
                        ? "PAGO"
                        : m.status === "false"
                            ? "NAOPAGO"
                            : m.status,

                created_at: new Date(m.created_at).toLocaleDateString("pt-BR"),
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
                "http://127.0.0.1:8000/order/buscar",
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
                "http://127.0.0.1:8000/order/registrar-custo",
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
                "http://127.0.0.1:8000/auth/listar-user",
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
                "http://127.0.0.1:8000/auth/dashboard",
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
        ...new Set(registros.map((registro) => registro.tipo))
    ];

    // ABAIXO SÃO OS FILTROS DE BUSCA DA BARRA DE PESQUISA E DO MODAL
    const registrosFiltrados = registros.filter((registro) => {

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
        // DATA DE VENCIMENTO
        // ======================

        // ======================
        // DATA DE VENCIMENTO
        // ======================

        if (filtroVencimento !== "") {

            if (!registro.vencimento) {
                return false;
            }


            const dataRegistro = new Date(registro.vencimento);


            if (isNaN(dataRegistro.getTime())) {
                return false;
            }


            const dataFormatada = dataRegistro
                .toISOString()
                .split("T")[0];


            if (dataFormatada !== filtroVencimento) {
                return false;
            }

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



    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeProdutos) {
            case "list":
                return (
                    <div>
                        <h1>Essa é a página de lista de custos</h1>
                        <h2>Tabela abaixo</h2>

                        {/* Tabela que vai receber a lista de custos */}
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome do Usuario</th>
                                    <th>Tipo</th>
                                    <th>Valor</th>
                                    <th>Quantidade</th>
                                    <th>Status</th>
                                    <th>Vencimento</th>
                                    <th>Data de Criação</th>
                                </tr>
                            </thead>

                            <tbody>
                                {registrosFiltrados.map((registro) => (
                                    <tr
                                        key={registro.id}
                                        onClick={() => {
                                            setAbrirProd(registro);
                                        }}
                                        onMouseEnter={() => {
                                            setHoverRegistro(registro);
                                        }}
                                        onMouseLeave={() => {
                                            setHoverRegistro(null);
                                        }}
                                        style={{
                                            cursor: "pointer",
                                            position: "relative"
                                        }}
                                        onMouseMove={(e) => {
                                            setMousePos({
                                                x: e.clientX,
                                                y: e.clientY
                                            });
                                        }}
                                    >
                                        <td>{registro.id}</td>

                                        {/* Mantido o nome do usuário sem alterar */}
                                        <td>{registro.nome_usuario}</td>

                                        <td>{registro.tipo}</td>

                                        <td>
                                            R$ {Number(registro.valor).toFixed(2)}
                                        </td>

                                        <td>{registro.quantidade}</td>

                                        <td>{registro.status}</td>

                                        <td>{registro.vencimento}</td>

                                        <td>{registro.created_at}</td>


                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Mostra a descrição do registro quando o mouse estiver sobre a linha da tabela */}
                        {hoverRegistro && (

                            <div
                                style={{
                                    position: "fixed",
                                    left: mousePos.x + 20,
                                    top: mousePos.y + 20,
                                    width: "320px",
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
                                    Descrição
                                </h4>

                                <hr />

                                <p style={{ marginBottom: 0 }}>
                                    {hoverRegistro.descricao}
                                </p>

                            </div>

                        )}
                    </div>
                )


            case "new":
                return (
                    <div>

                        <button
                            onClick={() => {
                                setActiveProdutos("list");
                            }}
                        >
                            Voltar
                        </button>


                        <h1>Cadastro de Custos</h1>


                        {/* TIPO */}
                        <div>

                            <p>Tipo do Custo</p>

                            <input
                                list="tiposCustos"
                                type="text"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
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
                        <div>

                            <p>Descrição</p>

                            <input
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />

                        </div>



                        {/* QUANTIDADE */}
                        <div>

                            <p>Quantidade</p>

                            <input
                                type="number"
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value)}
                            />

                        </div>



                        {/* VALOR */}
                        <div>

                            <p>Valor</p>

                            <input
                                type="number"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                            />

                        </div>



                        {/* STATUS */}
                        <div>

                            <p>Status</p>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >

                                <option value="">
                                    Selecione
                                </option>

                                <option value="PAGO">
                                    Pago
                                </option>

                                <option value="NAOPAGO">
                                    Não Pago
                                </option>

                            </select>

                        </div>




                        {/* VENCIMENTO */}
                        <div>

                            <p>Data de Vencimento</p>

                            <input
                                type="date"
                                value={vencimento}
                                onChange={(e) => setVencimento(e.target.value)}
                            />

                        </div>




                        {/* QUANTIDADE DE PARCELAS */}
                        <div>

                            <p>Quantidade de Parcelas</p>

                            <input
                                type="number"
                                value={quantParcelas}
                                onChange={(e) => setQuantParcelas(e.target.value)}
                            />

                        </div>





                        <button
                            onClick={() => {
                                setshowConfirm(true);
                            }}
                            style={{ border: "1px solid black" }}
                        >
                            Cadastrar Custo
                        </button>







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


                    </div>
                )

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
                background: "#0d1117",
                color: "#fff",
            }}
        >
            {/* TOOLBAR */}
            <div
                className="flex items-center gap-4 px-6 py-4"
                style={{
                    background: "#111827",
                    borderBottom: "1px solid #1f2937",
                }}
            >
                {/* Botão Novo */}
                <button
                    onClick={() => {
                        setActiveProdutos("new");
                        LoadProdutos();
                        LoadUsuario();
                    }}
                    className="px-4 py-2 rounded-md font-semibold text-white"
                    style={{
                        background: "#0ea5e9",
                        border: "none",
                        cursor: "pointer",
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
                        placeholder="Buscar vendas..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #374151",
                            background: "#1f2937",
                            color: "#fff",
                            outline: "none",
                        }}


                    />


                </div>

                <button
                    onClick={() => setShowFiltro(true)}
                    style={{
                        marginLeft: "10px",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: "1px solid #374151",
                        background: "#1f2937",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    ⚙ Filtros
                </button>

                {/* Ícone Lista */}
                <div
                    style={{
                        marginLeft: "auto",
                        fontSize: "22px",
                        color: "#10b981",
                    }}
                >
                    ☰
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className="p-6">
                {/* CARDS ENCIMA DA TELÇA */}

                <div className="grid grid-cols-4 gap-4 mb-6">

                    <div className="bg-white rounded-xl shadow p-5 border">
                        <h3 className="text-gray-500 text-sm">
                            Custos
                        </h3>

                        <p className="text-3xl font-bold mt-2">
                            R$ {cards.totalCustos.toFixed(2)}
                        </p>

                        <span className="text-gray-500 text-sm">
                            {cards.quantidade} registros
                        </span>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5 border">
                        <h3 className="text-gray-500 text-sm">
                            Pagamentos
                        </h3>

                        <p className="text-green-600 font-semibold mt-2">
                            Pago: R$ {cards.totalPago.toFixed(2)}
                        </p>

                        <p className="text-red-500">
                            Pendente: R$ {cards.totalPendente.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5 border">
                        <h3 className="text-gray-500 text-sm">
                            Vencimentos
                        </h3>

                        <p className="text-red-600 font-semibold mt-2">
                            {cards.vencidos} vencidos
                        </p>

                        <p className="text-yellow-600">
                            {cards.proximos} próximos
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5 border">
                        <h3 className="text-gray-500 text-sm">
                            Resumo
                        </h3>

                        <p className="font-semibold mt-2">
                            Total de registros
                        </p>

                        <p className="text-3xl font-bold">
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
                                width: "450px",
                                background: "#1f2937",
                                color: "white",
                                borderRadius: "10px",
                                padding: "20px",
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
                                    fontSize: "22px",
                                    cursor: "pointer"
                                }}
                            >
                                ×
                            </button>


                            <h2>Filtros</h2>

                            <hr />


                            <p>Nome do Usuário</p>

                            <input
                                type="text"
                                value={filtroUsuario}
                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                style={{ width: "100%" }}
                            />


                            <p>Tipo do Custo</p>

                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                style={{ width: "100%" }}
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


                            <p>Valor mínimo</p>

                            <input
                                type="number"
                                value={valorMin}
                                onChange={(e) => setValorMin(e.target.value)}
                                style={{ width: "100%" }}
                            />


                            <p>Valor máximo</p>

                            <input
                                type="number"
                                value={valorMax}
                                onChange={(e) => setValorMax(e.target.value)}
                                style={{ width: "100%" }}
                            />


                            <p>Quantidade mínima</p>

                            <input
                                type="number"
                                value={quantidadeMin}
                                onChange={(e) => setQuantidadeMin(e.target.value)}
                                style={{ width: "100%" }}
                            />


                            <p>Quantidade máxima</p>

                            <input
                                type="number"
                                value={quantidadeMax}
                                onChange={(e) => setQuantidadeMax(e.target.value)}
                                style={{ width: "100%" }}
                            />


                            <p>Status</p>

                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                style={{ width: "100%" }}
                            >
                                <option value="">Todos</option>
                                <option value="PAGO">Pago</option>
                                <option value="NAOPAGO">Não Pago</option>
                            </select>


                            <p>Data de Vencimento</p>

                            <input
                                type="date"
                                value={filtroVencimento}
                                onChange={(e) => setFiltroVencimento(e.target.value)}
                                style={{ width: "100%" }}
                            />


                            <div
                                style={{
                                    marginTop: "20px",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}
                            >

                                <button
                                    onClick={() => {

                                        setFiltroUsuario("");
                                        setFiltroTipo("");

                                        setValorMin("");
                                        setValorMax("");

                                        setQuantidadeMin("");
                                        setQuantidadeMax("");

                                        setFiltroStatus("");

                                        setFiltroVencimento("");

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