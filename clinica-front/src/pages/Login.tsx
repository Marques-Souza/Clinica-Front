import {useState} from 'react'

function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white text-2xl font-bold">
          +
        </div>
        <span className="text-xl font-bold">
          Clínica<span className="text-teal-700">Vida</span>
        </span>
      </div>
    

    <h1 className="text-3xl font-bold mb-1">Entrar</h1>
    <p className="text-slate-600 mb-6">Acesse sua conta para agendar consultas.</p>

    <label htmlFor="email" className="block text-sm font-semibold mb-1">E-mail</label>
    <input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Digite seu e-mail"
      className="w-full h-12 rounded-xl border border-slate-300 px-4 mb-4"/>

    <label htmlFor="password" className="block text-sm font-semibold mb-1">password</label>
    <input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Digite sua senha"
      className="w-full h-12 rounded-xl border border-slate-300 px-4 mb-4"/>

    <button className="w-full h-12 rounded-xl bg-teal-700 text-white font-semibold ">
      Entrar
    </button>

    <p className="text-center text-slate-500 mt-6">
      Ainda não te conta?{' '}
      <a href="#" className="text-teal-700 font-semibold">Criar conta</a>
    </p>
  </div>
  </div>
  )
}

export default Login