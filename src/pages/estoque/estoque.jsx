// Esse arquivo contem um codigo de uma pagina para a alimentação do estoque sem estilização 
// Um cod base que faz integração com api do protype-erp 


import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"


function estoque() {
    const [activeProdutos, setActiveProdutos] = useState("list");
    const [products, setProducts] = useState([])

    const [nomeFucio, setFuncionario] = useState("")
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
    const [sku, setSku] = useState("");
    const [tamanho, setTamanho] = useState("");
    const [modelagem, setModelagem] = useState("");
    const [cor, setCor] = useState("");
    const [precoCusto, setPrecoCusto] = useState("");
    const [precoVenda, setPrecoVenda] = useState("");
    const [estoque, setEstoque] = useState("")

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

    //modal de confirmação
    const [showConfirm, setshowConfirm] = useState(false)
    const [loadingConfirm, setLoadingConfirm] = useState(false);


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



    // entrda de estoque
    async function CriarProduto() {

        try {

            await axios.post(
                "http://127.0.0.1:8000/order/entrada-estoque",
                {
                    nome_peca: nome,
                    sku: sku,
                    tamanho: tamanho,
                    modelagem: modelagem,
                    cor: cor,
                    preco_custo: Number(precoCusto),
                    preco_venda: Number(precoVenda),
                    estoque: Number(estoque)
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
                "http://127.0.0.1:8000/order/ajustar-estoque",
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

    //ABAIXO SÃO OS FILTROS DE BUSCA DA BARRA DE PESQUISA E DO MODAL
    const produtosFiltrados = products.filter((produto) => {

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

    });


    //ESSA FUNÇÃO VAI DECIDIR OQUE SERA MOSTRADO NA TELA
    function renderContent() {
        switch (activeProdutos) {
            case "list":
                return (
                    <div>
                        <h1>essa é a pagina de lista de produtos</h1>
                        <h2>tabelinha abaixo </h2>

                        {/* Tabela que vai receber a lista de produtos */}
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome da Peça</th>
                                    <th>SKU</th>
                                    <th>Tamanho</th>
                                    <th>Cor</th>
                                    <th>Modelagem</th>
                                    <th>Preço de Custo</th>
                                    <th>Preço de Venda</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                    <th>Data de Criação</th>
                                </tr>
                            </thead>

                            <tbody>
                                {produtosFiltrados.map((produto) => (
                                    <tr
                                        key={produto.id}
                                        onClick={() => {
                                            setAbrirProd(produto);
                                            setNomeProduto(produto.nome);
                                            setCusto(produto.precoCusto);
                                            setVenda(produto.preco);

                                            setActiveProdutos("ajustar");
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{produto.id}</td>
                                        <td>{produto.nome}</td>
                                        <td>{produto.sku}</td>
                                        <td>{produto.tamanho}</td>
                                        <td>{produto.cor}</td>
                                        <td>{produto.modelagem}</td>
                                        <td>{produto.precoCusto}</td>
                                        <td>{produto.preco}</td>
                                        <td>{produto.estoque}</td>
                                        <td>{produto.status}</td>
                                        <td>{produto.data}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

                        <h1>Cadastro de Produtos</h1>

                        <div>
                            <p>Nome da Peça</p>

                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div>
                            <p>SKU</p>

                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                        </div>

                        <div>
                            <p>Tamanho</p>

                            <input
                                type="text"
                                value={tamanho}
                                onChange={(e) => setTamanho(e.target.value)}
                            />
                        </div>

                        <div>
                            <p>Modelagem</p>

                            <input
                                type="text"
                                value={modelagem}
                                onChange={(e) => setModelagem(e.target.value)}
                            />
                        </div>

                        <div>
                            <p>Cor</p>

                            <input
                                type="text"
                                value={cor}
                                onChange={(e) => setCor(e.target.value)}
                            />
                        </div>

                        <div>
                            <p>Preço de Custo</p>

                            <input
                                type="number"
                                value={precoCusto}
                                onChange={(e) => setPrecoCusto(e.target.value)}
                            />
                        </div>

                        <div>
                            <p>Preço de Venda</p>

                            <input
                                type="number"
                                value={precoVenda}
                                onChange={(e) => setPrecoVenda(e.target.value)}
                            />
                        </div>

                        <div>
                            <p>Estoque</p>

                            <input
                                type="number"
                                value={estoque}
                                onChange={(e) => setEstoque(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => {
                                setshowConfirm(true);
                            }}
                            style={{ border: "1px solid black" }}
                        >
                            Cadastrar Produto
                        </button>

                    
                

                {/* Abaixo tem um modal que é uma tela flutuante de confirmação para cadastrar produto*/ }

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

                                {loadingConfirm ? (

                                    <div className="flex flex-col items-center gap-4 py-5">

                                        {/* Bolinha girando */}
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
                                            Deseja finalizar?
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

                                                    await CriarProduto();
                                                    
                                                    setLoadingConfirm(false);
                                                    setshowConfirm(false);

                                                }}
                                            >
                                                Continuar
                                            </button>

                                        </div>

                                    </>

                                )}

                            </div>

                        </div>

                    )
                }



                {/* primeira div aberta */ }
                    </div >
            )


            case "ajustar":

                return (

                    <div>

                        <button
                            onClick={() => {
                                setActiveProdutos("list");
                                LoadProdutos();
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

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={filtroAtivo}
                                        onChange={(e) => setFiltroAtivo(e.target.checked)}
                                    />
                                    Ativo
                                </label>

                                <br />

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={filtroNaoAtivo}
                                        onChange={(e) => setFiltroNaoAtivo(e.target.checked)}
                                    />
                                    Não Ativo
                                </label>

                                <p>Estoque mínimo</p>

                                <input
                                    type="number"
                                    value={estoqueMin}
                                    onChange={(e) => setEstoqueMin(e.target.value)}
                                    style={{ width: "100%" }}
                                />

                                <p>Estoque máximo</p>

                                <input
                                    type="number"
                                    value={estoqueMax}
                                    onChange={(e) => setEstoqueMax(e.target.value)}
                                    style={{ width: "100%" }}
                                />

                                <p>Preço mínimo</p>

                                <input
                                    type="number"
                                    value={precoMin}
                                    onChange={(e) => setPrecoMin(e.target.value)}
                                    style={{ width: "100%" }}
                                />

                                <p>Preço máximo</p>

                                <input
                                    type="number"
                                    value={precoMax}
                                    onChange={(e) => setPrecoMax(e.target.value)}
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
                                            setFiltroAtivo(true);
                                            setFiltroNaoAtivo(true);
                                            setEstoqueMin("");
                                            setEstoqueMax("");
                                            setPrecoMin("");
                                            setPrecoMax("");
                                        }}
                                    >
                                        Limpar
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