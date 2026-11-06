import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Início</h1>
      <button
        onClick={logout}
        className="mt-4 h-12 px-6 rounded-xl bg-teal-700 text-white font-semibold"
      >
        Sair
      </button>
    </div>
  )
}

export default Home