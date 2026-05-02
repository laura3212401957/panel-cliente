import { useState, useRef, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

interface FlyingBubble {
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [flyingBubble, setFlyingBubble] = useState<FlyingBubble | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fade-in al montar
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Parallax al hacer scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollY(scrollRef.current.scrollTop);
    }
  };

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const cartBtn = document.querySelector("[data-cart-button]");

    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;

    if (cartBtn) {
      const cartRect = cartBtn.getBoundingClientRect();
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;

      setFlyingBubble({
        startX,
        startY,
        dx: endX - startX,
        dy: endY - startY,
      });

      // Cuando la burbuja llega al carrito
      setTimeout(() => {
        onAddToCart(product, quantity);
        setFlyingBubble(null);

        // Bounce en el botón del carrito
        const cartButton = document.querySelector("[data-cart-button]") as HTMLElement;
        if (cartButton) {
          cartButton.classList.add("cart-bounce");
          setTimeout(() => cartButton.classList.remove("cart-bounce"), 500);
        }

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 750);
      }, 680);
    } else {
      onAddToCart(product, quantity);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center backdrop-blur-sm">

      {/* Keyframes dinámicos según posición real */}
      {flyingBubble && (
        <style>{`
          @keyframes fly-to-cart {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            45% {
              transform: translate(${flyingBubble.dx * 0.25}px, ${flyingBubble.dy * 0.85 - 70}px) scale(0.6);
              opacity: 0.95;
            }
            100% {
              transform: translate(${flyingBubble.dx}px, ${flyingBubble.dy}px) scale(0.08);
              opacity: 0;
            }
          }
          @keyframes cart-bounce {
            0%   { transform: scale(1); }
            25%  { transform: scale(1.45) rotate(-8deg); }
            50%  { transform: scale(0.88) rotate(5deg); }
            75%  { transform: scale(1.18) rotate(-3deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .cart-bounce {
            animation: cart-bounce 0.48s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards !important;
          }
        `}</style>
      )}

      {/* Burbuja voladora */}
      {flyingBubble && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: flyingBubble.startX - 30,
            top: flyingBubble.startY - 30,
            animation: "fly-to-cart 0.68s cubic-bezier(0.4, 0, 0.6, 1) forwards",
          }}
        >
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-white shadow-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Modal */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl max-h-[95vh] overflow-y-auto no-scrollbar"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >

        {/* Imagen con parallax */}
        <div className="relative w-full rounded-t-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-[4/3] object-cover"
            style={{
              transform: `translateY(${scrollY * 0.35}px) scale(1.1)`,
              transition: "transform 0.05s linear",
              transformOrigin: "center top",
            }}
          />
          {/* Gradiente inferior para transición suave a blanco */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"
            style={{ opacity: Math.min(scrollY / 60, 1) }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white active:scale-90 transition-all"
            style={{ opacity: Math.max(1 - scrollY / 80, 0.3) }}
          >
            <X className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Info con fade-in escalonado */}
        <div className="p-6">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s",
            }}
          >
            <h3 className="text-2xl font-black text-[#1a1a1a] mb-3">{product.name}</h3>
            <p className="text-[#1a1a1a] text-3xl font-black mb-4">
              ${product.price.toLocaleString()}
            </p>
          </div>
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s ease 0.28s, transform 0.4s ease 0.28s",
            }}
          >
            <p className="text-gray-600 leading-relaxed mb-6 font-medium text-sm">
              {product.description}
            </p>
          </div>

          {/* Selector de cantidad */}
          <div
            className="mb-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s ease 0.38s, transform 0.4s ease 0.38s",
            }}
          >
            <label className="block text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
              Cantidad
            </label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-full p-2 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Minus className="w-4 h-4 text-[#1a1a1a]" strokeWidth={2.5} />
              </button>
              <span className="text-2xl font-black text-[#1a1a1a] w-10 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center bg-[#F4A261] rounded-full shadow-md hover:shadow-lg text-white transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Botón agregar */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s ease 0.48s, transform 0.4s ease 0.48s",
            }}
          >
            <button
              onClick={handleAdd}
              disabled={showSuccess || !!flyingBubble}
              className={`w-full py-4 rounded-full font-black text-base shadow-xl transition-all ${
                showSuccess
                  ? "bg-green-500 text-white scale-95"
                  : flyingBubble
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white hover:shadow-2xl hover:scale-105"
              }`}
            >
              {showSuccess
                ? "✓ Agregado al carrito"
                : flyingBubble
                ? "Agregando..."
                : `Agregar · $${(product.price * quantity).toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}