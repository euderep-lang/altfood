import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];

const SERVING_SIZES = [100, 150, 200, 250];

interface CookingMethod {
  method: string;
  emoji: string;
  time: string;
  steps: string[];
}

interface FoodRecipe {
  methods: CookingMethod[];
  tip?: string;
  tags: string[];
}

const FOOD_RECIPES: Record<string, FoodRecipe> = {
  'Peito de frango grelhado': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '10–12 min', steps: ['Tempere o frango com sal, pimenta e alho a gosto.', 'Unte a frigideira antiaderente com azeite e aqueça em fogo médio por 2 min.', 'Coloque o frango e grelhe 5–6 min de cada lado sem mexer.', 'Verifique se está cozido por dentro antes de servir.'] },
      { method: 'Airfryer', emoji: '♨️', time: '14–16 min', steps: ['Tempere o frango com sal, pimenta, alho e ervas a gosto.', 'Pré-aqueça a airfryer a 200°C por 3 min.', 'Coloque o frango e cozinhe por 8 min.', 'Vire e cozinhe mais 6–8 min até dourar.'] },
      { method: 'Forno', emoji: '🔥', time: '25–30 min', steps: ['Tempere o frango e coloque em uma assadeira.', 'Cubra com papel alumínio e asse a 200°C por 20 min.', 'Retire o alumínio e deixe dourar por mais 8–10 min.'] },
    ],
    tip: 'Deixe descansar 2 min antes de cortar — os sucos redistribuem e a carne fica mais suculenta.',
    tags: ['ganho muscular', 'perda de peso'],
  },
  'Coxa de frango assada': {
    methods: [
      { method: 'Forno', emoji: '🔥', time: '35–40 min', steps: ['Tempere as coxas com sal, pimenta, alho e limão.', 'Coloque em assadeira e asse a 200°C por 30 min.', 'Vire as peças e asse mais 10 min até a pele dourar.'] },
      { method: 'Airfryer', emoji: '♨️', time: '22–25 min', steps: ['Tempere as coxas a gosto.', 'Cozinhe a 200°C por 12 min.', 'Vire e cozinhe mais 10–13 min até dourar.'] },
    ],
    tags: ['ganho muscular'],
  },
  'Moela de frango cozida': {
    methods: [
      { method: 'Panela de pressão', emoji: '🫕', time: '20–25 min', steps: ['Lave bem as moelas e tempere com sal, alho e pimenta.', 'Coloque na pressão com água suficiente para cobrir.', 'Cozinhe por 20 min após pegar pressão.', 'Depois, se quiser, refogue rapidamente em frigideira com cebola.'] },
      { method: 'Frigideira', emoji: '🍳', time: '30–35 min', steps: ['Cozinhe as moelas em água com sal por 25 min em panela comum.', 'Escorra, aqueça a frigideira com azeite e refogue com alho e cebola.', 'Adicione temperos a gosto e finalize com salsinha.'] },
    ],
    tags: ['ganho muscular', 'ferro'],
  },
  'Fígado de galinha cozido': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '10–12 min', steps: ['Limpe os fígados, retirando membranas.', 'Tempere com sal, alho e vinagre.', 'Aqueça frigideira com azeite e refogue a cebola até murchar.', 'Adicione os fígados e cozinhe 4–5 min de cada lado.', 'Não cozinhe demais — o interior deve estar levemente rosado.'] },
    ],
    tip: 'O fígado de galinha é uma das melhores fontes de ferro e vitamina A. Consuma 1–2x por semana.',
    tags: ['ferro', 'vitamina A', 'ganho muscular'],
  },
  'Fígado de boi cozido': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '8–10 min', steps: ['Corte o fígado em fatias de 1 cm. Mergulhe em leite por 30 min para suavizar o sabor.', 'Escorra, tempere com sal, alho e pimenta.', 'Grelhe em frigideira bem quente com azeite, 3–4 min de cada lado.', 'Finalize com cebola caramelizada e salsinha.'] },
    ],
    tip: 'Mergulhar no leite antes do preparo reduz o sabor forte e deixa a textura mais macia.',
    tags: ['ferro', 'B12', 'zinco'],
  },
  'Coração de galinha cozido': {
    methods: [
      { method: 'Espeto / Churrasqueira', emoji: '🔥', time: '15–18 min', steps: ['Limpe os corações e tempere com sal, alho e pimenta.', 'Espete e leve à brasa ou grelha em fogo médio.', 'Gire de vez em quando, cozinhando por 15–18 min até dourar.'] },
      { method: 'Frigideira', emoji: '🍳', time: '12–14 min', steps: ['Tempere os corações com sal, alho e pimenta.', 'Aqueça frigideira com azeite em fogo alto.', 'Sele os corações por 5 min mexendo ocasionalmente.', 'Reduza o fogo, tampe e cozinhe mais 8 min.'] },
    ],
    tags: ['ferro', 'coenzima Q10'],
  },
  'Lombo suíno assado': {
    methods: [
      { method: 'Forno', emoji: '🔥', time: '40–50 min', steps: ['Tempere o lombo com sal, alho, pimenta e mostarda a gosto.', 'Sele em frigideira quente por 3 min de cada lado.', 'Transfira para assadeira, cubra com alumínio.', 'Asse a 180°C por 35–40 min. Retire o alumínio nos últimos 10 min.'] },
      { method: 'Airfryer', emoji: '♨️', time: '25–30 min', steps: ['Tempere o lombo e deixe marinar por 30 min se possível.', 'Cozinhe a 180°C por 15 min, vire e cozinhe mais 12–15 min.'] },
    ],
    tags: ['ganho muscular', 'perda de peso'],
  },
  'Patinho cozido': {
    methods: [
      { method: 'Frigideira / Chapa', emoji: '🍳', time: '8–10 min', steps: ['Tempere o patinho com sal e pimenta.', 'Aqueça a chapa ou frigideira em fogo alto até soltar fumaça.', 'Grelhe 4–5 min de cada lado sem mexer.', 'Deixe descansar 2 min antes de cortar.'] },
      { method: 'Panela de pressão', emoji: '🫕', time: '30–35 min', steps: ['Tempere e sele a carne em frigideira quente por 2 min de cada lado.', 'Transfira para a pressão com água, cebola e alho.', 'Cozinhe por 25–30 min após pegar pressão.'] },
    ],
    tags: ['ganho muscular', 'perda de peso'],
  },
  'Alcatra grelhada': {
    methods: [
      { method: 'Frigideira / Chapa', emoji: '🍳', time: '6–8 min', steps: ['Retire da geladeira 15 min antes. Tempere só com sal grosso.', 'Aqueça a frigideira em fogo muito alto.', 'Grelhe 3–4 min de cada lado para ponto ao mal passado/médio.', 'Deixe descansar 3 min antes de servir.'] },
    ],
    tip: 'Não fure a carne durante o preparo — os sucos se perdem e a carne resseca.',
    tags: ['ganho muscular'],
  },
  'Músculo bovino cozido': {
    methods: [
      { method: 'Panela de pressão', emoji: '🫕', time: '40–45 min', steps: ['Tempere o músculo com sal, alho, pimenta e louro.', 'Sele em frigideira quente com azeite por 3 min de cada lado.', 'Transfira para a pressão com água e cebola.', 'Cozinhe por 40 min após pressão. Sirva desfiado ou fatiado.'] },
    ],
    tags: ['ganho muscular'],
  },
  'Carne moída refogada (patinho)': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '12–15 min', steps: ['Aqueça a frigideira com azeite. Refogue alho e cebola por 2 min.', 'Adicione a carne moída e mexa para soltar os grumos.', 'Cozinhe em fogo médio-alto por 10 min mexendo sempre.', 'Tempere com sal, pimenta e tomate picado. Finalize com salsinha.'] },
    ],
    tags: ['ganho muscular', 'perda de peso'],
  },
  'Ovo inteiro cozido': {
    methods: [
      { method: 'Cozido', emoji: '🥚', time: '8–12 min', steps: ['Coloque os ovos em água fria e leve ao fogo.', 'Após ferver: 8 min = gema mole, 10 min = gema média, 12 min = gema firme.', 'Transfira para água gelada por 2 min para parar o cozimento.', 'Descasque e sirva.'] },
      { method: 'Mexido', emoji: '🍳', time: '3–5 min', steps: ['Bata os ovos com uma pitada de sal.', 'Aqueça frigideira antiaderente em fogo baixo com azeite.', 'Adicione os ovos e mexa gentilmente com espátula de borracha.', 'Retire do fogo quando ainda levemente úmido — o calor residual termina o cozimento.'] },
    ],
    tags: ['ganho muscular', 'alimentação equilibrada'],
  },
  'Clara de ovo cozida': {
    methods: [
      { method: 'Omelete', emoji: '🍳', time: '5–7 min', steps: ['Bata as claras com sal e ervas a gosto.', 'Aqueça frigideira antiaderente com azeite em fogo médio.', 'Despeje as claras e deixe firmar por 3 min.', 'Dobre ao meio e sirva.'] },
    ],
    tags: ['ganho muscular', 'perda de peso', 'baixa caloria'],
  },
  'Tilápia grelhada': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '8–10 min', steps: ['Tempere o filé com sal, limão e pimenta.', 'Aqueça frigideira com azeite em fogo médio-alto.', 'Cozinhe 4–5 min de cada lado sem mexer.', 'O peixe está pronto quando a carne se desprende facilmente com o garfo.'] },
      { method: 'Forno', emoji: '🔥', time: '15–18 min', steps: ['Tempere o filé e coloque em papel manteiga.', 'Asse a 200°C por 15–18 min.', 'Finalize com limão espremido.'] },
    ],
    tags: ['perda de peso', 'ganho muscular'],
  },
  'Salmão grelhado': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '8–10 min', steps: ['Tempere com sal e pimenta. Deixe em temperatura ambiente por 10 min.', 'Aqueça frigideira em fogo médio-alto sem óleo.', 'Coloque o salmão com a pele para baixo e pressione levemente.', 'Cozinhe 5–6 min. Vire e cozinhe mais 2–3 min.'] },
      { method: 'Forno', emoji: '🔥', time: '12–15 min', steps: ['Tempere o salmão com sal, limão e ervas.', 'Asse a 200°C por 12–15 min.', 'Está pronto quando a carne muda de cor translúcida para opaca.'] },
    ],
    tip: 'Rico em ômega-3. Não cozinhe demais — o centro levemente rosado é ideal.',
    tags: ['ganho muscular', 'ômega-3', 'anti-inflamatório'],
  },
  'Atum em conserva (água)': {
    methods: [
      { method: 'Pronto para consumo', emoji: '🥫', time: '2 min', steps: ['Abra a lata e escorra bem a água.', 'Tempere com limão, azeite e pimenta a gosto.', 'Sirva em saladas, wraps, tapiocas ou puro.'] },
    ],
    tip: 'Prefira atum em água ao natural — tem menos gordura que o em óleo.',
    tags: ['ganho muscular', 'perda de peso'],
  },
  'Camarão cozido': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '5–7 min', steps: ['Tempere com sal, alho, limão e pimenta.', 'Aqueça azeite em frigideira em fogo alto.', 'Refogue por 2–3 min de cada lado até ficarem rosados.', 'Não cozinhe demais — ficam borrachudos.'] },
    ],
    tags: ['perda de peso', 'ganho muscular'],
  },
  'Sardinha em conserva': {
    methods: [
      { method: 'Pronto para consumo', emoji: '🥫', time: '2 min', steps: ['Abra a lata e escorra o óleo.', 'Tempere com limão e pimenta.', 'Sirva em torradas, saladas ou amasse como patê com cream cheese.'] },
    ],
    tip: 'Rica em ômega-3 e vitamina D. Uma das fontes mais baratas de proteína.',
    tags: ['ômega-3', 'ganho muscular'],
  },
  'Arroz branco cozido': {
    methods: [
      { method: 'Panela', emoji: '🍚', time: '20–25 min', steps: ['Refogue alho picado em azeite por 1 min.', 'Adicione o arroz lavado e mexa por 2 min.', 'Adicione água quente (proporção 1 xíc arroz : 1,5 xíc água) e sal.', 'Tampe e cozinhe em fogo baixo por 15–18 min sem abrir.'] },
    ],
    tags: ['alimentação equilibrada'],
  },
  'Batata doce cozida': {
    methods: [
      { method: 'Cozida', emoji: '🥔', time: '20–25 min', steps: ['Descasque e corte em cubos médios.', 'Cozinhe em água com sal por 20–25 min até amaciar.', 'Escorra e sirva como acompanhamento.'] },
      { method: 'Airfryer', emoji: '♨️', time: '20–22 min', steps: ['Corte em rodelas ou palitos com casca.', 'Tempere com sal e canela (opcional).', 'Cozinhe a 200°C por 20–22 min, virando na metade.'] },
    ],
    tip: 'Rica em fibras e betacaroteno. Ótima opção pré-treino.',
    tags: ['pré-treino', 'fibras', 'alimentação equilibrada'],
  },
  'Mandioca cozida': {
    methods: [
      { method: 'Panela', emoji: '🫕', time: '25–30 min', steps: ['Descasque e corte em pedaços. Retire o fio central.', 'Cozinhe em água com sal por 25–30 min até amaciar.', 'Escorra bem antes de servir.'] },
    ],
    tags: ['alimentação equilibrada'],
  },
  'Angu (fubá cozido)': {
    methods: [
      { method: 'Panela', emoji: '🍲', time: '15–20 min', steps: ['Dissolva o fubá em água fria (proporção: 1 xíc fubá : 4 xíc água).', 'Leve ao fogo médio mexendo sempre para não empelotar.', 'Adicione sal a gosto.', 'Cozinhe por 15–20 min mexendo até atingir a consistência desejada.'] },
    ],
    tags: ['alimentação equilibrada'],
  },
  'Batata inglesa cozida': {
    methods: [
      { method: 'Cozida', emoji: '🥔', time: '20–25 min', steps: ['Descasque e corte em cubos.', 'Cozinhe em água com sal por 20 min até amaciar.', 'Escorra e sirva ou amasse como purê.'] },
      { method: 'Forno', emoji: '🔥', time: '35–40 min', steps: ['Corte em fatias ou gomos, tempere com sal e ervas.', 'Asse a 200°C por 35–40 min virando na metade.'] },
    ],
    tags: ['alimentação equilibrada'],
  },
  'Banana da terra cozida': {
    methods: [
      { method: 'Cozida', emoji: '🍌', time: '20–25 min', steps: ['Descasque a banana da terra e corte em rodelas grossas.', 'Cozinhe em água com uma pitada de sal por 20 min.', 'Escorra e sirva como acompanhamento salgado.'] },
      { method: 'Forno', emoji: '🔥', time: '25–30 min', steps: ['Corte ao meio no sentido do comprimento.', 'Coloque em assadeira e asse a 200°C por 25–30 min.'] },
    ],
    tags: ['alimentação equilibrada'],
  },
  'Brócolis cozido': {
    methods: [
      { method: 'Vapor', emoji: '💨', time: '5–7 min', steps: ['Corte em floretes e lave bem.', 'Cozinhe no vapor por 5–7 min. Deve ficar verde-vivo e levemente crocante.', 'Tempere com sal, limão e azeite.'] },
      { method: 'Airfryer', emoji: '♨️', time: '10–12 min', steps: ['Tempere com sal, pimenta e azeite.', 'Cozinhe a 200°C por 10–12 min até as bordas dourarem.'] },
    ],
    tip: 'Não cozinhe demais — brócolis muito cozido perde vitamina C e fica amargo.',
    tags: ['vitamina C', 'baixa caloria', 'fibras'],
  },
  'Espinafre refogado': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '3–5 min', steps: ['Lave as folhas e escorra.', 'Refogue alho picado em azeite por 1 min.', 'Adicione o espinafre e mexa em fogo médio por 3–4 min.', 'Tempere com sal e sirva.'] },
    ],
    tip: 'Murcha bastante — use o dobro do volume que pretende servir.',
    tags: ['ferro', 'fibras', 'baixa caloria'],
  },
  'Couve manteiga refogada': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '5–7 min', steps: ['Lave as folhas, retire o talo central e corte em tiras finas (chiffonade).', 'Refogue alho em azeite por 1 min.', 'Adicione a couve e mexa em fogo alto por 3–5 min.', 'Tempere com sal e sirva.'] },
    ],
    tags: ['cálcio', 'ferro', 'baixa caloria'],
  },
  'Abóbora moranga cozida': {
    methods: [
      { method: 'Forno', emoji: '🔥', time: '25–30 min', steps: ['Corte em cubos médios, tempere com sal e pimenta.', 'Asse a 200°C por 25–30 min até amaciar e dourar as bordas.'] },
      { method: 'Cozida', emoji: '🫕', time: '15–18 min', steps: ['Corte em cubos e cozinhe em água com sal por 15 min.', 'Escorra e sirva ou use para sopas e cremes.'] },
    ],
    tags: ['baixa caloria', 'fibras'],
  },
  'Iogurte grego integral': {
    methods: [
      { method: 'Pronto para consumo', emoji: '🥛', time: '1 min', steps: ['Sirva gelado com frutas, granola ou mel.', 'Use como base para molhos e marinadas.', 'Pode substituir creme de leite em receitas salgadas.'] },
    ],
    tip: 'Uma das melhores fontes de proteína láctea com baixo carboidrato.',
    tags: ['ganho muscular', 'probiótico'],
  },
  'Feijão carioca cozido': {
    methods: [
      { method: 'Panela de pressão', emoji: '🫕', time: '25–30 min', steps: ['Deixe o feijão de molho por 8h ou de um dia para o outro.', 'Escorra, adicione água nova e sal.', 'Cozinhe na pressão por 20–25 min após pegar pressão.', 'Refogue alho e cebola em azeite, adicione o feijão cozido e tempere.'] },
    ],
    tags: ['proteína vegetal', 'fibras'],
  },
  'Tofu firme': {
    methods: [
      { method: 'Frigideira', emoji: '🍳', time: '10–12 min', steps: ['Pressione o tofu com papel toalha por 10 min para retirar o excesso de água.', 'Corte em cubos e tempere com shoyu, alho e gengibre.', 'Frite em frigideira com azeite em fogo alto por 3–4 min de cada lado até dourar.'] },
      { method: 'Airfryer', emoji: '♨️', time: '15–18 min', steps: ['Pressione, corte e tempere o tofu.', 'Cozinhe a 200°C por 15–18 min virando na metade, até ficar crocante.'] },
    ],
    tip: 'A prensagem é essencial — quanto mais seco, mais crocante fica ao refogar.',
    tags: ['proteína vegetal', 'veganos'],
  },
  'Lentilha cozida': {
    methods: [
      { method: 'Panela', emoji: '🫕', time: '20–25 min', steps: ['Não precisa deixar de molho. Lave bem as lentilhas.', 'Cozinhe em água com sal (1 xíc lentilha : 2 xíc água) por 20 min.', 'Refogue com alho, cebola e temperos a gosto.'] },
    ],
    tags: ['proteína vegetal', 'ferro', 'fibras'],
  },
  'Abacate': {
    methods: [
      { method: 'Pronto para consumo', emoji: '🥑', time: '3 min', steps: ['Corte ao meio, retire o caroço e a polpa com colher.', 'Sirva puro com sal e limão, ou amasse como guacamole.', 'Use em saladas, vitaminas ou como substituto de manteiga em torradas.'] },
    ],
    tip: 'Rico em gordura monoinsaturada — boa para o coração. Consuma com moderação.',
    tags: ['ômega-9', 'anti-inflamatório'],
  },
};

