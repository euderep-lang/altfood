import { Database } from '@/integrations/supabase/types';

type Food = Database['public']['Tables']['foods']['Row'];
type FoodCategory = Database['public']['Tables']['food_categories']['Row'];

export interface SubstitutionResult {
  food: Food;
  category?: FoodCategory;
  equivalentWeight: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  calories: number;
  similarityScore: number;
}

const CATEGORY_ANCHOR: Record<string, 'protein' | 'carbohydrates' | 'fat' | 'calories'> = {
  'Proteínas Animais': 'protein',
  'Proteínas Vegetais': 'protein',
  'Laticínios e Derivados': 'protein',
  'Carboidratos': 'carbohydrates',
  'Gorduras e Oleaginosas': 'fat',
  'Frutas': 'calories',
  'Vegetais e Legumes': 'calories',
  'Temperos e Condimentos': 'calories',
  'Bebidas Funcionais': 'calories',
  'Suplementos Alimentares': 'protein',
};

function getAnchorNutrient(categoryName: string): 'protein' | 'carbohydrates' | 'fat' | 'calories' {
  return CATEGORY_ANCHOR[categoryName] || 'calories';
}

function getMacroValue(food: Food, nutrient: 'protein' | 'carbohydrates' | 'fat' | 'calories'): number {
  switch (nutrient) {
    case 'protein': return Number(food.protein);
    case 'carbohydrates': return Number(food.carbohydrates);
    case 'fat': return Number(food.fat);
    case 'calories': return Number(food.calories);
  }
}

/**
 * Returns a priority score (lower = shown first) for a food item
 * based on how typical/common it is in the Brazilian diet,
 * grouped by protein source, carb type, fruit type, etc.
 */
