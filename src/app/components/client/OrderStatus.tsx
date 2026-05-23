import { useEffect, useState } from "react";
import { Clock, ChefHat, Package, CheckCircle, Edit2, ArrowLeft } from "lucide-react";

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
  status: "received" | "preparing" | "ready" | "delivered";
  createdAt: string;
  updatedAt: string;
  editable: boolean;
  editableUntil: string;
}

interface OrderStatusProps {
  orderId: string;
  onEdit: () => void;
  onNewOrder: () => void;
}

const statusSteps = [
  { id: "received", label: "Pedido recibido", icon: Clock },
  { id: "preparing", label: "Cocinando", icon: ChefHat },
  { id: "ready", label: "Listo", icon: Package },
  { id: "delivered", label: "Entregado", icon: CheckCircle },
];

export function OrderStatus({ orderId, onEdit, onNewOrder }: OrderStatusProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 2000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (!order || !order.editable) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const until = new Date(order.editableUntil).getTime();
      const remaining = Math.max(0, Math.floor((until - now) / 1000));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const loadOrder = () => {
    try {
      const all = JSON.parse(localStorage.getItem("orders") || "{}");
      const found = all[orderId] as Order | undefined;
      if (found) {
        const now = new Date().getTime();
        const until = new Date(found.editableUntil).getTime();
        if (found.editable && now > until) {
          found.editable = false;
          all[orderId] = found;
          localStorage.setItem("orders", JSON.stringify(all));
        }
        setOrder(found);
      }
    } catch (error) {
      console.log("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = statusSteps.findIndex(step => step.id === order?.status);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E63946] to-[#F4A261] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onNewOrder}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
          <div className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-xs font-bold">
            MESA {order.tableNumber}
          </div>
        </div>
        <h1 className="text-2xl font-black text-white">Estado del pedido</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 no-scrollbar">
        {/* Edit timer */}
        {order.editable && timeRemaining > 0 && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-[#F4A261] p-3 rounded-full">
                <Edit2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-[#1a1a1a] mb-2">
                  Puedes editar tu pedido
                </h3>
                <p className="text-gray-600 font-medium mb-4">
                  Tiempo restante: <span className="font-mono font-black text-[#E63946]">{formatTime(timeRemaining)}</span>
                </p>
                <button
                  onClick={onEdit}
                  className="px-6 py-3 bg-[#F4A261] text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Editar pedido
                </button>
              </div>
            </div>
          </div>
        )}

        {order.editable === false && order.status === "received" && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border-2 border-[#F4A261]">
            <p className="text-gray-700 font-bold">
              Tu pedido está en preparación y no puede modificarse.
            </p>
          </div>
        )}

        {/* Status timeline */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
          <h2 className="text-xs text-gray-500 mb-8 uppercase tracking-wider font-bold">Seguimiento en vivo</h2>
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-start gap-5">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50"
                          : isCurrent
                          ? "bg-gradient-to-br from-[#E63946] to-[#F4A261] shadow-lg shadow-[#E63946]/50 animate-pulse"
                          : "bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-7 h-7 ${isCompleted || isCurrent ? "text-white" : "text-gray-400"}`} strokeWidth={2.5} />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-16 left-1/2 -translate-x-1/2 w-1 h-6 ${
                          isCompleted ? "bg-gradient-to-b from-green-500 to-green-400" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-3">
                    <h3
                      className={`font-black text-lg ${
                        isCompleted || isCurrent ? "text-[#1a1a1a]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <p className="text-[#E63946] font-bold mt-1">En proceso...</p>
                    )}
                    {isCompleted && (
                      <p className="text-green-600 font-bold mt-1">✓ Completado</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h2 className="text-xs text-gray-500 mb-6 uppercase tracking-wider font-bold">Resumen del pedido</h2>
          {order.items.map((item) => (
            <div key={item.product.id} className="flex justify-between mb-4 font-medium">
              <span className="text-gray-700">
                {item.quantity}× {item.product.name}
              </span>
              <span className="text-[#1a1a1a] font-bold">
                ${(item.product.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          {order.notes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Notas</p>
              <p className="text-gray-700 font-medium">{order.notes}</p>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total</span>
            <span className="text-3xl font-black text-[#E63946]">
              ${order.total.toLocaleString()}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 font-medium">
              Pago: {order.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      {order.status === "delivered" && (
        <div className="bg-white/80 backdrop-blur-lg border-t border-gray-100 p-5">
          <button
            onClick={onNewOrder}
            className="w-full bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white py-5 rounded-full font-black text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            Nuevo pedido
          </button>
        </div>
      )}
    </div>
  );
}
