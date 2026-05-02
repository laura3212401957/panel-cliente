import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Search, ArrowLeft, X } from "lucide-react";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface MenuProps {
  tableNumber: string;
  cart: Array<{ product: Product; quantity: number }>;
  onAddToCart: (product: Product) => void;
  onViewCart: () => void;
  onProductClick: (product: Product) => void;
}

export function Menu({ tableNumber, cart, onAddToCart, onViewCart, onProductClick }: MenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80493524/menu`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.log("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filtros basados en categorías reales
  const dishTypes = [
    { id: "todos", name: "Todos" },
    { id: "platos-principales", name: "Platos Principales" },
    { id: "sopas-caldos", name: "Sopas y Caldos" },
    { id: "bebidas", name: "Bebidas" }
  ];

  let allProducts: Product[] = [];

  // Si el filtro es "todos", mostrar todos los productos de todas las categorías
  if (activeFilter === "todos") {
    allProducts = categories.flatMap(cat => cat.products);
  } else {
    // Mostrar productos de la categoría seleccionada en el filtro
    const filteredCategory = categories.find(cat => cat.id === activeFilter);
    allProducts = filteredCategory?.products || [];
  }

  // Filtrar por búsqueda
  let activeProducts = allProducts;
  if (searchQuery.trim()) {
    activeProducts = activeProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const currentScrollY = container.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
      setFiltersVisible(false);
    } else {
      setFiltersVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const handleSearchToggle = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery("");
    } else {
      setSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#E63946] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="px-5 py-6">

          {/* Fila título — siempre visible, nunca se tapa */}
          <div className="flex items-center justify-between mb-0">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" strokeWidth={2.5} />
              </a>
              <h1 className="text-3xl font-black text-[#1a1a1a]">Menú</h1>
            </div>

            {/* Botones acción — lupa + carrito */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearchToggle}
                className={`p-3 rounded-full transition-all duration-200 ${
                  searchOpen
                    ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {searchOpen
                  ? <X className="w-5 h-5" strokeWidth={2.5} />
                  : <Search className="w-5 h-5" strokeWidth={2.5} />
                }
              </button>

              <button
                onClick={onViewCart}
                data-cart-button="true"
                className="relative bg-[#F4A261] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E63946] text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Barra de búsqueda — se desliza hacia abajo al pulsar la lupa */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: searchOpen ? "68px" : "0px",
              opacity: searchOpen ? 1 : 0,
              marginTop: searchOpen ? "16px" : "0px",
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2.5} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar platos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && handleSearchToggle()}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 font-bold text-[#1a1a1a] placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Category filters */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: filtersVisible ? "60px" : "0px",
              opacity: filtersVisible ? 1 : 0,
              marginTop: "16px",
              marginBottom: filtersVisible ? "0px" : "-8px",
            }}
          >
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {dishTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveFilter(type.id)}
                  className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                    activeFilter === type.id
                      ? "bg-gradient-to-r from-[#E63946] to-[#F4A261] text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50 no-scrollbar"
      >
        <div className="grid grid-cols-3 gap-2">
          {activeProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-white text-[#E63946] font-black text-sm px-2.5 py-1 rounded-full shadow-md">
                  ${product.price.toLocaleString()}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-[#1a1a1a] text-lg line-clamp-2 leading-tight">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {activeProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">
              {searchQuery ? "No se encontraron resultados" : "No hay productos disponibles"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}