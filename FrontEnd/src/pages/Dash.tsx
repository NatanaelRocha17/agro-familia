import { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router';
import { LogOut, Package, User, Trash2, Loader2, Settings, Sprout, Home } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import type { Farmer } from '../Models/Models';
import { logout } from '../services/authService';


export function Dashboard() {
  const navigate = useNavigate();
  const [dataUser, setDataUser] = useState<Farmer>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  useEffect(() => {
    const userStr = localStorage.getItem('user');
    console.log(userStr)

    if (!localStorage.getItem('farmer_token') || !userStr) {
      navigate('/agricultor/login');
      return;
    }
    setDataUser(JSON.parse(userStr));
  

  }, [navigate]);



  const handleLogout = async () => {

    await logout();

    toast.success('Logout realizado com sucesso!');

    navigate('/agricultor/login');


  };

  if (!dataUser) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-700" /></div>
  );

  return (
    <div className="min-h-screen bg-stone-50 backgr bg-gradient-to-r from-green-900 via-green-800 to-green-900">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Sprout className="text-green-700" size={32} />
              <h1 className="text-2xl font-bold text-green-800">AgroFamília</h1>
              <p className="text-sm text-stone-600">Painel do Agricultor</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="font-medium text-stone-900">{dataUser.first_name}</p>
                <p className="text-sm text-stone-500">{dataUser.email}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium"
              >
                <Home size={18} />
                <span className="hidden sm:inline">Início</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='"container mx-auto px-4 py-8'>
        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Bem-vindo, {dataUser.first_name}!</h2>
          <p className="text-green-100">Gerencie seus produtos e informações da sua vitrine</p>
        </div>

        {/* Card de produto único */}
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm mb-8 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Produtos Ativos</h3>
            <Package className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-stone-900">{12}</p>
          <p className="text-sm text-stone-500 mt-1">produtos cadastrados</p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-stone-200">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              className="flex items-center gap-4 p-6 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-left border border-stone-200"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="text-green-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Gerenciar Produtos</h3>
                <p className="text-sm text-stone-600">Adicionar, editar ou remover produtos</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/agricultor/perfil')}
              className="flex items-center gap-4 p-6 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-left border border-stone-200"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-green-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Perfil</h3>
                <p className="text-sm text-stone-600">Atualizar informações pessoais</p>
              </div>
            </button>

            <button
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              className="flex items-center gap-4 p-6 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-left border border-stone-200"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Settings className="text-green-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Configurações</h3>
                <p className="text-sm text-stone-600">Gerenciar configurações da conta</p>
              </div>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-4 p-6 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors text-left border border-stone-200"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="text-red-700" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Excluir Conta</h3>
                <p className="text-sm text-stone-600">Excluir sua conta permanentemente</p>
              </div>
            </button>
          </div>
        </div>

        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            toast.success('Conta desativada');
            navigate('/agricultor/login');
          }}
          farmerName={dataUser.first_name}
          activeProductsCount={0}
          id={Number(dataUser.id)}
        />

      </div>


    </div>
  );
}