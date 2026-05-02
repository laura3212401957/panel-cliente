import { useState } from "react";
import { Banknote, Smartphone, ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface PaymentMethodProps {
  items: CartItem[];
  notes: string;
  total: number;
  onBack: () => void;
  onConfirm: (paymentMethod: string) => void;
}

export function PaymentMethod({ items, notes, total, onBack, onConfirm }: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showTransferInstructions, setShowTransferInstructions] = useState(false);

  const handleConfirm = () => {
    if (!selectedMethod) return;

    if (selectedMethod === "transfer") {
      setShowTransferInstructions(true);
    } else {
      onConfirm(selectedMethod);
    }
  };

  const handleNotifyPayment = () => {
    onConfirm("transfer");
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E63946] to-[#F4A261] sticky top-0 z-10">
        <div className="flex items-center gap-4 p-5">
          <button
            onClick={showTransferInstructions ? () => setShowTransferInstructions(false) : onBack}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
          <h2 className="text-2xl font-black text-white">
            {showTransferInstructions ? "Instrucciones" : "Método de pago"}
          </h2>
        </div>
      </div>

      {!showTransferInstructions ? (
        <>
          {/* Payment methods */}
          <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50 no-scrollbar">
            <p className="text-gray-600 font-bold mb-6">Selecciona tu método de pago</p>

            {/* Cash option */}
            <button
              onClick={() => setSelectedMethod("cash")}
              className={`w-full p-6 mb-4 rounded-3xl flex items-center gap-5 transition-all ${
                selectedMethod === "cash"
                  ? "bg-gradient-to-r from-[#E63946] to-[#F4A261] shadow-xl shadow-[#E63946]/30"
                  : "bg-white shadow-md hover:shadow-lg"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                selectedMethod === "cash" ? "bg-white/20" : "bg-gray-100"
              }`}>
                <Banknote className={`w-7 h-7 ${selectedMethod === "cash" ? "text-white" : "text-gray-600"}`} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <h3 className={`font-black text-lg ${selectedMethod === "cash" ? "text-white" : "text-[#1a1a1a]"}`}>
                  Efectivo
                </h3>
                <p className={`text-sm font-medium ${selectedMethod === "cash" ? "text-white/80" : "text-gray-500"}`}>
                  Al recibir
                </p>
              </div>
            </button>

            {/* Transfer option */}
            <button
              onClick={() => setSelectedMethod("transfer")}
              className={`w-full p-6 rounded-3xl flex items-center gap-5 transition-all ${
                selectedMethod === "transfer"
                  ? "bg-gradient-to-r from-[#E63946] to-[#F4A261] shadow-xl shadow-[#E63946]/30"
                  : "bg-white shadow-md hover:shadow-lg"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                selectedMethod === "transfer" ? "bg-white/20" : "bg-gray-100"
              }`}>
                <Smartphone className={`w-7 h-7 ${selectedMethod === "transfer" ? "text-white" : "text-gray-600"}`} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <h3 className={`font-black text-lg ${selectedMethod === "transfer" ? "text-white" : "text-[#1a1a1a]"}`}>
                  Transferencia
                </h3>
                <p className={`text-sm font-medium ${selectedMethod === "transfer" ? "text-white/80" : "text-gray-500"}`}>
                  Nequi, Daviplata
                </p>
              </div>
            </button>

            {/* Order summary */}
            <div className="mt-8 bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-xs text-gray-500 mb-6 uppercase tracking-wider font-bold">Resumen</h3>
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between mb-4 font-medium">
                  <span className="text-gray-700">
                    {item.quantity}× {item.product.name}
                  </span>
                  <span className="text-[#1a1a1a] font-bold">
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              {notes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Notas</p>
                  <p className="text-gray-700 font-medium">{notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/80 backdrop-blur-lg border-t border-gray-100 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total</span>
              <span className="text-3xl font-black text-[#E63946]">
                ${total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!selectedMethod}
              className="w-full bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white py-5 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              Confirmar pedido
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Transfer instructions */}
          <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50 no-scrollbar">
            <div className="bg-gradient-to-r from-[#E63946]/10 to-[#F4A261]/10 rounded-3xl p-6 mb-6 border-2 border-[#F4A261]">
              <p className="text-gray-700 font-bold leading-relaxed">
                Realiza tu transferencia y notifícanos cuando hayas completado el pago.
              </p>
            </div>

            {/* Transfer accounts */}
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h4 className="font-black text-[#1a1a1a] text-lg mb-4">Nequi</h4>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Número</p>
                <p className="font-mono font-black text-xl text-[#E63946]">300 123 4567</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h4 className="font-black text-[#1a1a1a] text-lg mb-4">Daviplata</h4>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Número</p>
                <p className="font-mono font-black text-xl text-[#E63946]">301 234 5678</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h4 className="font-black text-[#1a1a1a] text-lg mb-4">Bancolombia</h4>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Cuenta de ahorros</p>
                <p className="font-mono font-black text-xl text-[#E63946]">1234-5678-9012</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#E63946] to-[#F4A261] rounded-3xl p-8 shadow-xl">
              <p className="text-xs text-white/80 mb-3 uppercase tracking-wider font-bold">
                Monto a transferir
              </p>
              <p className="text-5xl font-black text-white">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/80 backdrop-blur-lg border-t border-gray-100 p-5">
            <button
              onClick={handleNotifyPayment}
              className="w-full bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white py-5 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Confirmar pago
            </button>
          </div>
        </>
      )}
    </div>
  );
}