function getDefaultRecipe(food: Food, categoryName?: string): FoodRecipe {
  const name = food.name.toLowerCase();
  const cat = (categoryName || '').toLowerCase();

  const tags: string[] = [];
  if (Number(food.protein) > 15) tags.push('ganho muscular');
  if (Number(food.calories) < 50) tags.push('baixa caloria');
  if (Number(food.fiber) > 4) tags.push('fibras');
  if (tags.length === 0) tags.push('alimentação equilibrada');

  let steps: string[];
  let method: string;
  let emoji: string;
  let time: string;

  if (cat.includes('fruta') || name.includes('fruta')) {
    method = 'Pronto para consumo'; emoji = '🍎'; time = '1 min';
    steps = ['Lave bem antes de consumir.', 'Sirva natural, em salada de frutas ou vitamina.'];
  } else if (cat.includes('vegetal') || cat.includes('verdura') || cat.includes('legume')) {
    method = 'Frigideira'; emoji = '🍳'; time = '5–8 min';
    steps = ['Lave e prepare o ingrediente conforme necessário.', 'Refogue em frigideira com azeite e alho por 5–8 min.', 'Tempere com sal e sirva.'];
  } else if (cat.includes('carboidrato')) {
    method = 'Panela'; emoji = '🍲'; time = '20–25 min';
    steps = ['Cozinhe em água com sal conforme indicação da embalagem ou receita.', 'Escorra e sirva como acompanhamento.'];
  } else {
    method = 'Frigideira'; emoji = '🍳'; time = '10–12 min';
    steps = [`Tempere o(a) ${food.name_short} com sal, alho e pimenta a gosto.`, 'Aqueça frigideira com azeite em fogo médio.', 'Cozinhe por 5–6 min de cada lado até atingir o ponto desejado.'];
  }

  return {
    methods: [{ method, emoji, time, steps }],
    tip: food.preparation || undefined,
    tags,
  };
}