function getFoodSubgroupPriority(food: Food, selectedFood: Food, selectedCategoryName: string): number {
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const name = norm(food.name);
  const selectedName = norm(selectedFood.name);

  if (selectedCategoryName === 'Proteínas Animais' || selectedCategoryName === 'Laticínios e Derivados') {
    const isSelectedPoultry  = /frango|galinha|peru|pato|codorna|moela|coracao de galinha|figado de galinha/.test(selectedName);
    const isSelectedBeef     = /alcatra|patinho|musculo|boi|carne mo|figado de boi|coracao de boi|contrafile|picanha|maminha/.test(selectedName);
    const isSelectedPork     = /lombo|pernil|suino|porco|bacon|linguica/.test(selectedName);
    const isSelectedFish     = /tilapia|atum|salmao|sardinha|merluza|pescada|bacalhau|camarao|peixe/.test(selectedName);
    const isSelectedEgg      = /ovo|clara/.test(selectedName);
    const isSelectedDairy    = /queijo|iogurte|leite|ricota|cottage|requeijao/.test(selectedName);

    const groups = [
      { match: /frango|galinha|peru|pato|codorna|moela|coracao de galinha|figado de galinha/, isSelected: isSelectedPoultry },
      { match: /alcatra|patinho|musculo|boi|carne mo|figado de boi|contrafile|picanha|maminha/, isSelected: isSelectedBeef },
      { match: /lombo|pernil|suino|porco|bacon/, isSelected: isSelectedPork },
      { match: /tilapia|atum|salmao|sardinha|merluza|pescada|camarao|peixe/, isSelected: isSelectedFish },
      { match: /ovo|clara/, isSelected: isSelectedEgg },
      { match: /queijo|iogurte|leite|ricota|cottage|requeijao/, isSelected: isSelectedDairy },
    ];

    for (let i = 0; i < groups.length; i++) {
      if (groups[i].match.test(name)) {
        if (groups[i].isSelected) return 0;
        const selectedIdx = groups.findIndex(g => g.isSelected);
        return Math.abs(selectedIdx - i) + 1;
      }
    }
    return 7;
  }

  if (selectedCategoryName === 'Carboidratos') {
    const isSelectedRice   = /arroz/.test(selectedName);
    const isSelectedPotato = /batata/.test(selectedName);
    const isSelectedManioc = /mandioca|macaxeira|aipim/.test(selectedName);
    const isSelectedPasta  = /macarrao|massa/.test(selectedName);
    const isSelectedBread  = /pao|tapioca|cuscuz/.test(selectedName);
    const isSelectedOat    = /aveia|granola/.test(selectedName);
    const isSelectedBean   = /feijao|lentilha|grao|ervilha/.test(selectedName);

    const groups = [
      { match: /arroz/, isSelected: isSelectedRice },
      { match: /batata/, isSelected: isSelectedPotato },
      { match: /mandioca|macaxeira|aipim/, isSelected: isSelectedManioc },
      { match: /macarrao|massa/, isSelected: isSelectedPasta },
      { match: /pao|tapioca|cuscuz/, isSelected: isSelectedBread },
      { match: /aveia|granola/, isSelected: isSelectedOat },
      { match: /feijao|lentilha|grao|ervilha/, isSelected: isSelectedBean },
    ];

    for (let i = 0; i < groups.length; i++) {
      if (groups[i].match.test(name)) {
        if (groups[i].isSelected) return 0;
        const selectedIdx = groups.findIndex(g => g.isSelected);
        return Math.abs(selectedIdx - i) + 1;
      }
    }
    return 8;
  }

  if (selectedCategoryName === 'Frutas') {
    const FRUIT_RANK: [RegExp, number][] = [
      [/banana/, 1],
      [/maca/, 2],
      [/laranja/, 3],
      [/mamao|papaia/, 4],
      [/manga/, 5],
      [/uva/, 6],
      [/morango/, 7],
      [/melancia/, 8],
      [/abacaxi|ananas/, 9],
      [/pera/, 10],
      [/goiaba/, 11],
      [/mexerica|tangerina/, 12],
    ];

    const selectedRank = FRUIT_RANK.find(([r]) => r.test(selectedName))?.[1] ?? 99;
    const candidateRank = FRUIT_RANK.find(([r]) => r.test(name))?.[1] ?? 99;
    return Math.abs(selectedRank - candidateRank);
  }

  if (selectedCategoryName === 'Gorduras e Oleaginosas') {
    const groups = [
      { match: /azeite|oliva/, isSelected: /azeite|oliva/.test(selectedName) },
      { match: /oleo/, isSelected: /oleo/.test(selectedName) },
      { match: /abacate/, isSelected: /abacate/.test(selectedName) },
      { match: /castanha|amendoa|nozes|pistache|macadamia|amendoim/, isSelected: /castanha|amendoa|nozes|pistache|macadamia|amendoim/.test(selectedName) },
      { match: /manteiga|ghee/, isSelected: /manteiga|ghee/.test(selectedName) },
    ];
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].match.test(name)) {
        if (groups[i].isSelected) return 0;
        const selectedIdx = groups.findIndex(g => g.isSelected);
        return Math.abs(selectedIdx - i) + 1;
      }
    }
    return 6;
  }

  if (selectedCategoryName === 'Proteínas Vegetais') {
    const groups = [
      { match: /feijao/, isSelected: /feijao/.test(selectedName) },
      { match: /lentilha/, isSelected: /lentilha/.test(selectedName) },
      { match: /grao de bico/, isSelected: /grao de bico/.test(selectedName) },
      { match: /soja|tofu|tempeh|edamame/, isSelected: /soja|tofu|tempeh|edamame/.test(selectedName) },
      { match: /amendoim|pasta de amendoim/, isSelected: /amendoim/.test(selectedName) },
      { match: /quinoa/, isSelected: /quinoa/.test(selectedName) },
    ];
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].match.test(name)) {
        if (groups[i].isSelected) return 0;
        const selectedIdx = groups.findIndex(g => g.isSelected);
        return Math.abs(selectedIdx - i) + 1;
      }
    }
    return 7;
  }

  return 0;
}

