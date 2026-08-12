
// PRIMEIRA PAGINA A APARECER(essa é barra lateral de modulos do sistema)
//lembrar de intalar npm install lucide-react ao usar pela primeira vez

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
// import AppPage from './AppPage'
// import VendasPage from './modulos/vendas/vendas';
// import ProdutosPage from './produtos/produtos';
import EstoquePage from './estoque/estoqueStyle'
import RegistroCusto from './entrada-saida/entrada-saida2'
import DropPage from './drop/dropStyle'
import VendasPage from './vendas/vendaStyle'
import DashBoard from "./Dashborad";
import EntradaSaida from "./entrada-saida/entrada-saida"
// import Draw from "./draw"
import RegistrosEstoque from "./movimentacoes/movimentacoes";
import FluxoCaixa from "./fluxo-caixa/fluxo-caixa"
import FornecedoresPage from "./fonecedores/fornecedores"

import {
    LayoutDashboard,
    Calendar,
    Building2,
    Users,
    Package,
    ShoppingCart,
    Boxes,
    DollarSign,
    Search,
    TrendingUp,
    LayoutGrid,
    ChevronRight,
    Bell,
    User,
    List,
    Plus,
    ChevronDown,
} from "lucide-react";

/*
  Itens da barra lateral.
  Para adicionar um novo módulo, basta adicionar outro objeto aqui.
*/
const menuItems = [
    { icon: LayoutDashboard, label: "Painel" },
    { icon: Boxes, label: "Estoque" },
    { icon: Package, label: "Reestoque" },
    { icon: Building2, label: "Entrada e Saida" },
    { icon: Building2, label: "Fluxo de Caixa" },
    { icon: ShoppingCart, label: "Vendas" },
    { icon: Boxes, label: "Fornecedores" },
    { icon: Building2, label: "Registros do Estoque" },
    // { icon: Calendar, label: "Agenda" },
    // { icon: Users, label: "Pessoas" },
    // { icon: DollarSign, label: "Financeiro" },
    // { icon: DollarSign, label: "Registro de Custos" },
];

function App() {
    /*
      Guarda qual seção está aberta.
      Começa no Painel.
    */
    const [activeMenu, setActiveMenu] = useState("Estoque");

    /*
      Esta função decide o que será mostrado no centro da tela.
  
      MAIS PRA FRENTE:
      Você pode trocar os <h1> pelos seus componentes reais.
  
      Exemplo:
      return <Produtos />
      return <Estoque />
      return <Financeiro />
    */
    function renderContent() {
        switch (activeMenu) {
            case "Painel":
                return <DashBoard />;

            case "Reestoque":
                return <DropPage />;

            case "Estoque":
                return <EstoquePage />;

            case "Vendas":
                return <VendasPage />

            case "Fluxo de Caixa":
                return <FluxoCaixa />

            case "Fornecedores":
                return<FornecedoresPage />

            // case "Registro de Custos":
            //     return <RegistroCusto />;

            case "Entrada e Saida":
                return <EntradaSaida />

            case "Registros do Estoque":
                return <RegistrosEstoque />

            case "Pessoas":
                return (
                    <h1 className="text-3xl font-bold">
                        Essa é a visualização de pessoas
                    </h1>
                );

            default:
                return <h1 className="text-3xl font-bold">Página não encontrada</h1>;
        }
    }

    return (
        <div className="flex h-screen w-full bg-[#f3f3f3] overflow-hidden font-sans">

            {/* ==========================
                BARRA LATERAL
                ========================== */}
            <aside className="w-52 bg-[#1d1d1d] flex flex-col shrink-0 border-r border-[#333]">

                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-[#353535] bg-[#181818]">
                    <div className="w-9 h-9 bg-[#7a2430] rounded-md flex items-center justify-center shadow">
                        <TrendingUp size={18} className="text-white" />
                    </div>

                    <span className="text-white font-bold text-sm leading-tight tracking-wide">
                        SSATZ
                        <br />
                        STYLE
                    </span>
                </div>

                {/* Menu */}
                <nav className="flex-1 py-2 overflow-y-auto">
                    {menuItems.map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            onClick={() => setActiveMenu(label)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 ${activeMenu === label
                                ? "bg-[#7a2430] text-white"
                                : "text-gray-300 hover:bg-[#2b2b2b] hover:text-white"
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ==========================
        ÁREA PRINCIPAL
    ========================== */}
            <main className="flex-1 overflow-auto bg-[#ececec]">

                {/* HEADER */}
                <header
                    className="flex items-center justify-between px-6 py-4 border-b shadow-sm"
                    style={{
                        background: "#ffffff",
                        borderColor: "#d8d8d8",
                    }}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <LayoutGrid size={16} className="text-gray-500" />
                        <ChevronRight size={14} className="text-gray-400" />

                        <span className="text-gray-800 font-semibold">
                            {activeMenu}
                        </span>
                    </div>

                    <div className="flex items-center gap-5">

                        <span className="text-gray-500 text-sm">
                            Manual: Sistema Gestão Online
                        </span>

                        <button
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition hover:brightness-110"
                            style={{
                                background: "#7a2430",
                            }}
                        >
                            <User
                                size={17}
                                className="text-white"
                            />
                        </button>

                    </div>
                </header>

                {/* CONTEÚDO */}

                {renderContent()}


            </main>

        </div>
    );
}

export default App;