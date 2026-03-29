import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Link vem do react-router-dom
import { LogIn, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '../services/authService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para redirecionar

  const handlelogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    if(password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const data = await login({
        email,
        password: password
      });


      console.log("Resposta do login:", data); // Log para verificar a resposta do login

localStorage.setItem('farmer_token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
 

      toast.success('Login realizado com sucesso!');

      navigate('/agricultor/dashboard');

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex flex-col items-center justify-center px-4 ">

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
          <Sprout className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">AgroFamília</h1>
        <p className="text-green-100">Área do Agricultor</p>
      </div>


      <div className="w-full max-w-md">
        <form onSubmit={handlelogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full space-y-5">

          <div className="flex items-center gap-2 mb-6">
            <LogIn className="text-green-700" size={24} />
            <h2 className="text-2xl font-bold text-stone-900">Entrar</h2>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-green-900/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
          {/* Link "Esqueci minha senha" */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-green-700 hover:text-green-800 font-medium hover:underline"
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
            >
              Esqueci minha senha
            </button>
          </div>
        </form>

        {/* CADASTRE-SE AJUSTADO */}
        <div className="text-center mt-8">
          <p className="text-sm text-green-100/80">
            Ainda não tem uma conta?{' '}
            <Link
              to="/agricultor/register"
              className="text-white font-bold hover:text-green-300 underline underline-offset-4 decoration-green-500/50 transition-all"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}