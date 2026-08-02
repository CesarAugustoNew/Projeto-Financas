import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Salario from './pages/Salario/Salario.jsx'
import Economias from './pages/Economias/Economias.jsx'
import Dividas from './pages/Dividas/Dividas.jsx'
import Gastos from './pages/Gastos/Gastos.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/salario" element={<Salario />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/economias" element={<Economias />} />
        <Route path="/dividas" element={<Dividas />} />
      </Routes>
    </Layout>
  )
}
