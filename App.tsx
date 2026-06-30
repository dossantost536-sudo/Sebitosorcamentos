import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Calendar, 
  Users, 
  User, 
  ArrowRight,
  Info
} from "lucide-react";
import { categoryMeta, categoryOrder, menuItems } from "./data";
import { Category, MenuItem } from "./types";

export default function App() {
  // States
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeCat, setActiveCat] = useState<Category | "todos">("todos");
  const [custName, setCustName] = useState("");
  const [custDate, setCustDate] = useState("");
  const [custGuests, setCustGuests] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Helper functions
  const getItemById = (id: string): MenuItem | undefined => {
    return menuItems.find((item) => item.id === id);
  };

  const getCartCount = () => {
    return Object.keys(cart).reduce((sum, id) => sum + (cart[id] || 0), 0);
  };

  const getCartTotals = () => {
    let total = 0;
    let hasConsult = false;

    Object.keys(cart).forEach((id) => {
      const qty = cart[id] || 0;
      const item = getItemById(id);
      if (!item) return;
      if (item.price !== null) {
        total += item.price * qty;
      } else {
        hasConsult = true;
      }
    });

    return { total, hasConsult };
  };

  const formatPrice = (value: number) => {
    return "R$ " + value.toFixed(2).replace(".", ",");
  };

  // Cart operations
  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return {
        ...prev,
        [id]: next,
      };
    });
  };

  const toggleConsultItem = (id: string) => {
    setCart((prev) => {
      if (prev[id]) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      } else {
        return {
          ...prev,
          [id]: 1,
        };
      }
    });
  };

  const clearCart = () => {
    setCart({});
  };

  // Build the WhatsApp message content
  const handleSendWhatsApp = () => {
    const itemIds = Object.keys(cart);
    if (itemIds.length === 0) return;

    const lines: string[] = [];
    lines.push("Olá! Gostaria de um orçamento para o Sebito Festas e Eventos 🛒");
    lines.push("");

    if (custName.trim()) lines.push(`*Nome:* ${custName.trim()}`);
    if (custDate.trim()) lines.push(`*Data do evento:* ${custDate.trim()}`);
    if (custGuests.trim()) lines.push(`*Número de convidados:* ${custGuests.trim()}`);
    if (custName.trim() || custDate.trim() || custGuests.trim()) lines.push("");

    lines.push("*Itens escolhidos para o orçamento:*");

    categoryOrder.forEach((catKey) => {
      const catItemIds = itemIds.filter((id) => {
        const item = getItemById(id);
        return item && item.cat === catKey;
      });

      if (catItemIds.length === 0) return;

      const meta = categoryMeta[catKey];
      lines.push("");
      lines.push(`_${meta.label.toUpperCase()}_`);

      catItemIds.forEach((id) => {
        const item = getItemById(id);
        if (!item) return;
        const qty = cart[id] || 0;

        if (item.price !== null) {
          const itemTotal = item.price * qty;
          lines.push(`• ${item.name} (x${qty}) — ${formatPrice(itemTotal)}`);
        } else {
          lines.push(`• ${item.name} — *Sob consulta*`);
        }
      });
    });

    const { total, hasConsult } = getCartTotals();
    lines.push("");
    lines.push(`*Total estimado dos itens tabelados:* ${formatPrice(total)}`);
    if (hasConsult) {
      lines.push("_(+ itens especiais sob consulta, a serem calculados pela equipe)_");
    }

    lines.push("");
    lines.push("Fico no aguardo do retorno para fecharmos os detalhes. Obrigado!");

    const messageText = lines.join("\n");
    const formattedPhone = "554791348524"; // The number explicitly specified by the user (+55 47 9134-8524)
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;
    
    window.open(url, "_blank");
  };

  const { total: cartTotal, hasConsult: cartHasConsult } = getCartTotals();
  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-[#FBF2E7] text-[#2A211C] font-sans selection:bg-[#D9824F]/30 selection:text-[#2A211C] pb-32">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[900px] h-[500px] rounded-full bg-[#D9824F]/10 blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] w-[700px] h-[400px] rounded-full bg-[#D9824F]/8 blur-[100px]" />
      </div>

      <div className="max-w-xl mx-auto px-4 relative z-10">
        
        {/* Topbar / Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between py-4 bg-[#FBF2E7]/80 backdrop-blur-md border-b border-[#2A211C]/10 mb-6">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-2xl tracking-wide text-[#B8643A]">
              SEBITO
            </span>
            <span className="font-cursive text-base text-[#8C7B6C] -mt-1">
              festas e eventos
            </span>
          </div>
          
          <button 
            id="openCartBtn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-white border border-[#2A211C]/10 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Ver orçamento"
          >
            <ShoppingCart className="w-5 h-5 text-[#2A211C]" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#D9824F] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-[#FBF2E7]"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </header>

        {/* Hero Section */}
        <section className="mb-8">
          <h1 className="font-serif font-bold text-3xl leading-tight mb-3">
            Monte o orçamento do <span className="italic text-[#B8643A] font-medium font-serif">seu evento</span>
          </h1>
          <p className="text-[#8C7B6C] text-sm md:text-base leading-relaxed mb-6">
            Escolha os itens do cardápio, adicione-os à sua lista e envie diretamente pelo WhatsApp. Prático, rápido e sem complicações.
          </p>

          {/* Flow Steps */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 bg-white/60 border border-[#2A211C]/5 rounded-full px-4 py-2">
              <span className="w-5 h-5 rounded-full bg-[#D9824F] text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-xs font-medium text-[#2A211C]">Escolha os itens</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/60 border border-[#2A211C]/5 rounded-full px-4 py-2">
              <span className="w-5 h-5 rounded-full bg-[#D9824F] text-white text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-xs font-medium text-[#2A211C]">Ajuste as quantidades</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/60 border border-[#2A211C]/5 rounded-full px-4 py-2">
              <span className="w-5 h-5 rounded-full bg-[#D9824F] text-white text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-xs font-medium text-[#2A211C]">Envie no WhatsApp</span>
            </div>
          </div>
        </section>

        {/* Horizontal Category Navigation */}
        <nav className="sticky top-[69px] z-20 -mx-4 px-4 py-3 bg-[#FBF2E7]/90 backdrop-blur-md mb-6 overflow-x-auto scrollbar-none flex gap-2">
          <button
            onClick={() => setActiveCat("todos")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer border ${
              activeCat === "todos"
                ? "bg-[#D9824F] border-[#D9824F] text-white shadow-md shadow-[#D9824F]/20"
                : "bg-white border-[#2A211C]/10 text-[#2A211C] hover:bg-[#F1E1CC]/50"
            }`}
          >
            🍽️ Cardápio Completo
          </button>
          
          {categoryOrder.map((catKey) => {
            const meta = categoryMeta[catKey];
            const isActive = activeCat === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCat(catKey)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer border flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#D9824F] border-[#D9824F] text-white shadow-md shadow-[#D9824F]/20"
                    : "bg-white border-[#2A211C]/10 text-[#2A211C] hover:bg-[#F1E1CC]/50"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Menu Items Render */}
        <main className="space-y-8">
          {categoryOrder
            .filter((catKey) => activeCat === "todos" || activeCat === catKey)
            .map((catKey) => {
              const meta = categoryMeta[catKey];
              const itemsInThisCat = menuItems.filter((item) => item.cat === catKey);

              if (itemsInThisCat.length === 0) return null;

              return (
                <div key={catKey} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 border-b border-[#2A211C]/10 pb-2">
                    <span className="text-xl">{meta.icon}</span>
                    <h2 className="font-serif font-bold text-xl tracking-tight">
                      {meta.label}
                    </h2>
                  </div>
                  
                  {catKey === "servicos" && (
                    <div className="flex gap-2 items-start bg-white/50 border border-[#2A211C]/5 rounded-xl p-3 text-xs text-[#8C7B6C] leading-relaxed mb-2">
                      <Info className="w-4 h-4 text-[#D9824F] shrink-0 mt-0.5" />
                      <span>Nota: Louças, carrinhos e equipamentos básicos já estão sempre inclusos no atendimento, sem custo adicional de aluguel.</span>
                    </div>
                  )}

                  {/* Items Grid */}
                  <div className="space-y-3">
                    {itemsInThisCat.map((item) => {
                      const qty = cart[item.id] || 0;
                      const hasPrice = item.price !== null;

                      return (
                        <div 
                          key={item.id}
                          className="flex gap-4 p-3 bg-white border border-[#2A211C]/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                        >
                          {/* Image Container instead of Emojis */}
                          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F1E1CC] border border-[#2A211C]/10">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover animate-fade-in"
                            />
                            {qty > 0 && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center font-bold text-white text-xs backdrop-blur-[1px]">
                                {qty}x adicionado
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-grow flex flex-col justify-between min-w-0">
                            <div>
                              <h3 className="font-serif font-bold text-[15px] sm:text-base leading-snug">
                                {item.name}
                              </h3>
                              {item.desc && (
                                <p className="text-xs text-[#8C7B6C] line-clamp-2 mt-1 italic font-light leading-normal">
                                  {item.desc}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-[#2A211C]/5">
                              {/* Price display */}
                              {hasPrice ? (
                                <div className="text-sm font-semibold">
                                  {formatPrice(item.price!)}{" "}
                                  <span className="text-[10px] text-[#8C7B6C] font-normal">
                                    / {item.unit}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-block bg-[#D9824F]/10 text-[#B8643A] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Sob Consulta
                                </span>
                              )}

                              {/* Controls */}
                              {hasPrice ? (
                                qty > 0 ? (
                                  <div className="flex items-center border border-[#D9824F] rounded-full overflow-hidden bg-[#FFFDFA]">
                                    <button 
                                      onClick={() => updateQuantity(item.id, -1)}
                                      className="p-1.5 px-2.5 text-[#B8643A] hover:bg-[#FBF2E7] active:bg-[#F1E1CC] transition-colors cursor-pointer"
                                      aria-label="Diminuir"
                                    >
                                      <Minus className="w-3.5 h-3.5 font-bold" />
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold text-[#2A211C]">
                                      {qty}
                                    </span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, 1)}
                                      className="p-1.5 px-2.5 text-[#B8643A] hover:bg-[#FBF2E7] active:bg-[#F1E1CC] transition-colors cursor-pointer"
                                      aria-label="Aumentar"
                                    >
                                      <Plus className="w-3.5 h-3.5 font-bold" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(item.id)}
                                    className="bg-[#D9824F] hover:bg-[#B8643A] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => toggleConsultItem(item.id)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                                    qty > 0
                                      ? "bg-[#D9824F] border-[#D9824F] text-white"
                                      : "bg-white border-[#D9824F] text-[#B8643A] hover:bg-[#D9824F]/5"
                                  }`}
                                >
                                  {qty > 0 ? (
                                    <span className="flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5" /> Adicionado
                                    </span>
                                  ) : (
                                    "Quero Orçar"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </main>
      </div>

      {/* Floating Bottom Bar */}
      <AnimatePresence>
        {cartCount > 0 && !isCartOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FBF2E7] via-[#FBF2E7]/90 to-transparent z-40 flex justify-center"
          >
            <div className="w-full max-w-xl bg-[#2A211C] text-white rounded-full p-2.5 pl-6 flex items-center justify-between shadow-xl shadow-black/25">
              <div className="text-sm">
                <span className="font-bold font-serif text-base">{cartCount}</span> {cartCount === 1 ? "item selecionado" : "itens selecionados"}
                <div className="text-xs text-[#8C7B6C] -mt-0.5">
                  Estimativa: {formatPrice(cartTotal)}
                </div>
              </div>
              
              <button
                id="cartBarBtn"
                onClick={() => setIsCartOpen(true)}
                className="bg-[#D9824F] hover:bg-[#B8643A] text-white text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Ver Orçamento <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sheet / Modal Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-[#FBF2E7] rounded-t-[28px] max-h-[90vh] z-50 flex flex-col shadow-2xl max-w-xl mx-auto border-t border-[#2A211C]/10"
            >
              {/* Drag Handle indicator */}
              <div className="w-10 h-1 bg-[#2A211C]/15 rounded-full mx-auto my-3 shrink-0" />
              
              {/* Modal Header */}
              <div className="px-6 pb-4 border-b border-[#2A211C]/10 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-serif font-bold text-2xl">Seu Orçamento</h2>
                  <p className="text-xs text-[#8C7B6C]">Complete as informações e envie no WhatsApp</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-[#2A211C]/5 rounded-full transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 text-[#2A211C]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                
                {/* Chosen items list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-[#B8643A]">Itens Selecionados</h3>
                    {cartCount > 0 && (
                      <button 
                        onClick={clearCart}
                        className="text-xs text-[#8C7B6C] hover:text-red-500 hover:underline transition-colors cursor-pointer"
                      >
                        Limpar lista
                      </button>
                    )}
                  </div>

                  {Object.keys(cart).length === 0 ? (
                    <div className="text-center py-8 text-[#8C7B6C] bg-white/40 border border-[#2A211C]/5 rounded-2xl text-sm">
                      Nenhum item adicionado ainda.<br />Navegue pelo cardápio e adicione itens para orçar!
                    </div>
                  ) : (
                    <div className="bg-white/80 border border-[#2A211C]/5 rounded-2xl p-4 divide-y divide-[#2A211C]/5">
                      {Object.keys(cart).map((id) => {
                        const item = getItemById(id);
                        if (!item) return null;
                        const qty = cart[id] || 0;

                        const hasPrice = item.price !== null;
                        const lineSubtotal = hasPrice ? item.price! * qty : null;

                        return (
                          <div key={id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0 gap-3">
                            <div className="min-w-0">
                              <div className="font-bold text-[14px] leading-tight text-[#2A211C]">{item.name}</div>
                              <div className="text-xs text-[#8C7B6C] mt-0.5">
                                {hasPrice ? `${qty}x ${formatPrice(item.price!)} / ${item.unit}` : "Valor a ser calculado"}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-bold text-[14px] text-[#2A211C]">
                                {lineSubtotal !== null ? formatPrice(lineSubtotal) : "Sob consulta"}
                              </span>
                              <button 
                                onClick={() => removeFromCart(id)}
                                className="p-1 hover:bg-red-50 text-[#8C7B6C] hover:text-red-500 rounded-full transition-all cursor-pointer"
                                aria-label="Remover item"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Customer Event Form */}
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-base text-[#B8643A]">Informações do Evento</h3>
                  
                  <div className="space-y-3 bg-white/80 border border-[#2A211C]/5 rounded-2xl p-4">
                    <div className="space-y-1">
                      <label htmlFor="custName" className="text-xs font-semibold text-[#8C7B6C] flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Seu Nome
                      </label>
                      <input 
                        type="text" 
                        id="custName"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Como podemos te chamar?"
                        className="w-full bg-[#FBF2E7]/40 border border-[#2A211C]/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#D9824F] focus:border-[#D9824F] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="custDate" className="text-xs font-semibold text-[#8C7B6C] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Data do Evento <span className="text-[10px] text-[#8C7B6C] font-normal">(opcional)</span>
                        </label>
                        <input 
                          type="text" 
                          id="custDate"
                          value={custDate}
                          onChange={(e) => setCustDate(e.target.value)}
                          placeholder="Ex: 15/08/2026"
                          className="w-full bg-[#FBF2E7]/40 border border-[#2A211C]/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#D9824F] focus:border-[#D9824F] transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="custGuests" className="text-xs font-semibold text-[#8C7B6C] flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> N° de Convidados <span className="text-[10px] text-[#8C7B6C] font-normal">(opcional)</span>
                        </label>
                        <input 
                          type="text" 
                          id="custGuests"
                          value={custGuests}
                          onChange={(e) => setCustGuests(e.target.value)}
                          placeholder="Ex: 80 convidados"
                          className="w-full bg-[#FBF2E7]/40 border border-[#2A211C]/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#D9824F] focus:border-[#D9824F] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#2A211C]/10 bg-[#FBF2E7]/95 shrink-0 rounded-b-[28px] pb-8">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold text-[#8C7B6C]">Total Estimado</span>
                  <span className="font-serif font-bold text-2xl text-[#2A211C]" id="cartTotal">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                
                {cartHasConsult && (
                  <p className="text-[11px] text-[#8C7B6C] mb-4 bg-white/40 border border-[#2A211C]/5 rounded-lg p-2.5 leading-normal">
                    ⚠️ Itens rotulados como <strong>"Sob consulta"</strong> estão inclusos no detalhamento enviado e terão o valor adicional calculado e confirmado diretamente com você pelo atendimento.
                  </p>
                )}

                <div className="space-y-2.5">
                  <button
                    id="sendBtn"
                    onClick={handleSendWhatsApp}
                    disabled={cartCount === 0}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-6 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.6.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5C10 9 9.4 7.6 9.2 7c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3z"/>
                      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.3-1.2l-.3-.2-3.2 1 1-3.1-.2-.3A8.2 8.2 0 1 1 20.2 12 8.2 8.2 0 0 1 12 20.2z"/>
                    </svg>
                    Enviar orçamento pelo WhatsApp
                  </button>

                  <button
                    id="continueBtn"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center text-xs font-semibold text-[#8C7B6C] hover:text-[#2A211C] py-2 transition-colors cursor-pointer"
                  >
                    Continuar escolhendo
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
