import { Product, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Planejamento', icon: 'Target', order: 1 },
  { id: 'cat-2', name: 'Social Media', icon: 'Share2', order: 2 },
  { id: 'cat-3', name: 'Conteúdo', icon: 'FileText', order: 3 },
  { id: 'cat-4', name: 'Vídeo', icon: 'Image', order: 4 },
  { id: 'cat-5', name: 'Tráfego', icon: 'TrendingUp', order: 5 },
  { id: 'cat-6', name: 'Copy', icon: 'FileText', order: 6 },
  { id: 'cat-7', name: 'Automação e CRM', icon: 'Users', order: 7 },
  { id: 'cat-8', name: 'Design', icon: 'Palette', order: 8 },
  { id: 'cat-9', name: 'Desenvolvimento', icon: 'Globe', order: 9 },
  { id: 'cat-10', name: 'Blog', icon: 'FileText', order: 10 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'plan-1',
    name: 'Planejamento Estratégico Anual',
    categoryId: 'cat-1',
    price: 2500,
    description: 'Definição de personas, canais, tom de voz e cronograma macro.',
    icon: 'Target'
  },
  {
    id: '8',
    name: 'Social Media 15',
    categoryId: 'cat-2',
    price: 1100,
    description: 'Gestão de rede social com 15 postagens mensais.',
    icon: 'Share2'
  },
  {
    id: '9',
    name: 'Social Media 30',
    categoryId: 'cat-2',
    price: 150,
    description: 'Gestão de rede social com 30 postagens mensais.',
    icon: 'Share2'
  },
  {
    id: '16',
    name: 'Agendamento de Posts',
    categoryId: 'cat-3',
    price: 650,
    description: 'Criação e agendamento de conteúdo para redes sociais.',
    icon: 'FileText'
  },
  {
    id: '2',
    name: 'Edição Vídeo 30s',
    categoryId: 'cat-4',
    price: 80,
    description: 'Edição de vídeo curto de até 30 segundos.',
    icon: 'Share2'
  },
  {
    id: '3',
    name: 'Edição de Vídeo 90s',
    categoryId: 'cat-4',
    price: 250,
    description: 'Edição de vídeo de até 90 segundos.',
    icon: 'Share2'
  },
  {
    id: '4',
    name: 'Sessão de Vídeo Mobile',
    categoryId: 'cat-4',
    price: 500,
    description: 'Captação de imagens e vídeos mobile.',
    icon: 'TrendingUp'
  },
  {
    id: '15',
    name: 'Drone',
    categoryId: 'cat-4',
    price: 500,
    description: 'Captação de imagens aéreas profissionais.',
    icon: 'Globe'
  },
  {
    id: '6',
    name: 'Gestão de Tráfego Bronze',
    categoryId: 'cat-5',
    price: 1500,
    description: 'Gestão inicial de tráfego pago.',
    icon: 'Target'
  },
  {
    id: '7',
    name: 'Gestão de Tráfego Ouro',
    categoryId: 'cat-5',
    price: 650,
    description: 'Gestão avançada de tráfego pago.',
    icon: 'Target'
  },
  {
    id: 'copy-1',
    name: 'Copywriting para Landing Page',
    categoryId: 'cat-6',
    price: 450,
    description: 'Escrita persuasiva focada em conversão.',
    icon: 'FileText'
  },
  {
    id: '10',
    name: 'Gestão de RD Basic',
    categoryId: 'cat-7',
    price: 500,
    description: 'Configuração básica de RD Station.',
    icon: 'Users'
  },
  {
    id: '11',
    name: 'Gestão de RD Advanced',
    categoryId: 'cat-7',
    price: 800,
    description: 'Automação avançada no RD Station.',
    icon: 'Users'
  },
  {
    id: '1',
    name: 'Arte Digital',
    categoryId: 'cat-8',
    price: 120,
    description: 'Criação de arte digital personalizada.',
    icon: 'Palette'
  },
  {
    id: '5',
    name: 'Sessão de Foto',
    categoryId: 'cat-8',
    price: 30,
    description: 'Sessão fotográfica profissional.',
    icon: 'Image'
  },
  {
    id: '13',
    name: 'Website One Page',
    categoryId: 'cat-9',
    price: 5000,
    description: 'Criação de site institucional de página única.',
    icon: 'Globe'
  },
  {
    id: '14',
    name: 'E-commerce Nuvem',
    categoryId: 'cat-9',
    price: 7000,
    description: 'Loja virtual completa na Nuvemshop.',
    icon: 'ShoppingCart'
  },
  {
    id: 'blog-1',
    name: 'Gestão de Blog Mensal',
    categoryId: 'cat-10',
    price: 1200,
    description: '4 artigos mensais otimizados para SEO.',
    icon: 'FileText'
  }
];
