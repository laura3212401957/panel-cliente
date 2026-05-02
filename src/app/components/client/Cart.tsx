import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

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

interface CartProps {
  items: CartItem[];
  notes: string;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateNotes: (notes: string) => void;
  onContinue: () => void;
}

export function Cart({ items, notes, onClose, onUpdateQuantity, onRemoveItem, onUpdateNotes, onContinue }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E63946] to-[#F4A261] sticky top-0 z-10">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-2xl font-black text-white">Carrito</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50 no-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-white rounded-3xl p-12 shadow-lg">
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-black text-[#1a1a1a] mb-2">
                Carrito vacío
              </h3>
              <p className="text-gray-500 mb-8">
                Agrega productos del menú
              </p>
              <button
                onClick={onClose}
                className="px-8 py-4 bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Ver menú
              </button>
            </div>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-3xl p-5 mb-4 shadow-md"
              >
                <div className="flex gap-4 mb-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-2xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1a1a1a] mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-[#E63946] font-black text-lg">
                      ${item.product.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 hover:bg-red-50 text-[#E63946] rounded-full h-fit"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-full p-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="w-4 h-4 text-[#1a1a1a]" strokeWidth={2.5} />
                    </button>
                    <span className="font-black text-[#1a1a1a] text-lg w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-[#F4A261] rounded-full shadow-md hover:shadow-lg text-white transition-all"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                  <p className="font-black text-[#1a1a1a] text-lg pr-2">
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
                Notas especiales
              </label>
              <textarea
                value={notes}
                onChange={(e) => onUpdateNotes(e.target.value)}
                placeholder="Ej: Sin cebolla, término medio..."
                className="w-full p-5 bg-white rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-[#F4A261]/20 text-[#1a1a1a] shadow-md"
                rows={3}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="bg-white/80 backdrop-blur-lg border-t border-gray-100 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total</span>
            <span className="text-3xl font-black text-[#E63946]">
              ${total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white py-5 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            Continuar pedido
          </button>
        </div>
      )}
    </div>
  );
}
