import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  Bell,
  User,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart2,
  ChevronRight,
  Wifi,
} from "lucide-react";

/* MARKER-MAKE-KIT-INVOKED */
/* MARKER-MAKE-KIT-DISCOVERY-READ */

const salesData = [
  { date: "21/06/2018", valor: 2.0 },
  { date: "06/06/2018", valor: 66.0 },
  { date: "06/06/2018", valor: 66.0 },
  { date: "06/06/2018", valor: 302.0 },
  { date: "06/06/2018", valor: 46.0 },
  { date: "06/06/2018", valor: 6.0 },
];

const topClientes = [
  { cliente: "Cliente Modelo 1", total: 65.0, status: "pago" },
  { cliente: "Cliente Modelo 1", total: 36.0, status: "pago" },
  { cliente: "Cliente Modelo 2", total: 1.0, status: "pago" },
];

const menuItems = [
  { icon: LayoutDashboard, label: "Painel", active: true },
  { icon: Calendar, label: "Agenda", active: false },
  { icon: Building2, label: "Entidade", active: false },
  { icon: Users, label: "Pessoas", active: false },
  { icon: Package, label: "Produtos", active: false },
  { icon: ShoppingCart, label: "Vendas", active: false },
  { icon: Boxes, label: "Estoque", active: false },
  { icon: DollarSign, label: "Financeiro", active: false },
];

const kpiCards = [
  {
    label: "Vendas Hoje",
    value: "66,00",
    sub: "Ticket Médio R$33,00 · Qtd: 2 Vendas",
    color: "bg-green-500",
    icon: ShoppingCart,
  },
  {
    label: "Vendas (Período)",
    value: "68,00",
    sub: "Ticket Médio R$22,67 · Qtd: 3 Vendas",
    color: "bg-orange-500",
    icon: BarChart2,
  },
  {
    label: "Receber Hoje",
    value: "30,00",
    sub: "",
    color: "bg-sky-500",
    icon: ArrowDownCircle,
  },
  {
    label: "Pagar Hoje",
    value: "30,00",
    sub: "",
    color: "bg-red-500",
    icon: ArrowUpCircle,
  },
];

const lancamentos = [
  { desc: "Venda #001 - Cliente A", valor: "R$ 65,00", tipo: "entrada" },
  { desc: "Venda #002 - Cliente B", valor: "R$ 3,00", tipo: "entrada" },
  { desc: "Pagamento Fornecedor", valor: "R$ 30,00", tipo: "saida" },
];

//FUNÇÃO PRINCIPAL

function DashBoard() {
        const API_URL = import.meta.env.VITE_API_URL;

        const [activeMenu, setActiveMenu] = useState("Painel");
        const [activeTab, setActiveTab] = useState("lancamentos");

        const navigate = useNavigate()

        //FUNÇÕES ABAIXO
        async function fazerRefresh(refresh_token) {
            try{
                const resposta_refresh = await axios.get(
                    `http://127.0.0.1:8000/auth/refresh`,

                    {
                        headers: {
                            Authorization: `Bearer ${refresh_token}`
                        }
                    }
                )

                localStorage.setItem(
                    "token",
                    resposta_refresh.data.access_token
                )
                entrarDash()

            } catch(err){
                console.log(err)

                if(err.response?.data?.detail) {
                    alert(err.response.data.detail)
                } else {
                    alert("Erro ao fazer login com o refresh token.")
                }

                navigate("/login")


            }
        }

        async function entrarDash() {
            
            var refresh_token = localStorage.getItem("refresh_t")
            var token = localStorage.getItem("token")
            if (!token){
                navigate("/login")
                return
            }

          try{

            const resposta = await axios.get(
                `${API_URL}/auth/dashboard`, 

                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
            )

          } catch(err){
            console.log(err)

            if(err.response?.data?.detail) {
                alert(err.response.data.detail)
            } else {
                alert("Erro ao fazer login.")
            }
            if (err.response?.status === 401) {
                await fazerRefresh(refresh_token)
            }

          }
    }

    useEffect(()=>{
        entrarDash()
    }, [])

    return(
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
     
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`${card.color} rounded-lg p-4 text-white flex items-start justify-between shadow`}>
                  <div>
                    <p className="text-xs opacity-80 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    {card.sub && <p className="text-[10px] opacity-70 mt-1 leading-tight">{card.sub}</p>}
                  </div>
                  <Icon size={32} className="opacity-30 mt-1 shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Top clientes */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Clientes</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="text-left pb-1">Cliente</th>
                    <th className="text-right pb-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientes.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5 text-slate-700">{row.cliente}</td>
                      <td className="py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-700">{row.total.toFixed(2)}</span>
                          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">
                            {row.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Vendas (Diário)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`R$ ${v}`, "Valor"]} />
                  <Bar dataKey="valor" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Promo card */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center text-center gap-3">
              <div className="grid grid-cols-3 gap-1 mb-1">
                {[
                  "bg-yellow-400","bg-green-500","bg-blue-500",
                  "bg-red-500","bg-purple-500","bg-orange-400",
                  "bg-pink-500","bg-teal-500","bg-indigo-500",
                ].map((c, i) => (
                  <div key={i} className={`w-8 h-8 ${c} rounded-full opacity-80`} />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Já pensou seus produtos expostos nos
                <span className="font-semibold text-slate-800"> maiores e-commerces do Brasil?</span>
              </p>
              <button className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3 py-1.5 rounded transition-colors">
                Solicite mais informações No Chat online.
              </button>
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex border-b border-gray-200">
              {[
                { key: "lancamentos", label: "Lançamentos (Período)" },
                { key: "vendas", label: "Vendas (Dia)" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? "border-sky-500 text-sky-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === "lancamentos" ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b">
                      <th className="text-left pb-2">Descrição</th>
                      <th className="text-right pb-2">Valor</th>
                      <th className="text-right pb-2">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentos.map((l, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 text-slate-700">{l.desc}</td>
                        <td className="py-2 text-right text-slate-700">{l.valor}</td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            l.tipo === "entrada"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {l.tipo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Nenhuma venda registrada hoje.</p>
              )}
            </div>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="bg-slate-800 text-white text-xs flex items-center justify-end gap-1.5 px-4 py-1 shrink-0">
          <Wifi size={12} className="text-green-400" />
          <span className="text-green-400">Online</span>
        </footer>
      </div>
    </div>
    );
}

export default DashBoard