interface FoodDetailModalProps {
  food: Food | null;
  open: boolean;
  onClose: () => void;
  categoryIcon?: string;
  categoryColor?: string;
  categoryName?: string;
  doctorName?: string;
}

export default function FoodDetailModal({ food, open, onClose, categoryIcon, categoryColor, categoryName, doctorName }: FoodDetailModalProps) {
  const [serving, setServing] = useState(100);
  const [selectedMethod, setSelectedMethod] = useState(0);

  const recipe = useMemo(() => {
    if (!food) return null;
    return FOOD_RECIPES[food.name_short] || FOOD_RECIPES[food.name] || getDefaultRecipe(food, categoryName);
  }, [food, categoryName]);

  useEffect(() => { setSelectedMethod(0); }, [food]);

  if (!food) return null;

  const factor = serving / 100;
  const macros = [
    { label: 'Calorias', value: (Number(food.calories) * factor).toFixed(1), unit: 'kcal' },
    { label: 'Proteínas', value: (Number(food.protein) * factor).toFixed(1), unit: 'g' },
    { label: 'Carboidratos', value: (Number(food.carbohydrates) * factor).toFixed(1), unit: 'g' },
    { label: 'Gorduras', value: (Number(food.fat) * factor).toFixed(1), unit: 'g' },
    { label: 'Fibras', value: (Number(food.fiber) * factor).toFixed(1), unit: 'g' },
  ];

  const shareText = `🍽️ ${food.name_short} (${serving}g)\n${macros.map(m => `${m.label}: ${m.value}${m.unit}`).join('\n')}\n\nVia Altfood${doctorName ? ` - Dr(a). ${doctorName}` : ''}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: `${categoryColor || '#0F766E'}15` }}>
              {categoryIcon || '🍽️'}
            </div>
            <div>
              <DialogTitle className="text-lg">{food.name_short}</DialogTitle>
              <p className="text-xs text-muted-foreground">{food.name}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Serving selector */}
        <div className="flex gap-2 flex-wrap">
          {SERVING_SIZES.map(s => (
            <button
              key={s}
              onClick={() => setServing(s)}
              className="px-3 py-2 rounded-full text-sm font-semibold transition-all min-h-[36px]"
              style={{
                backgroundColor: serving === s ? (categoryColor || '#0F766E') : `${categoryColor || '#0F766E'}10`,
                color: serving === s ? '#fff' : (categoryColor || '#0F766E'),
              }}
            >
              {s}g
            </button>
          ))}
        </div>

        {/* Nutrition table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase">Nutriente</th>
                <th className="text-right py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase">Por {serving}g</th>
              </tr>
            </thead>
            <tbody>
              {macros.map((m, i) => (
                <tr key={m.label} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="py-2 px-3 text-foreground font-medium">{m.label}</td>
                  <td className="py-2 px-3 text-right font-semibold text-foreground">{m.value} {m.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to prepare */}
        {recipe && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground">👨‍🍳 Como preparar</p>

            {recipe.methods.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {recipe.methods.map((m, i) => (
                  <button
                    key={m.method}
                    onClick={() => setSelectedMethod(i)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: selectedMethod === i
                        ? (categoryColor || '#0F766E')
                        : `${categoryColor || '#0F766E'}12`,
                      color: selectedMethod === i ? '#fff' : (categoryColor || '#0F766E'),
                    }}
                  >
                    {m.emoji} {m.method}
                    {m.time && (
                      <span className="ml-1 opacity-75">· {m.time}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {recipe.methods.length === 1 && recipe.methods[0].time && (
              <p className="text-xs text-muted-foreground">
                {recipe.methods[0].emoji} {recipe.methods[0].method} · ⏱ {recipe.methods[0].time}
              </p>
            )}

            <div className="bg-muted/40 rounded-xl p-4 space-y-2">
              {recipe.methods[selectedMethod]?.steps.map((step, i) => (
                <div key={i} className="flex gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: `${categoryColor || '#0F766E'}20`, color: categoryColor || '#0F766E' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {recipe.tip && (
              <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <span className="text-base shrink-0">💡</span>
                <p className="text-xs text-amber-800 leading-relaxed">{recipe.tip}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${categoryColor || '#0F766E'}15`,
                    color: categoryColor || '#0F766E',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        <p className="text-[10px] text-muted-foreground">Fonte: {food.source}</p>

        {/* Share */}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full rounded-xl gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white">
            <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
          </Button>
        </a>
      </DialogContent>
    </Dialog>
  );
}
