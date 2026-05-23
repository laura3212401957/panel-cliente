import { useState, useEffect } from "react";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";

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

interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  paymentMethod: string;
  notes: string;
  total: number;
  status: string;
  editable: boolean;
  editableUntil: string;
}

interface OrderEditProps {
  orderId: string;
  onBack: () => void;
  onSaved: () => void;
}

export function OrderEdit({ orderId, onBack, onSaved }: OrderEditProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = () => {
    try {
      const all = JSON.parse(localStorage.getItem("orders") || "{}");
      const found = all[orderId] as Order | undefined;
      if (found) {
        setOrder(found);
        setItems(found.items);
        setNotes(found.notes);
      }
    } catch (error) {
      console.log("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(items.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.product.id !== productId));
  };

  const handleSave = () => {
    if (items.length === 0) {
      alert("Debes tener al menos un producto");
      return;
    }

    setSaving(true);
    try {
      const all = JSON.parse(localStorage.getItem("orders") || "{}");
      const existing = all[orderId];
      if (!existing) { alert("Pedido no encontrado"); return; }

      const now = new Date();
      if (now > new Date(existing.editableUntil) || existing.status !== "received") {
        alert("El pedido ya no se puede modificar");
        return;
      }

      const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      all[orderId] = { ...existing, items, notes, total, updatedAt: new Date().toISOString() };
      localStorage.setItem("orders", JSON.stringify(all));
      onSaved();
    } catch (error) {
      console.log("Error saving order:", error);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading || !order) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#E63946] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E63946] to-[#F4A261] sticky top-0 z-10">
        <div className="flex items-center gap-4 p-5">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white">Editar pedido</h2>
            <p className="text-xs text-white/80">Mesa {order.tableNumber}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50 no-scrollbar">
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
                onClick={() => removeItem(item.product.id)}
                className="p-2 hover:bg-red-50 text-[#E63946] rounded-full h-fit"
              >
                <Trash2 className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-full p-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-4 h-4 text-[#1a1a1a]" strokeWidth={2.5} />
                </button>
                <span className="font-black text-[#1a1a1a] text-lg w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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

        {items.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <p className="text-gray-400 font-bold mb-6">Sin productos</p>
            <button
              onClick={onBack}
              className="text-[#E63946] font-black hover:underline"
            >
              Volver
            </button>
          </div>
        )}

        {/* Notes */}
        {items.length > 0 && (
          <div className="mt-6">
            <label className="block text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
              Notas especiales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla..."
              className="w-full p-5 bg-white rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-[#F4A261]/20 text-[#1a1a1a] shadow-md"
              rows={3}
            />
          </div>
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
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white py-5 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}
