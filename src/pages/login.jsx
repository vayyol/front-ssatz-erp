import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"



function Login() {
    const API_URL = import.meta.env.VITE_API_URL;

    const navigate = useNavigate()

    const [user, setUser] = useState("")
    const [senha, setSenha] = useState("")

    async function fazerLogin() {

        try{

            const resposta = await axios.post(
                `${API_URL}/auth/login`, 

                {
                  user: user,
                  senha: senha
                }
            )
            console.log(resposta.data)
            localStorage.setItem(
                "refresh_t",
                resposta.data.refresh_token
            )
            localStorage.setItem(
                "token",
                resposta.data.access_token
            )
            var token = localStorage.getItem("token")
            alert(token)

            alert("Login realizado com sucesso.")
            navigate("/")

        } catch(err){
            console.log(err)

            if(err.response?.data?.detail) {
                alert(err.response.data.detail)
            } else {
                alert("Erro ao fazer login.")
            }
        }
    }

return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#3d4574] via-[#4a5188] to-[#3d4574]">
      <div className="w-[400px] bg-[#404773] rounded-lg shadow-2xl overflow-hidden">
        <div className="p-10">
          <h1 className="text-white text-center mb-8">Login</h1>

          <form className="space-y-4">
            <input
              type="user"
              placeholder="User name"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-3 rounded bg-[#e8e8f0] text-gray-700 placeholder:text-gray-500 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded bg-[#e8e8f0] text-gray-700 placeholder:text-gray-500 outline-none"
            />

            {/* <button
              type="submit"
              className="w-full py-3 bg-[#6b5b95] text-white rounded hover:bg-[#7a6ba5] transition-colors"
            >
              Sign up
            </button> */}
          </form>
        </div>
                
        <button 
        onClick={fazerLogin}
        className="w-full py-4 bg-[#e8e8f0] text-[#404773] rounded-b-lg hover:bg-[#d8d8e0] transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login