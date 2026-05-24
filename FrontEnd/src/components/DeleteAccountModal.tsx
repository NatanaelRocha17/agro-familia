import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { deleteFarmer } from '../services/farmer';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  farmerName: string;
  activeProductsCount: number;
  id: number; // ID do agricultor para exclusão
}

export function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  farmerName,
  activeProductsCount, 
  id
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<'warning' | 'confirmation'>('warning');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== 'EXCLUIR') return;
    
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);

    await deleteFarmer(id); // Chama a função para excluir a conta no backend

    // Após a exclusão, limpe o localStorage e redirecione para a página de login
    localStorage.clear();
    window.location.href = '/login';
  };

  const resetAndClose = () => {
    setStep('warning');
    setConfirmText('');
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Excluir Conta</h2>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            disabled={isDeleting}
          >
            <X size={20} className="text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'warning' && (
            <>
              {/* RF004: Verificação de vínculos críticos */}
              {activeProductsCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">
                        Você possui {activeProductsCount} produto{activeProductsCount > 1 ? 's' : ''} ativo{activeProductsCount > 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-amber-800">
                        Antes de excluir sua conta, você precisa remover ou desativar todos os produtos publicados.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RF004: Diálogo/alerta sobre consequências */}
              <div className="space-y-4 mb-6">
                <p className="text-stone-700">
                  <span className="font-semibold">{farmerName}</span>, ao excluir sua conta:
                </p>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Você não poderá mais fazer login</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Seus produtos serão removidos da plataforma, caso estejam inativos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Certas informações podem permanecer para fins de conformidade e auditoria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Esta ação não poderá ser desfeita facilmente</span>
                  </li>
                </ul>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-stone-700"> Sua conta será excluída. Caso deseje voltar a utilizar o sistema será preciso criar uma nova conta e começar do zero<strong></strong></p>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetAndClose}
                  className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep('confirmation')}
                  disabled={activeProductsCount > 0}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activeProductsCount > 0 ? 'Remova os produtos primeiro' : 'Continuar'}
                </button>
              </div>
            </>
          )}

          {step === 'confirmation' && (
            <>
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold mb-2">
                    ⚠️ Última confirmação
                  </p>
                  <p className="text-sm text-red-700">
                    Esta ação desativará permanentemente sua conta. Você não poderá mais acessar o sistema.
                  </p>
                </div>

                <p className="text-stone-700 mb-4">
                  Para confirmar, digite <span className="font-mono font-bold bg-stone-100 px-2 py-1 rounded">EXCLUIR</span> no campo abaixo:
                </p>

                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="Digite EXCLUIR"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-stone-900 font-mono"
                  disabled={isDeleting}
                  autoFocus
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setStep('warning');
                    setConfirmText('');
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirmText !== 'EXCLUIR' || isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Excluir Conta
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
