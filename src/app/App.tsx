import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "./components/client/Menu";
import { ProductDetail } from "./components/client/ProductDetail";
import { Cart } from "./components/client/Cart";
import { PaymentMethod } from "./components/client/PaymentMethod";
import { OrderStatus } from "./components/client/OrderStatus";
import { OrderEdit } from "./components/client/OrderEdit";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

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

const viewVariants = {
  initial: { opacity: 0, x: 40, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, x: -40, scale: 0.97, transition: { duration: 0.25, ease: [0.55, 0, 1, 0.45] } },
};

const overlayVariants = {
  initial: { opacity: 0, scale: 0.92, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.25, ease: [0.55, 0, 1, 0.45] } },
};

function ClientApp({ tableNumber }: { tableNumber: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [view, setView] = useState<"menu" | "cart" | "payment" | "status" | "edit">("menu");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleConfirmOrder = async (paymentMethod: string) => {
    try {
      const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80493524/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            tableNumber,
            items: cart,
            paymentMethod,
            notes,
            total,
          }),
        }
      );

      const order = await response.json();
      setCurrentOrderId(order.id);
      setCart([]);
      setNotes("");
      setView("status");
    } catch (error) {
      console.log("Error creating order:", error);
      alert("Error al crear el pedido");
    }
  };

  const handleNewOrder = () => {
    setCurrentOrderId(null);
    setView("menu");
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "menu" && (
          <motion.div key="menu" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full">
            <Menu
              tableNumber={tableNumber}
              cart={cart}
              onAddToCart={addToCart}
              onViewCart={() => setView("cart")}
              onProductClick={(product) => setSelectedProduct(product)}
            />
          </motion.div>
        )}

        {view === "cart" && (
          <motion.div key="cart" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full">
            <Cart
              items={cart}
              notes={notes}
              onClose={() => setView("menu")}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onUpdateNotes={setNotes}
              onContinue={() => setView("payment")}
            />
          </motion.div>
        )}

        {view === "payment" && (
          <motion.div key="payment" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full">
            <PaymentMethod
              items={cart}
              notes={notes}
              total={cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}
              onBack={() => setView("cart")}
              onConfirm={handleConfirmOrder}
            />
          </motion.div>
        )}

        {view === "status" && currentOrderId && (
          <motion.div key="status" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full">
            <OrderStatus
              orderId={currentOrderId}
              onEdit={() => setView("edit")}
              onNewOrder={handleNewOrder}
            />
          </motion.div>
        )}

        {view === "edit" && currentOrderId && (
          <motion.div key="edit" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full">
            <OrderEdit
              orderId={currentOrderId}
              onBack={() => setView("status")}
              onSaved={() => setView("status")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div key="product-detail" variants={overlayVariants} initial="initial" animate="animate" exit="exit" className="fixed inset-0 z-50">
            <ProductDetail
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={(product, quantity) => {
                addToCart(product, quantity);
                setSelectedProduct(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Home({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-8 sm:p-6">

      {/* Fondo base */}
      <div className="absolute inset-0 bg-[#E63946]" />

      {/* Orb naranja — deriva arriba-derecha */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "72vw", height: "72vw",
          maxWidth: 540, maxHeight: 540,
          background: "#F4A261",
          filter: "blur(88px)",
          opacity: 0.72,
          top: "-20%", left: "-16%",
        }}
        animate={{ x: [0, 70, 25, 85, 0], y: [0, 45, 90, 35, 0], scale: [1, 1.13, 1.06, 1.18, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb rojo oscuro — deriva abajo-izquierda */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "66vw", height: "66vw",
          maxWidth: 490, maxHeight: 490,
          background: "#c1121f",
          filter: "blur(110px)",
          opacity: 0.60,
          bottom: "-22%", right: "-18%",
        }}
        animate={{ x: [0, -55, -22, -72, 0], y: [0, -42, -85, -32, 0], scale: [1, 1.11, 1.2, 1.07, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Orb naranja claro — pulso central */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "56vw", height: "56vw",
          maxWidth: 410, maxHeight: 410,
          background: "#ffb347",
          filter: "blur(140px)",
          opacity: 0.38,
          top: "32%", left: "22%",
        }}
        animate={{ scale: [1, 1.28, 0.88, 1.18, 1], opacity: [0.38, 0.54, 0.28, 0.48, 0.38] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-md w-full space-y-8 sm:space-y-12">

        {/* Logo / Título animado */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-2">
              ¡Bienvenido!
            </h1>
          </motion.div>
          <motion.p
            className="text-lg sm:text-xl text-white/90 font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            A Caldo Parado El Paisa
          </motion.p>
        </div>

        {/* Botón y texto inferior */}
        <div className="space-y-4 sm:space-y-6">
          <motion.button
            onClick={onNavigate}
            className="block w-full bg-white text-[#E63946] py-4 sm:py-6 rounded-full font-black text-lg sm:text-xl text-center shadow-2xl"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.06, boxShadow: "0 25px 50px rgba(230,57,70,0.35)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
            whileTap={{ scale: 0.94, transition: { type: "spring", stiffness: 400, damping: 25 } }}
          >
            Comenzar pedido
          </motion.button>
          <motion.p
            className="text-xs sm:text-sm text-center text-white/80 font-bold uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.55 }}
          >
            Escanea el código QR de tu mesa
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [tableNumber, setTableNumber] = useState("1");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get("table");
    if (table) {
      setTableNumber(table);
    }

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToClient = () => {
    window.history.pushState({}, "", "/client?table=1");
    setCurrentPath("/client");
  };

  const isClient = currentPath === "/client";

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {isClient ? (
          <motion.div
            key="client"
            className="h-full w-full"
            initial={{ opacity: 0, y: "6%", scale: 0.97 }}
            animate={{ opacity: 1, y: "0%", scale: 1 }}
            exit={{ opacity: 0, y: "4%", scale: 0.98, transition: { duration: 0.25, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.9 }}
          >
            <ClientApp tableNumber={tableNumber} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.35 } }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
          >
            <Home onNavigate={navigateToClient} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}