export function calculateSubstitutions(
  selectedFood: Food,
  weightGrams: number,
  allFoods: Food[],
  categories: FoodCategory[],
  selectedCategoryName: string
): SubstitutionResult[] {
  const anchor = getAnchorNutrient(selectedCategoryName);
  const anchorPer100g = getMacroValue(selectedFood, anchor);

  if (anchorPer100g === 0) return [];

  const targetMacro = (anchorPer100g * weightGrams) / 100;

  const origProt = (Number(selectedFood.protein) * weightGrams) / 100;
  const origCarb = (Number(selectedFood.carbohydrates) * weightGrams) / 100;
  const origFat = (Number(selectedFood.fat) * weightGrams) / 100;
  const totalTarget = origProt + origCarb + origFat || 1;

  // Extract first word of original food name for filtering similar names
  const originalFirstWord = selectedFood.name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)[0].toLowerCase();

  const RAW_KEYWORDS = ['cru', 'crua', 'crus', 'cruas'];

  const results: SubstitutionResult[] = [];

  for (const food of allFoods) {
    if (food.id === selectedFood.id) continue;
    if (!food.is_active) continue;

    // Filter: exclude foods whose name starts with the original's first word
    const normalizedName = food.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalizedName.startsWith(originalFirstWord)) continue;
    const nameWords = normalizedName.split(/\s+/);

    // Filter: exclude raw foods
    if (nameWords.some(w => RAW_KEYWORDS.includes(w))) continue;

    const subAnchor = getMacroValue(food, anchor);
    if (subAnchor === 0) continue;

    const eqWeight = (targetMacro * 100) / subAnchor;
    if (eqWeight < 10 || eqWeight > 2000) continue;

    const roundedWeight = Math.round(eqWeight);
    const prot = (Number(food.protein) * roundedWeight) / 100;
    const carb = (Number(food.carbohydrates) * roundedWeight) / 100;
    const fat = (Number(food.fat) * roundedWeight) / 100;
    const cal = (Number(food.calories) * roundedWeight) / 100;

    const protDiff = Math.abs(prot - origProt);
    const carbDiff = Math.abs(carb - origCarb);
    const fatDiff = Math.abs(fat - origFat);
    const similarity = Math.max(0, 1 - (protDiff + carbDiff + fatDiff) / totalTarget);

    const category = categories.find(c => c.id === food.category_id);

    results.push({
      food,
      category,
      equivalentWeight: roundedWeight,
      protein: Math.round(prot * 10) / 10,
      carbohydrates: Math.round(carb * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      calories: Math.round(cal * 10) / 10,
      similarityScore: Math.round(similarity * 100) / 100,
    });
  }

  // Sort: same category first, then by similarity
  results.sort((a, b) => {
    // 1. Same category always comes first
    const aCat = a.food.category_id === selectedFood.category_id ? 0 : 1;
    const bCat = b.food.category_id === selectedFood.category_id ? 0 : 1;
    if (aCat !== bCat) return aCat - bCat;

    // 2. Within same category: sort by subgroup proximity
    const aSubgroup = getFoodSubgroupPriority(a.food, selectedFood, selectedCategoryName);
    const bSubgroup = getFoodSubgroupPriority(b.food, selectedFood, selectedCategoryName);
    if (aSubgroup !== bSubgroup) return aSubgroup - bSubgroup;

    // 3. Within same subgroup: sort by similarity score
    return b.similarityScore - a.similarityScore;
  });

  return results.slice(0, 20);
}

export function getSimilarityLabel(score: number): { label: string; emoji: string; color: string } {
  if (score > 0.7) return { label: 'Alta', emoji: '🟢', color: 'text-green-600' };
  if (score > 0.4) return { label: 'Média', emoji: '🟡', color: 'text-yellow-600' };
  return { label: 'Baixa', emoji: '🔴', color: 'text-red-600' };
}
