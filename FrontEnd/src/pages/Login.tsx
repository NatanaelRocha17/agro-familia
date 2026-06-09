import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sprout } from 'lucide-react';
import { toast } from 'sonner';

import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Contexto de autenticação
  const { login: authLogin } = useAuth();

  const handlelogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(
        'Preencha todos os campos'
      );
      return;
    }

    if (password.length < 8) {
      toast.error(
        'A senha deve ter pelo menos 8 caracteres'
      );
      return;
    }

    setLoading(true);

    try {
      const data = await login({
        email,
        password,
      });

      // Atualiza contexto + localStorage
      authLogin(
        data.accessToken,
        data.user
      );

      toast.success(
        'Login realizado com sucesso!'
      );

      navigate(
        '/agricultor/dashboard'
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data
          ?.message ||
          'Erro ao fazer login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex flex-col items-center justify-center px-4">
      {/* LOGO */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
          <Sprout
            className="text-white"
            size={32}
          />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          AgroFamília
        </h1>

        <p className="text-green-100">
          Área do Agricultor
        </p>
      </div>

      {/* FORM */}
      <div className="w-full max-w-md">
        <form
          onSubmit={handlelogin}
          className="bg-white p-8 rounded-2xl shadow-2xl w-full space-y-5"
        >
          <div className="flex items-center gap-2 mb-6">
            <LogIn
              className="text-green-700"
              size={24}
            />

            <h2 className="text-2xl font-bold text-stone-900">
              Entrar
            </h2>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>

            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>

            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-70 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-green-900/20"
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

          {/* ESQUECI SENHA */}
          <div className="text-right">
            <button
              type="button"
              onClick={() =>
                toast.info(
                  'Funcionalidade em desenvolvimento'
                )
              }
              className="text-sm text-green-700 hover:text-green-800 font-medium hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>
        </form>

        {/* CADASTRO */}
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

        {/* VOLTAR */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-sm text-white font-bold hover:text-green-300 underline underline-offset-4 decoration-green-500/50 transition-all"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}