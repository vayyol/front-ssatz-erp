import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"


function drops() {
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

    // const [nomeItem, setNameitem] = useState("") //recebera o nome de determinado produto

    //constantes para a criação de custos
    const [tipo, setTipo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [quant, setQuantidadeS] = useState(0);
    const [valor, setValor] = useState(0);
    const [status, setStatus] = useState(null);
    const [vencimento, setVencimento] = useState("");
    const [quantParcelas, setQuantParcelas] = useState(1);


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
                "http://127.0.0.1:8000/registrations/buscar-registros",
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


    // Função que carrega a lista de Drops
    async function LoadDrops() {
        try {
            const resposta = await axios.get(
                "http://127.0.0.1:8000/order/buscar-drops",
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

    // Registrar novo custo
    async function CriarCusto() {

        try {

            await axios.post(
                "http://127.0.0.1:8000/order/registrar-custo-auto",
                {
                    aditional_id: DropAberto.id,
                    tipo: tipo,
                    descricao: descricao,
                    quantidade: Number(quantidade),
                    valor: Number(valor),
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
                `http://127.0.0.1:8000/order/buscar-drop/${id_Drop}`,
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
                "http://127.0.0.1:8000/order/criar-drop",
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
                `http://127.0.0.1:8000/order/adicionar-item/${id_Drop}`,
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
                `http://127.0.0.1:8000/order/buscar-itens/${id_Drop}`,

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
                `http://127.0.0.1:8000/order/remover-item/${id_prod}`,
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
                `http://127.0.0.1:8000/sales/cancelar/${id_Drop}`,
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
                `http://127.0.0.1:8000/order/finalizar-drop/${id_Drop}`,
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
        LoadDrops()
        LoadUsers()
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
        .filter((mov) => mov.aditional_id === DropAberto.id)
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
        ...new Set(registros.map((registro) => registro.tipo))
    ];


    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeDrops) {
            case "list":
                return (
                    <div>
                        <h1>Essa é a página de lista de Drops</h1>
                        <h2>Tabela abaixo</h2>

                        <table border="1">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Funcionário</th>
                                    <th>Valor Total</th>
                                    <th>Subtotal</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Drops.map((drop) => (
                                    <tr
                                        key={drop.id}
                                        onClick={() => {
                                            AbrirDrop(drop.status);
                                            BuscarDrop(drop.id);
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{drop.id}</td>
                                        <td>{drop.funcionario}</td>
                                        <td>R$ {Number(drop.valor).toFixed(2)}</td>
                                        <td>R$ {Number(drop.subtotal).toFixed(2)}</td>
                                        <td>{drop.status}</td>
                                        <td>{drop.data}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case "new":
                return (
                    <div>
                        <button
                            onClick={() => {
                                setActiveDrops("list");
                                LoadDrops();
                            }}
                            style={{
                                border: "1px solid black",
                                padding: "10px",
                                backgroundColor: "#ddd",
                                cursor: "pointer",
                            }}
                        >
                            Voltar
                        </button>

                        <h1>Essa é a página de criação de Drops</h1>

                        <div style={{ display: "flex", height: "100vh" }}>
                            {/* Lado Esquerdo */}
                            <div style={{ flex: 1 }}>
                                <p>Funcionário Logado: {nomeFucio.nome}</p>

                                <button
                                    onClick={() => {
                                        IniciarNovaDrop();
                                        setActiveDrops("pendente");
                                        LoadMovimentacoes();
                                        LoadUsuario();
                                        LoadProdutos();
                                    }}
                                    style={{
                                        border: "1px solid black",
                                        padding: "10px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Iniciar nova Drop
                                </button>
                            </div>

                            {/* Lado Direito */}
                            <div style={{ flex: 1 }}>
                                <table border={1}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nome</th>
                                            <th>SKU</th>
                                            <th>Tamanho</th>
                                            <th>Modelagem</th>
                                            <th>Cor</th>
                                            <th>Estoque</th>
                                            <th>Preço</th>
                                            <th>Status</th>
                                            <th>Data</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((produto) => (
                                            <tr key={produto.id}>
                                                <td>{produto.id}</td>
                                                <td>{produto.nome}</td>
                                                <td>{produto.sku}</td>
                                                <td>{produto.tamanho}</td>
                                                <td>{produto.modelagem}</td>
                                                <td>{produto.cor}</td>
                                                <td>{produto.estoque}</td>
                                                <td>
                                                    R$ {Number(produto.preco).toFixed(2)}
                                                </td>
                                                <td>{produto.status}</td>
                                                <td>{produto.data}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );


            case "pendente":
                return (
                    <div>
                        <button
                            onClick={() => { setActiveDrops("list"); LoadDrops(); }}
                            style={{
                                border: "1px solid black",
                                padding: "10px",
                                backgroundColor: "#ddd",
                                cursor: "pointer"
                            }}
                        >
                            Voltar
                        </button>

                        <h1>essa é a pagina de edição de Drops</h1>

                        <div
                            style={{
                                display: "flex",
                                height: "calc(100vh - 100px)" // ocupa a tela abaixo do botão e título
                            }}
                        >

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    borderRight: "1px solid #ccc",
                                    padding: "10px"
                                }}
                            >
                                {/* Tela Esquerda */}
                                <p>{DropAberto.status}  {DropAberto.id}</p>
                                <table border={1}>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>id produto</th>
                                            <th>quantidade</th>
                                            <th>preco</th>
                                            <th>remover</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itensDrop.map((itens) => {

                                            const produto = products.find(// encontra o produto correspondente ao item
                                                (produto) => produto.id === itens.produto_id
                                            );

                                            return (
                                                <tr key={itens.id}>
                                                    <td>{produto?.nome}</td>
                                                    <td>{itens.produto_id}</td>
                                                    <td>{itens.quantidade}</td>
                                                    <td>{itens.preco_unitario}</td>
                                                    <td><button
                                                        onClick={async () => {
                                                            await removeProdInDrop(itens.id);
                                                            await BuscarDrop(DropAberto.id);
                                                        }}
                                                        style={{ border: "1px solid black" }}
                                                    >-</button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <h2>Subtotal: R$ {DropAberto.subtotal}</h2>


                                <h2>Custos adicionais</h2>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tipo</th>
                                            <th>Valor</th>
                                            <th>Quantidade</th>
                                            <th>Vencimento</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {registros.map((registro) => (
                                            <tr key={registro.id}>
                                                <td>{registro.id}</td>

                                                <td>{registro.tipo}</td>

                                                <td>
                                                    R$ {Number(registro.valor).toFixed(2)}
                                                </td>

                                                <td>{registro.quantidade}</td>

                                                <td>{registro.vencimentoFormatado}</td>

                                                <td>
                                                    {registro.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h2>Valor total: R$ {DropAberto.valor_total}</h2>

                                <button
                                    onClick={() => {
                                        BuscarDrop(DropAberto.id)
                                        setActiveDrops("finalizado");
                                        LoadUsuario();
                                        LoadProdutos();
                                        FinalDrop(DropAberto.id);
                                    }}
                                    style={{ border: "1px solid black" }}
                                >Finalizar</button>
                                <button
                                    onClick={() => {
                                        BuscarDrop(DropAberto.id)
                                        setActiveDrops("cancelado");
                                        LoadUsuario();
                                        LoadProdutos();
                                        CancelDrop(DropAberto.id);
                                    }}
                                    style={{ border: "1px solid black" }}
                                >Cancelar</button>

                                <h2>Cadastro de Custos</h2>


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
                                        value={quant}
                                        onChange={(e) => setQuantidadeS(e.target.value)}
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
                                {/* <div>

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

                                </div> */}




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
                                                                        BuscarDrop(DropAberto.id);

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

                                <table border={1}>
                                    <thead>
                                        <tr>
                                            <th>Adicionar</th>
                                            <th>ID</th>
                                            <th>Nome</th>
                                            <th>SKU</th>
                                            <th>Tamanho</th>
                                            <th>Modelagem</th>
                                            <th>Cor</th>
                                            <th>Estoque</th>
                                            <th>Preço Venda</th>
                                            <th>Status</th>
                                            <th>Data</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((produto) => (
                                            <tr key={produto.id}>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            setProdutoSelecionado(produto);
                                                            setQuantidade(1);
                                                            setShowModal(true);
                                                        }}
                                                        style={{ border: "1px solid black" }}
                                                    >
                                                        +
                                                    </button>
                                                </td>

                                                <td>{produto.id}</td>
                                                <td>{produto.nome}</td>
                                                <td>{produto.sku}</td>
                                                <td>{produto.tamanho}</td>
                                                <td>{produto.modelagem}</td>
                                                <td>{produto.cor}</td>
                                                <td>{produto.estoque}</td>
                                                <td>R$ {Number(produto.preco).toFixed(2)}</td>
                                                <td>{produto.status}</td>
                                                <td>{produto.data}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                    <div>
                        <button
                            onClick={() => { setActiveDrops("list"); LoadDrops(); }}
                            style={{
                                border: "1px solid black",
                                padding: "10px",
                                backgroundColor: "#ddd",
                                cursor: "pointer"
                            }}
                        >
                            Voltar
                        </button>

                        <h1>essa é a pagina de Drops finalizadas</h1>

                        <div
                            style={{
                                display: "flex",
                                height: "calc(100vh - 100px)" // ocupa a tela abaixo do botão e título
                            }}
                        >

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    borderRight: "1px solid #ccc",
                                    padding: "10px"
                                }}
                            >
                                {/* Tela Esquerda */}
                                <p>{DropAberto.status}  {DropAberto.id}</p>
                                <table border={1}>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>id produto</th>
                                            <th>quantidade</th>
                                            <th>preco</th>
                                            <th>remover</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itensDrop.map((itens) => {

                                            const produto = products.find(// encontra o produto correspondente ao item
                                                (produto) => produto.id === itens.produto_id
                                            );

                                            return (
                                                <tr key={itens.id}>
                                                    <td>{produto?.nome}</td>
                                                    <td>{itens.produto_id}</td>
                                                    <td>{itens.quantidade}</td>
                                                    <td>{itens.preco_unitario}</td>
                                                    <td><button
                                                        onClick={async () => {
                                                            await removeProdInDrop(itens.id);
                                                            await BuscarDrop(DropAberto.id);
                                                        }}
                                                        style={{ border: "1px solid black" }}
                                                    >-</button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <h2>Subtotal: R$ {DropAberto.subtotal}</h2>


                                <h2>Custos adicionais</h2>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tipo</th>
                                            <th>Valor</th>
                                            <th>Quantidade</th>
                                            <th>Vencimento</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {registros.map((registro) => (
                                            <tr key={registro.id}>
                                                <td>{registro.id}</td>

                                                <td>{registro.tipo}</td>

                                                <td>
                                                    R$ {Number(registro.valor).toFixed(2)}
                                                </td>

                                                <td>{registro.quantidade}</td>

                                                <td>{registro.vencimentoFormatado}</td>

                                                <td>
                                                    {registro.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h2>Valor total: R$ {DropAberto.valor_total}</h2>
                                {/* Tela Direita */}

                                <table border={1}>
                                    <thead>
                                        <tr>
                                            <th>Nome do Produto</th>
                                            <th>Codigo de barras</th>
                                            <th>Estoque</th>
                                            <th>Preço</th>
                                            <th>ID</th>
                                            <th>Status</th>
                                            <th>Data de Criação</th>
                                            <th>Ultima atualização</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((produto) => (
                                            <tr key={produto.id}>
                                                <td>{produto.nome}</td>
                                                <td>{produto.cod}</td>
                                                <td>{produto.estoque}</td>
                                                <td>{produto.preco}</td>
                                                <td>{produto.id}</td>
                                                <td>{produto.status}</td>
                                                <td>{produto.data}</td>
                                                <td>{produto.datatualiza}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>


                        {/* primeira div baerta */}
                    </div>
                )


            case "cancelado":
                return (
                    <div>
                        <button
                            onClick={() => { setActiveDrops("list"); LoadDrops(); }}
                            style={{
                                border: "1px solid black",
                                padding: "10px",
                                backgroundColor: "#ddd",
                                cursor: "pointer"
                            }}
                        >
                            Voltar
                        </button>

                        <h1>essa é a pagina de Drops canceladas</h1>

                        <div
                            style={{
                                display: "flex",
                                height: "calc(100vh - 100px)" // ocupa a tela abaixo do botão e título
                            }}
                        >

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    borderRight: "1px solid #ccc",
                                    padding: "10px"
                                }}
                            >
                                {/* Tela Esquerda */}
                                <p>{DropAberto.status}  {DropAberto.id}</p>
                                <table border={1}>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>id produto</th>
                                            <th>quantidade</th>
                                            <th>preco</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itensDrop.map((itens) => {

                                            const produto = products.find(// encontra o produto correspondente ao item
                                                (produto) => produto.id === itens.produto_id
                                            );

                                            return (
                                                <tr key={itens.id}>
                                                    <td>{produto?.nome}</td>
                                                    <td>{itens.produto_id}</td>
                                                    <td>{itens.quantidade}</td>
                                                    <td>{itens.preco_unitario}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <p>Valor total: R$ {DropAberto.valor_total}</p>


                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    padding: "10px"
                                }}
                            >
                                {/* Tela Direita */}

                                <table border={1}>
                                    <thead>
                                        <tr>
                                            <th>Nome do Produto</th>
                                            <th>Codigo de barras</th>
                                            <th>Estoque</th>
                                            <th>Preço</th>
                                            <th>ID</th>
                                            <th>Status</th>
                                            <th>Data de Criação</th>
                                            <th>Ultima atualização</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((produto) => (
                                            <tr key={produto.id}>
                                                <td>{produto.nome}</td>
                                                <td>{produto.cod}</td>
                                                <td>{produto.estoque}</td>
                                                <td>{produto.preco}</td>
                                                <td>{produto.id}</td>
                                                <td>{produto.status}</td>
                                                <td>{produto.data}</td>
                                                <td>{produto.datatualiza}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>


                        {/* primeira div baerta */}
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
                        setActiveDrops("new");
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
                    Drops
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
                        placeholder="Buscar Drops..."
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
                {renderContent()}
            </div>
        </div>
    );
}

export default drops;