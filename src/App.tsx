/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  ShoppingCart, 
  Trash2, 
  ChevronRight, 
  CheckCircle2,
  Package,
  Briefcase,
  Search,
  Filter,
  FileText,
  Share2,
  Palette,
  Globe,
  Image as ImageIcon,
  TrendingUp,
  Target,
  Menu,
  X,
  AlertCircle,
  PauseCircle,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './lib/utils';
import { User, UserRole, Product, Proposal, ProposalItem, Combo, Category } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './constants';
import { supabase } from './lib/supabase';

// --- Mock Data & Helpers ---

const ICON_MAP: Record<string, React.ReactNode> = {
  Share2: <Share2 className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Image: <ImageIcon className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  ShoppingCart: <ShoppingCart className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  // Category mapping
  'Planejamento': <Target className="w-5 h-5" />,
  'Social Media': <Share2 className="w-5 h-5" />,
  'Conteúdo': <FileText className="w-5 h-5" />,
  'Vídeo': <ImageIcon className="w-5 h-5" />,
  'Tráfego': <TrendingUp className="w-5 h-5" />,
  'Copy': <FileText className="w-5 h-5" />,
  'Automação e CRM': <Users className="w-5 h-5" />,
  'Design': <Palette className="w-5 h-5" />,
  'Desenvolvimento': <Globe className="w-5 h-5" />,
  'Blog': <FileText className="w-5 h-5" />,
};

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function App() {
  const [user] = useState<User>({
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Usuário',
    email: 'public@calcchan.com',
    role: 'ADM'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cart, setCart] = useState<ProposalItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const isInitializing = useRef(false);

  // Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setLoadingTimeout(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Initialization Logic
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const fetchAppData = async () => {
      console.log('Iniciando fetchAppData...');
      try {
        const startTime = Date.now();
        
        // Fetch in parallel but with individual error handling
        const fetchUsers = supabase.from('users').select('*');
        const fetchCategories = supabase.from('categories').select('*').order('order', { ascending: true });
        const fetchProducts = supabase.from('products').select('*');
        const fetchCombos = supabase.from('combos').select('*');
        const fetchProposals = supabase.from('proposals').select('*').order('created_at', { ascending: false });

        const results = await Promise.allSettled([
          fetchUsers,
          fetchCategories,
          fetchProducts,
          fetchCombos,
          fetchProposals
        ]);

        console.log(`FetchAppData: Todas as queries finalizadas em ${Date.now() - startTime}ms`);

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Query ${index} falhou:`, result.reason);
            return;
          }

          const { data, error } = result.value;
          if (error) {
            console.error(`Erro na query ${index}:`, error);
            return;
          }

          switch (index) {
            case 0: // Users (Ignored in open system)
              break;
            case 1: // Categories
              if (data) setCategories(data);
              break;
            case 2: // Products
              if (data) setProducts(data.map((p: any) => ({ ...p, categoryId: p.category_id })));
              break;
            case 3: // Combos
              if (data) setCombos(data.map((c: any) => ({ 
                ...c, 
                productIds: c.product_ids, 
                discountPercentage: c.discount_percentage, 
                totalPrice: c.total_price 
              })));
              break;
            case 4: // Proposals
              if (data) {
                setProposals(data.map((p: any) => ({
                  ...p,
                  createdAt: p.created_at,
                  createdBy: p.created_by,
                  clientName: p.client_name,
                  discountAmount: p.discount_amount,
                  discountType: p.discount_type,
                })));
              }
              break;
          }
        });
      } catch (err) {
        console.error('Erro crítico em fetchAppData:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppData();
  }, []);

  // Filtered Data (All visible in open system)
  const visibleProposals = proposals;

  const [dashboardFilter, setDashboardFilter] = useState({
    startDate: '',
    endDate: '',
    userId: 'all'
  });

  const dashboardProposals = useMemo(() => {
    let filtered = [...visibleProposals];
    
    if (dashboardFilter.startDate) {
      filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(dashboardFilter.startDate));
    }
    if (dashboardFilter.endDate) {
      const end = new Date(dashboardFilter.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.createdAt) <= end);
    }
    if (dashboardFilter.userId !== 'all') {
      filtered = filtered.filter(p => p.createdBy === dashboardFilter.userId);
    }
    
    return filtered;
  }, [visibleProposals, dashboardFilter]);

  // Dashboard Logic

  const [currentStep, setCurrentStep] = useState(-1);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order);
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const category = sortedCategories[currentStep];
    if (!category) return [];
    return products.filter(p => p.categoryId === category.id);
  }, [products, sortedCategories, currentStep]);

  const nextStep = () => {
    if (currentStep < sortedCategories.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { productId: product.id, quantity: 1, priceAtTime: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [cart, products]);

  const finalTotal = useMemo(() => {
    if (discountType === 'PERCENTAGE') {
      return cartTotal * (1 - discountValue / 100);
    }
    return Math.max(0, cartTotal - discountValue);
  }, [cartTotal, discountValue, discountType]);

  const applyCombo = (combo: Combo) => {
    const newItems = combo.productIds.map(pid => {
      const product = products.find(p => p.id === pid);
      return {
        productId: pid,
        quantity: 1,
        priceAtTime: product?.price || 0
      };
    });
    setCart(newItems);
    setDiscountType('PERCENTAGE');
    setDiscountValue(combo.discountPercentage);
    setCurrentStep(0);
  };

  const saveProposal = async (clientName: string) => {
    if (!user || cart.length === 0) return;
    
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
    
    const discountAmount = discountType === 'PERCENTAGE' 
      ? (subtotal * discountValue) / 100 
      : discountValue;
    
    const total = subtotal - discountAmount;

    const proposalData = {
      client_name: clientName,
      items: cart,
      subtotal,
      discount_amount: discountAmount,
      discount_type: discountType,
      total,
      status: 'RASCUNHO',
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('proposals')
      .insert([proposalData])
      .select()
      .single();

    if (error) {
      alert('Erro ao salvar proposta: ' + error.message);
      return;
    }

    const newProposal: Proposal = {
      ...data,
      id: data.id,
      clientName: data.client_name,
      createdAt: data.created_at,
      createdBy: data.created_by,
      discountAmount: data.discount_amount,
      discountType: data.discount_type,
    };

    setProposals(prev => [newProposal, ...prev]);
    setCart([]);
    setDiscountValue(0);
    setCurrentStep(0);
    setActiveTab('proposals');
  };

  const updateProposalStatus = async (id: string, status: Proposal['status']) => {
    const { error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id);
    
    if (error) return alert(error.message);
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const [productsSubTab, setProductsSubTab] = useState<'products' | 'categories' | 'combos'>('products');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const order = parseInt(formData.get('order') as string);
      const icon = formData.get('icon') as string;

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ name, order, icon })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name, order, icon } : c));
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name, order, icon }])
          .select()
          .single();
        
        if (error) throw error;
        setCategories(prev => [...prev, data]);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert('Erro ao salvar categoria: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const price = parseFloat(formData.get('price') as string);
      const categoryId = formData.get('categoryId') as string;
      const description = formData.get('description') as string;
      const icon = formData.get('icon') as string;

      const productData = { name, price, category_id: categoryId, description, icon };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, name, price, categoryId, description, icon } : p));
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        if (error) throw error;
        setProducts(prev => [...prev, { ...data, categoryId: data.category_id }]);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCombo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const discountPercentage = parseFloat(formData.get('discountPercentage') as string);
      const selectedProductIds = Array.from(formData.getAll('productIds')) as string[];

      const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
      const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
      const totalPrice = subtotal * (1 - discountPercentage / 100);

      const comboData = {
        name,
        product_ids: selectedProductIds,
        discount_percentage: discountPercentage,
        total_price: totalPrice
      };

      if (editingCombo) {
        const { error } = await supabase
          .from('combos')
          .update(comboData)
          .eq('id', editingCombo.id);
        
        if (error) throw error;
        setCombos(prev => prev.map(c => c.id === editingCombo.id ? { ...c, name, productIds: selectedProductIds, discountPercentage, totalPrice } : c));
      } else {
        const { data, error } = await supabase
          .from('combos')
          .insert([comboData])
          .select()
          .single();
        
        if (error) throw error;
        setCombos(prev => [...prev, {
          ...data,
          productIds: data.product_ids,
          discountPercentage: data.discount_percentage,
          totalPrice: data.total_price
        }]);
      }
      setIsComboModalOpen(false);
      setEditingCombo(null);
    } catch (error: any) {
      console.error('Error saving combo:', error);
      alert('Erro ao salvar combo: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todos os produtos vinculados ficarão sem categoria.')) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) return alert(error.message);
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) return alert(error.message);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const deleteCombo = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este combo?')) {
      const { error } = await supabase
        .from('combos')
        .delete()
        .eq('id', id);
      
      if (error) return alert(error.message);
      setCombos(prev => prev.filter(c => c.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Carregando Calc Chan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 relative z-40">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Calculator className="text-white" size={24} />
          </div>
          <span className="text-xl font-display font-bold">Calc Chan</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Calculator} 
            label="Simulador" 
            active={activeTab === 'builder'} 
            onClick={() => {
              setActiveTab('builder');
              setCurrentStep(-1);
              setCart([]);
              setDiscountValue(0);
            }} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Propostas" 
            active={activeTab === 'proposals'} 
            onClick={() => setActiveTab('proposals')} 
          />
          <SidebarItem 
            icon={Package} 
            label="Produtos" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="px-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Calc Chan v1.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Calculator className="text-white" size={18} />
          </div>
          <span className="font-display font-bold">Calc Chan</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 relative z-0">
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Bem-vindo! 👋</h2>
                    <p className="text-slate-500 mt-1">Aqui está o resumo da sua agência hoje.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => {
                        setActiveTab('builder');
                        setCurrentStep(-1);
                        setCart([]);
                        setDiscountValue(0);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm"
                    >
                      <Plus size={18} />
                      Simulador
                    </button>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                      <Filter size={16} className="text-slate-400" />
                      <input 
                        type="date" 
                        value={dashboardFilter.startDate}
                        onChange={(e) => setDashboardFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        className="text-xs font-bold outline-none bg-transparent"
                      />
                      <span className="text-slate-300">|</span>
                      <input 
                        type="date" 
                        value={dashboardFilter.endDate}
                        onChange={(e) => setDashboardFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className="text-xs font-bold outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Propostas Ativas', value: dashboardProposals.filter(p => p.status === 'ENVIADO' || p.status === 'RASCUNHO').length, icon: FileText, color: 'bg-blue-500' },
                    { label: 'Propostas Fechadas', value: dashboardProposals.filter(p => p.status === 'FECHADO').length, icon: CheckCircle, color: 'bg-emerald-500' },
                    { label: 'Vendas no Período', value: `R$ ${dashboardProposals.filter(p => p.status === 'FECHADO').reduce((acc, curr) => acc + curr.total, 0).toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'bg-indigo-500' },
                    { label: 'Propostas Pausadas', value: dashboardProposals.filter(p => p.status === 'PAUSADO').length, icon: PauseCircle, color: 'bg-slate-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg", stat.color)}>
                        <stat.icon size={24} />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Propostas no Período</h3>
                      <button onClick={() => setActiveTab('proposals')} className="text-indigo-600 text-sm font-bold hover:underline">Ver todas</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardProposals.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-slate-400">Nenhuma proposta encontrada para os filtros aplicados.</div>
                      ) : (
                        dashboardProposals.slice(0, 6).map((p) => {
                          return (
                            <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                  <FileText size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{p.clientName}</p>
                                  <p className="text-xs text-slate-500">
                                    {format(new Date(p.createdAt), 'dd/MM/yyyy HH:mm')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm text-slate-900">R$ {p.total.toLocaleString('pt-BR')}</p>
                                <span className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                  p.status === 'RASCUNHO' ? "bg-blue-100 text-blue-700" :
                                  p.status === 'ENVIADO' ? "bg-orange-100 text-orange-700" :
                                  p.status === 'FECHADO' ? "bg-emerald-100 text-emerald-700" :
                                  p.status === 'PERDIDO' ? "bg-red-100 text-red-700" :
                                  "bg-slate-100 text-slate-700"
                                )}>{p.status}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'builder' && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col gap-6"
              >
                <header className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">Simulador</h2>
                    <p className="text-slate-500 text-sm mt-1">
                      {currentStep === -1 
                        ? 'Passo 1: Escolha um Combo ou Inicie do Zero'
                        : currentStep < sortedCategories.length 
                          ? `Passo ${currentStep + 2}: ${sortedCategories[currentStep]?.name}` 
                          : 'Revisão Final'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Parcial</span>
                      <span className="text-lg font-display font-bold text-indigo-600">R$ {cartTotal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 relative">
                      <ShoppingCart size={20} />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {cart.reduce((s, i) => s + i.quantity, 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                {/* Horizontal Step Indicator - Scrollable on Mobile */}
                <div className="relative -mx-4 px-4 lg:mx-0 lg:px-0">
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    <button
                      onClick={() => setCurrentStep(-1)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap",
                        currentStep === -1 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : cart.length > 0
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                        currentStep === -1 ? "bg-white text-indigo-600" : 
                        cart.length > 0 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        {cart.length > 0 && currentStep !== -1 ? <CheckCircle2 size={14} /> : 1}
                      </div>
                      <span className="text-sm font-bold">Combos</span>
                    </button>

                    {sortedCategories.map((cat, i) => (
                      <button
                        key={cat.id}
                        onClick={() => setCurrentStep(i)}
                        className={cn(
                          "flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap",
                          i === currentStep 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                            : i < currentStep 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                          i === currentStep ? "bg-white text-indigo-600" : 
                          i < currentStep ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          {i < currentStep ? <CheckCircle2 size={14} /> : i + 2}
                        </div>
                        <span className="text-sm font-bold">{cat.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentStep(sortedCategories.length)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap",
                        currentStep === sortedCategories.length 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                        currentStep === sortedCategories.length ? "bg-white text-indigo-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {sortedCategories.length + 2}
                      </div>
                      <span className="text-sm font-bold">Revisão</span>
                    </button>
                  </div>
                  {/* Fade effects for scroll */}
                  <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none lg:hidden" />
                  <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none lg:hidden" />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">
                    {currentStep === -1 ? (
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Package size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">Combos Sugeridos</h3>
                              <p className="text-slate-500 text-sm">Comece com um pacote pronto ou pule para personalizar.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setCurrentStep(0)}
                            className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                          >
                            Pular para Personalizado
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {combos.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-200">
                              Nenhum combo cadastrado. <br/>
                              <button onClick={() => setCurrentStep(0)} className="mt-4 text-indigo-600 font-bold hover:underline">Iniciar pacote personalizado</button>
                            </div>
                          ) : (
                            combos.map((combo) => (
                              <div 
                                key={combo.id} 
                                onClick={() => applyCombo(combo)}
                                className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 cursor-pointer hover:scale-[1.02] transition-all group"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <Package size={24} />
                                  </div>
                                  <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-lg">-{combo.discountPercentage}% OFF</span>
                                </div>
                                <h4 className="font-bold text-xl">{combo.name}</h4>
                                <div className="mt-3 space-y-1">
                                  {combo.productIds.slice(0, 3).map(pid => {
                                    const p = products.find(prod => prod.id === pid);
                                    return (
                                      <div key={pid} className="flex items-center gap-2 text-xs text-white/80">
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                        {p?.name}
                                      </div>
                                    );
                                  })}
                                  {combo.productIds.length > 3 && (
                                    <p className="text-[10px] text-white/60 font-medium">+ {combo.productIds.length - 3} outros itens</p>
                                  )}
                                </div>
                                <div className="mt-8 flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] text-white/60 uppercase font-bold">Investimento</p>
                                    <span className="text-2xl font-display font-bold">R$ {combo.totalPrice.toLocaleString('pt-BR')}</span>
                                  </div>
                                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white text-white group-hover:text-indigo-600 transition-all">
                                    <ChevronRight size={20} />
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : currentStep < sortedCategories.length ? (
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            {ICON_MAP[sortedCategories[currentStep]?.icon] || <Package size={24} />}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{sortedCategories[currentStep]?.name}</h3>
                            <p className="text-slate-500 text-sm">Escolha os serviços ideais para esta etapa.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredProducts.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-200">
                              Nenhum produto nesta categoria.
                            </div>
                          ) : (
                            filteredProducts.map((product) => {
                              const inCart = cart.find(i => i.productId === product.id);
                              return (
                                <div 
                                  key={product.id} 
                                  onClick={() => addToCart(product)}
                                  className={cn(
                                    "relative bg-white p-5 rounded-3xl border transition-all cursor-pointer group active:scale-95",
                                    inCart ? "border-indigo-600 ring-4 ring-indigo-50 shadow-lg" : "border-slate-200 hover:border-indigo-300"
                                  )}
                                >
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
                                    inCart ? "bg-indigo-600 text-white" : "bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                                  )}>
                                    {ICON_MAP[product.icon] || <Package size={20} />}
                                  </div>
                                  <h4 className="font-bold text-base leading-tight">{product.name}</h4>
                                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                                  <div className="mt-4 flex items-center justify-between">
                                    <span className="text-lg font-display font-bold text-indigo-600">R$ {product.price}</span>
                                    {inCart ? (
                                      <div className="flex items-center gap-2 bg-indigo-50 p-1 rounded-full">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                                          className="w-7 h-7 rounded-full bg-white text-red-500 flex items-center justify-center shadow-sm hover:text-red-600"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                        <span className="w-7 h-7 flex items-center justify-center font-bold text-xs text-indigo-600">
                                          {inCart.quantity}
                                        </span>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                          className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm"
                                        >
                                          <Plus size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Plus size={16} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-emerald-900">Revisão Final</h3>
                            <p className="text-emerald-700/70 text-sm">Confira os detalhes antes de gerar a proposta.</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-700">Serviços Selecionados</h4>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{cart.length} itens</span>
                          </div>
                          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                            {cart.map((item) => {
                              const product = products.find(p => p.id === item.productId);
                              return (
                                <div key={item.productId} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                      {product ? ICON_MAP[product.icon] : <Package size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-sm truncate">{product?.name}</p>
                                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                                        {categories.find(c => c.id === product?.categoryId)?.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-sm text-slate-900">R$ {(product?.price || 0) * item.quantity}</p>
                                    <p className="text-[10px] text-slate-400">{item.quantity}x R$ {product?.price}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500 font-medium">Subtotal</span>
                              <span className="text-slate-700 font-bold">R$ {cartTotal.toLocaleString('pt-BR')}</span>
                            </div>
                            {discountValue > 0 && (
                              <div className="flex items-center justify-between text-sm text-red-500">
                                <span className="font-medium">Desconto ({discountType === 'PERCENTAGE' ? `${discountValue}%` : `R$ ${discountValue}`})</span>
                                <span className="font-bold">- R$ {(cartTotal - finalTotal).toLocaleString('pt-BR')}</span>
                              </div>
                            )}
                            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-900">Investimento Total</span>
                              <span className="text-2xl font-display font-bold text-indigo-600">R$ {finalTotal.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <TrendingUp size={16} className="text-indigo-600" />
                              Aplicar Desconto
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1 flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                <button 
                                  onClick={() => setDiscountType('PERCENTAGE')}
                                  className={cn(
                                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                                    discountType === 'PERCENTAGE' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                                  )}
                                >
                                  Porcentagem (%)
                                </button>
                                <button 
                                  onClick={() => setDiscountType('FIXED')}
                                  className={cn(
                                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                                    discountType === 'FIXED' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                                  )}
                                >
                                  Valor Fixo (R$)
                                </button>
                              </div>
                              <div className="flex-1 relative">
                                <input 
                                  type="number" 
                                  value={discountValue || ''}
                                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                                  placeholder={discountType === 'PERCENTAGE' ? "Ex: 10%" : "Ex: 500"}
                                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                  {discountType === 'PERCENTAGE' ? '%' : 'R$'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100">
                            <label className="block">
                              <span className="text-sm font-bold text-slate-700 ml-1">Nome do Cliente / Empresa</span>
                              <input 
                                type="text" 
                                placeholder="Ex: Tech Solutions Ltda"
                                id="client-name-final"
                                className="w-full mt-2 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-lg font-medium"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sticky Navigation Bar for Mobile & Desktop */}
                  <div className="fixed lg:relative bottom-0 left-0 right-0 p-4 lg:p-0 bg-white/80 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none border-t lg:border-t-0 border-slate-200 lg:mt-6 z-40">
                    <div className="max-w-5xl mx-auto flex gap-3">
                      <button 
                        onClick={prevStep}
                        disabled={currentStep === -1}
                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                      >
                        Anterior
                      </button>
                      {currentStep < sortedCategories.length ? (
                        <button 
                          onClick={nextStep}
                          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          Próximo Passo
                          <ChevronRight size={20} />
                        </button>
                      ) : (
                        <button 
                          disabled={cart.length === 0}
                          onClick={() => {
                            const input = document.getElementById('client-name-final') as HTMLInputElement;
                            if (input.value) saveProposal(input.value);
                            else alert('Por favor, insira o nome do cliente.');
                          }}
                          className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          Finalizar Proposta
                          <CheckCircle2 size={20} />
                        </button>
                      )}
                    </div>
                    {currentStep < sortedCategories.length && (
                      <button 
                        onClick={nextStep}
                        className="w-full mt-2 py-1 text-slate-400 text-[10px] font-bold hover:text-indigo-600 transition-colors uppercase tracking-widest"
                      >
                        Pular esta categoria
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'proposals' && (
              <motion.div
                key="proposals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Propostas</h2>
                    <p className="text-slate-500 mt-1">Gerencie todas as propostas enviadas e rascunhos.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('builder')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    <Plus size={20} />
                    Simulador
                  </button>
                </header>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Buscar por cliente..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                        <Filter size={16} />
                        Filtros
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {visibleProposals.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhuma proposta encontrada.</td>
                          </tr>
                        ) : (
                          visibleProposals.map((p) => {
                            return (
                              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-900">{p.clientName}</p>
                                  <p className="text-xs text-slate-500">ID: {p.id}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {format(new Date(p.createdAt), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-900">R$ {p.total.toLocaleString('pt-BR')}</p>
                                  {p.discountAmount > 0 && (
                                    <p className="text-[10px] text-red-500 font-bold">
                                      - {p.discountType === 'PERCENTAGE' ? `${p.discountAmount}%` : `R$ ${p.discountAmount}`}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <select 
                                    value={p.status}
                                    onChange={(e) => updateProposalStatus(p.id, e.target.value as Proposal['status'])}
                                    className={cn(
                                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase outline-none border-none cursor-pointer transition-all",
                                      p.status === 'RASCUNHO' ? "bg-blue-100 text-blue-700" :
                                      p.status === 'ENVIADO' ? "bg-orange-100 text-orange-700" :
                                      p.status === 'FECHADO' ? "bg-emerald-100 text-emerald-700" :
                                      p.status === 'PERDIDO' ? "bg-red-100 text-red-700" :
                                      "bg-slate-100 text-slate-700"
                                    )}
                                  >
                                    <option value="RASCUNHO">Rascunho</option>
                                    <option value="ENVIADO">Enviado</option>
                                    <option value="FECHADO">Fechado</option>
                                    <option value="PERDIDO">Perdido</option>
                                    <option value="PAUSADO">Pausado</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ChevronRight size={20} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Gestão Comercial</h2>
                    <p className="text-slate-500 mt-1">Gerencie categorias, produtos e combos da agência.</p>
                  </div>
                  <div className="flex gap-3">
                    {productsSubTab === 'categories' && (
                      <button 
                        onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
                        <Plus size={20} />
                        Nova Categoria
                      </button>
                    )}
                    {productsSubTab === 'products' && (
                      <button 
                        onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
                        <Plus size={20} />
                        Novo Produto
                      </button>
                    )}
                    {productsSubTab === 'combos' && (
                      <button 
                        onClick={() => { setEditingCombo(null); setIsComboModalOpen(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
                        <Plus size={20} />
                        Novo Combo
                      </button>
                    )}
                  </div>
                </header>

                <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto scrollbar-hide">
                  <button 
                    onClick={() => setProductsSubTab('products')}
                    className={cn(
                      "px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap",
                      productsSubTab === 'products' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Produtos
                  </button>
                  <button 
                    onClick={() => setProductsSubTab('categories')}
                    className={cn(
                      "px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap",
                      productsSubTab === 'categories' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Categorias (Passos)
                  </button>
                  <button 
                    onClick={() => setProductsSubTab('combos')}
                    className={cn(
                      "px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap",
                      productsSubTab === 'combos' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Combos
                  </button>
                </div>

                {productsSubTab === 'products' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((p) => {
                        const cat = categories.find(c => c.id === p.categoryId);
                        return (
                          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group">
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {ICON_MAP[p.icon] || <Package size={24} />}
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                  className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                >
                                  <Settings size={18} />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(p.id)}
                                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-bold text-lg">{p.name}</h4>
                            <p className="text-slate-500 text-sm mt-1">{cat?.name || 'Sem categoria'}</p>
                            <div className="mt-6 flex items-center justify-between">
                              <span className="text-2xl font-display font-bold text-indigo-600">R$ {p.price.toLocaleString('pt-BR')}</span>
                              <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-600">Ativo</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {productsSubTab === 'categories' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ordem</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ícone</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Produtos</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {sortedCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                                  {cat.order}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-900">{cat.name}</p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  {ICON_MAP[cat.icon] || <Package size={16} />}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-slate-500">
                                  {products.filter(p => p.categoryId === cat.id).length} produtos
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                  >
                                    <Settings size={18} />
                                  </button>
                                  <button 
                                    onClick={() => deleteCategory(cat.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {productsSubTab === 'combos' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {combos.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">
                          Nenhum combo cadastrado ainda.
                        </div>
                      ) : (
                        combos.map((combo) => (
                          <div key={combo.id} className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 group">
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Package size={24} />
                              </div>
                              <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-lg">Economia de {combo.discountPercentage}%</span>
                            </div>
                            <h4 className="font-bold text-xl">{combo.name}</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {combo.productIds.map(pid => {
                                const p = products.find(prod => prod.id === pid);
                                return (
                                  <span key={pid} className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
                                    {p?.name}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                              <span className="text-2xl font-display font-bold">R$ {combo.totalPrice.toLocaleString('pt-BR')}</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => { setEditingCombo(combo); setIsComboModalOpen(true); }}
                                  className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                                >
                                  <Settings size={18} />
                                </button>
                                <button 
                                  onClick={() => deleteCombo(combo.id)}
                                  className="p-2 bg-white/20 rounded-xl hover:bg-red-500/50 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] lg:hidden p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Calculator className="text-white" size={24} />
                </div>
                <span className="text-xl font-display font-bold">Calc Chan</span>
              </div>

              <nav className="flex-1 space-y-2">
                <SidebarItem 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={activeTab === 'dashboard'} 
                  onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
                />
                <SidebarItem 
                  icon={Calculator} 
                  label="Simulador" 
                  active={activeTab === 'builder'} 
                  onClick={() => { 
                    setActiveTab('builder'); 
                    setCurrentStep(-1); 
                    setCart([]); 
                    setDiscountValue(0); 
                    setIsMobileMenuOpen(false); 
                  }} 
                />
                <SidebarItem 
                  icon={FileText} 
                  label="Propostas" 
                  active={activeTab === 'proposals'} 
                  onClick={() => { setActiveTab('proposals'); setIsMobileMenuOpen(false); }} 
                />
                <SidebarItem 
                  icon={Package} 
                  label="Produtos" 
                  active={activeTab === 'products'} 
                  onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} 
                />
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="px-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Calc Chan v1.0</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Categoria</label>
                  <input name="name" defaultValue={editingCategory?.name} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ordem (Dobra)</label>
                    <input name="order" type="number" defaultValue={editingCategory?.order} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ícone (Lucide Name)</label>
                    <select name="icon" defaultValue={editingCategory?.icon || 'Package'} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                      {Object.keys(ICON_MAP).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Categoria'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Preço (R$)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                    <select name="categoryId" defaultValue={editingProduct?.categoryId} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">Selecione...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                  <textarea name="description" defaultValue={editingProduct?.description} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ícone</label>
                  <select name="icon" defaultValue={editingProduct?.icon || 'Package'} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {Object.keys(ICON_MAP).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Produto'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isComboModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsComboModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingCombo ? 'Editar Combo' : 'Novo Combo'}</h3>
                <button onClick={() => setIsComboModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveCombo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Combo</label>
                  <input name="name" defaultValue={editingCombo?.name} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Desconto (%)</label>
                  <input name="discountPercentage" type="number" defaultValue={editingCombo?.discountPercentage} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Produtos no Combo</label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-2">
                    {products.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                        <input type="checkbox" name="productIds" value={p.id} defaultChecked={editingCombo?.productIds.includes(p.id)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                        <span className="text-sm text-slate-700">{p.name} (R$ {p.price})</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Combo'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
