/**
 * Nutrition calculation utilities.
 * All weight in kg, height in cm, age in years.
 */

/**
 * Mifflin-St Jeor BMR formula.
 * sex: 'male' | 'female'
 */
export function calculateBMR({ weight_kg, height_cm, age, sex }) {
  const w = parseFloat(weight_kg) || 70
  const h = parseFloat(height_cm) || 170
  const a = parseFloat(age) || 30
  if (sex === 'female') {
    return 10 * w + 6.25 * h - 5 * a - 161
  }
  // male (default)
  return 10 * w + 6.25 * h - 5 * a + 5
}

/**
 * TDEE = BMR × activity multiplier.
 * activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
}

export function calculateTDEE({ weight_kg, height_cm, age, sex, activityLevel = 'moderate' }) {
  const bmr = calculateBMR({ weight_kg, height_cm, age, sex })
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55
  return Math.round(bmr * multiplier)
}

/**
 * Adjust TDEE based on cycle type to get daily calorie target.
 */
const CALORIE_ADJUSTMENTS = {
  cutting:          -500,
  bulking:           400,
  maintenance:         0,
  recomp:           -150,
  peaking:          -200,
  deload:              0,
  fasting_protocol: -300,
  strength_focus:    200,
  cardio_focus:     -200,
  custom:              0,
}

export function calculateTargetCalories(tdee, cycleType) {
  const adjustment = CALORIE_ADJUSTMENTS[cycleType] ?? 0
  return Math.max(1200, tdee + adjustment)
}

/**
 * Macro splits (protein g/kg, then fill with carbs/fat).
 * Returns { proteinG, carbG, fatG, totalKcal }
 */
const PROTEIN_PER_KG = {
  cutting:          2.2,
  bulking:          1.8,
  maintenance:      1.6,
  recomp:           2.4,
  peaking:          2.2,
  deload:           1.6,
  fasting_protocol: 1.8,
  strength_focus:   2.0,
  cardio_focus:     1.8,
  custom:           1.8,
}

export function calculateMacros({ targetCalories, weight_kg, cycleType }) {
  const w = parseFloat(weight_kg) || 70
  const proteinPerKg = PROTEIN_PER_KG[cycleType] ?? 1.8

  const proteinG = Math.round(w * proteinPerKg)
  const proteinKcal = proteinG * 4

  // Fat: ~25% of target calories
  const fatKcal = Math.round(targetCalories * 0.25)
  const fatG = Math.round(fatKcal / 9)

  // Carbs: remainder
  const carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal)
  const carbG = Math.round(carbKcal / 4)

  return { proteinG, carbG, fatG, totalKcal: targetCalories }
}

/**
 * Convenience: run the full pipeline and return everything.
 */
export function calculateNutritionPlan({ profile, cycleType, activityLevel = 'moderate' }) {
  const tdee = calculateTDEE({
    weight_kg:  profile?.weight_kg  ?? profile?.current_weight_kg ?? 70,
    height_cm:  profile?.height_cm  ?? 170,
    age:        profile?.age        ?? 30,
    sex:        profile?.sex        ?? 'male',
    activityLevel,
  })

  const targetCalories = calculateTargetCalories(tdee, cycleType)

  const macros = calculateMacros({
    targetCalories,
    weight_kg: profile?.weight_kg ?? profile?.current_weight_kg ?? 70,
    cycleType,
  })

  return {
    tdee,
    targetCalories,
    proteinG:  macros.proteinG,
    carbG:     macros.carbG,
    fatG:      macros.fatG,
    activityLevel,
    cycleType,
  }
}
