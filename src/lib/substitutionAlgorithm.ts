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

function getFoodSubgroup(food: Food, selectedCategoryName: string): string {
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const name = norm(food.name);

  if (selectedCategoryName === 'Proteínas Animais' || selectedCategoryName === 'Laticínios e Derivados') {
    if (/frango|galinha|peru|pato|codorna|moela|coracao de galinha|figado de galinha/.test(name)) return 'aves';
    if (/alcatra|patinho|musculo|boi|carne mo|figado de boi|coracao de boi|contrafile|picanha|maminha|costela/.test(name)) return 'boi';
    if (/lombo|pernil|suino|porco|bacon|linguica/.test(name)) return 'porco';
    if (/tilapia|atum|salmao|sardinha|merluza|pescada|bacalhau|camarao|peixe/.test(name)) return 'peixe';
    if (/ovo|clara/.test(name)) return 'ovo';
    if (/queijo|iogurte|leite|ricota|cottage|requeijao|kefir/.test(name)) return 'laticinios';
    if (/whey|proteina em po/.test(name)) return 'suplemento';
    return 'outro_proteina';
  }

  if (selectedCategoryName === 'Carboidratos') {
    if (/arroz/.test(name)) return 'arroz';
    if (/batata/.test(name)) return 'batata';
    if (/mandioca|macaxeira|aipim/.test(name)) return 'mandioca';
    if (/macarrao|massa/.test(name)) return 'massa';
    if (/pao|tapioca|cuscuz|angu|polenta/.test(name)) return 'pao_e_derivados';
    if (/aveia|granola/.test(name)) return 'aveia';
    if (/feijao|lentilha|grao|ervilha/.test(name)) return 'leguminosas';
    if (/banana/.test(name)) return 'banana';
    return 'outro_carbo';
  }

  if (selectedCategoryName === 'Frutas') {
    if (/banana/.test(name)) return 'banana';
    if (/maca/.test(name)) return 'maca';
    if (/laranja|mexerica|tangerina/.test(name)) return 'citrico';
    if (/mamao|papaia/.test(name)) return 'mamao';
    if (/manga/.test(name)) return 'manga';
    if (/uva/.test(name)) return 'uva';
    if (/morango/.test(name)) return 'morango';
    if (/melancia|melao/.test(name)) return 'melancia';
    if (/abacaxi|ananas/.test(name)) return 'abacaxi';
    if (/pera/.test(name)) return 'pera';
    if (/goiaba/.test(name)) return 'goiaba';
    return 'outra_fruta';
  }

  if (selectedCategoryName === 'Gorduras e Oleaginosas') {
    if (/azeite|oliva/.test(name)) return 'azeite';
    if (/oleo/.test(name)) return 'oleo';
    if (/abacate/.test(name)) return 'abacate';
    if (/castanha|amendoa|nozes|pistache|macadamia/.test(name)) return 'oleaginosas';
    if (/amendoim|pasta de amendoim/.test(name)) return 'amendoim';
    if (/manteiga|ghee/.test(name)) return 'manteiga';
    return 'outra_gordura';
  }

  if (selectedCategoryName === 'Proteínas Vegetais') {
    if (/feijao/.test(name)) return 'feijao';
    if (/lentilha/.test(name)) return 'lentilha';
    if (/grao de bico/.test(name)) return 'grao_de_bico';
    if (/soja|tofu|tempeh|edamame/.test(name)) return 'soja';
    if (/amendoim|pasta de amendoim/.test(name)) return 'amendoim';
    if (/quinoa/.test(name)) return 'quinoa';
    if (/cogumelo/.test(name)) return 'cogumelo';
    return 'outra_proteina_vegetal';
  }

  return 'geral';
}

/**
 * Reorders results so that:
 * - The same subgroup as the selected food appears first, capped at `sameSubgroupCap`
 * - After the cap, results interleave one-by-one across all subgroups
 *   (always picking the best remaining similarity score from each subgroup in turn)
 */
function interleaveBySubgroup(
  results: SubstitutionResult[],
  selectedFood: Food,
  selectedCategoryName: string,
  sameSubgroupCap = 2
): SubstitutionResult[] {
  const selectedSubgroup = getFoodSubgroup(selectedFood, selectedCategoryName);

  // Group results by subgroup, each group already sorted by similarity desc
  const groups = new Map<string, SubstitutionResult[]>();
  for (const r of results) {
    const sg = getFoodSubgroup(r.food, selectedCategoryName);
    if (!groups.has(sg)) groups.set(sg, []);
    groups.get(sg)!.push(r);
  }

  const output: SubstitutionResult[] = [];

  // 1. Take up to `sameSubgroupCap` from the selected subgroup first
  const sameGroup = groups.get(selectedSubgroup) || [];
  const sameGroupHead = sameGroup.splice(0, sameSubgroupCap);
  output.push(...sameGroupHead);
  if (sameGroup.length === 0) groups.delete(selectedSubgroup);

  // 2. Build ordered list of remaining subgroups by their best similarity score
  const otherSubgroups = [...groups.keys()]
    .sort((a, b) => {
      const bestA = groups.get(a)?.[0]?.similarityScore ?? 0;
      const bestB = groups.get(b)?.[0]?.similarityScore ?? 0;
      return bestB - bestA;
    });

  // 3. Round-robin: take one from each subgroup per round until all are exhausted
  let hasMore = true;
  while (hasMore) {
    hasMore = false;
    for (const sg of otherSubgroups) {
      const group = groups.get(sg);
      if (group && group.length > 0) {
        output.push(group.shift()!);
        hasMore = true;
        if (group.length === 0) groups.delete(sg);
      }
    }
  }

  return output;
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

  // Sort: same category first, then by similarity (pre-sort before interleaving)
  results.sort((a, b) => {
    const aCat = a.food.category_id === selectedFood.category_id ? 0 : 1;
    const bCat = b.food.category_id === selectedFood.category_id ? 0 : 1;
    if (aCat !== bCat) return aCat - bCat;
    return b.similarityScore - a.similarityScore;
  });

  // Interleave by subgroup: show 2 from same subgroup, then rotate across others
  const interleaved = interleaveBySubgroup(results, selectedFood, selectedCategoryName, 2);

  return interleaved.slice(0, 20);
}

export function getSimilarityLabel(score: number): { label: string; emoji: string; color: string } {
  if (score > 0.7) return { label: 'Alta', emoji: '🟢', color: 'text-green-600' };
  if (score > 0.4) return { label: 'Média', emoji: '🟡', color: 'text-yellow-600' };
  return { label: 'Baixa', emoji: '🔴', color: 'text-red-600' };
}
