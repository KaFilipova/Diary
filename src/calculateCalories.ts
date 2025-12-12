// calculateCalories.ts

import { foods } from "./foods";

export function calculateFoodByGrams(foodId: number, grams: number) {
  const food = foods.find((item) => item.id === foodId);
  if (!food) return null;

  const coef = grams / 100;
  return {
    name: food.name,
    grams,
    calories: +(food.calories * coef).toFixed(1),
    protein: +(food.protein * coef).toFixed(1),
    fat: +(food.fat * coef).toFixed(1),
    carbs: +(food.carbs * coef).toFixed(1),
  };
}

