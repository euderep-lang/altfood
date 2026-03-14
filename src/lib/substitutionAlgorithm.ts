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

    // Filter: exclude foods whose name contains the original's first word
    const normalizedName = food.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nameWords = normalizedName.split(/\s+/);
    if (nameWords.some(w => w === originalFirstWord)) continue;

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

  // Sort: different categories first (more interesting substitutions), then by similarity
  results.sort((a, b) => {
    const aSameCategory = a.food.category_id === selectedFood.category_id ? 1 : 0;
    const bSameCategory = b.food.category_id === selectedFood.category_id ? 1 : 0;
    if (aSameCategory !== bSameCategory) return aSameCategory - bSameCategory;
    return b.similarityScore - a.similarityScore;
  });

  return results.slice(0, 20);
}

export function getSimilarityLabel(score: number): { label: string; emoji: string; color: string } {
  if (score > 0.7) return { label: 'Alta', emoji: '🟢', color: 'text-green-600' };
  if (score > 0.4) return { label: 'Média', emoji: '🟡', color: 'text-yellow-600' };
  return { label: 'Baixa', emoji: '🔴', color: 'text-red-600' };
}
