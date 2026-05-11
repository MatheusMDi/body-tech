// ─── Nutrition Calculation Utilities ─────────────────────────────────────────
// Pure functions — no side effects.

import { ACTIVITY_LEVELS, CYCLE_TYPES, MACRO_FORMULAS } from '../constants/cyclePresets.js'

/**
 * Mifflin-St Jeor BMR formula.
 * Male:   (10 * w) + (6.25 * h) - (5 * a) + 5
 * Female: (10 * w) + (6.25 * h) - (5 * a) - 161
 *
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age
 * @param {'male'|'female'|string} sex
 * @returns {number} BMR in kcal/day
 */
export function calculateBMR(weightKg, heightCm, age, sex) {
  const w = parseFloat(weightKg) || 70
  const h = parseFloat(heightCm) || 170
  const a = parseFloat(age) || 30
  const base = 10 * w + 6.25 * h - 5 * a
  return sex === 'female' ? base - 161 : base + 5
}

/**
 * Total Daily Energy Expenditure = BMR * activity multiplier.
 *
 * @param {number} bmr
 * @param {string} activityLevel  - key from ACTIVITY_LEVELS
 * @returns {number} TDEE in kcal/day
 */
export function calculateTDEE(bmr, activityLevel) {
  const level = ACTIVITY_LEVELS[activityLevel]
  const multiplier = level ? level.multiplier : 1.55 // fallback: moderate
  return Math.round(bmr * multiplier)
}

/**
 * Target daily calories for a given cycle type.
 *
 * @param {number} tdee
 * @param {string} cycleType  - key from CYCLE_TYPES
 * @returns {number} target calories in kcal/day
 */
export function calculateTargetCalories(tdee, cycleType) {
  const cycle = CYCLE_TYPES[cycleType]
  const adjustment = cycle ? cycle.calorieAdjust : 0
  return Math.round(tdee + adjustment)
}

/**
 * Calculate macro breakdown in grams and percentages.
 *
 * Rules:
 *  - Cut: protein 2.2g/kg, fat 0.8g/kg, carbs = remainder
 *  - Cut Aggressive: protein 2.4g/kg, fat 0.7g/kg, carbs = remainder
 *  - Bulk: protein 1.8g/kg, carbs 50% kcal, fat = remainder
 *  - Bulk Lean / Strength: protein 2.0g/kg, carbs 45% kcal, fat = remainder
 *  - Default (maintenance/recomp/etc): protein 2.0g/kg, fat 0.9g/kg, carbs = remainder
 *
 * @param {number} targetCalories
 * @param {number} weightKg
 * @param {string} cycleType
 * @returns {{ proteinG: number, carbG: number, fatG: number,
 *             proteinKcal: number, carbKcal: number, fatKcal: number,
 *             proteinPct: number, carbPct: number, fatPct: number }}
 */
export function calculateMacros(targetCalories, weightKg, cycleType) {
  const w = parseFloat(weightKg) || 70
  const formula = MACRO_FORMULAS[cycleType] || MACRO_FORMULAS['maintenance']

  const proteinG = Math.round(formula.protein_g_per_kg * w)
  const proteinKcal = proteinG * 4

  let carbG, carbKcal, fatG, fatKcal

  if (formula.carb_fill) {
    // Protein + fat fixed by g/kg; carbs fill remainder
    fatG = Math.round((formula.fat_g_per_kg || 0.9) * w)
    fatKcal = fatG * 9
    carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal)
    carbG = Math.round(carbKcal / 4)
  } else {
    // Carbs fixed as percentage of total kcal; fat fills remainder
    carbKcal = Math.round(((formula.carb_pct || 45) / 100) * targetCalories)
    carbG = Math.round(carbKcal / 4)
    fatKcal = Math.max(0, targetCalories - proteinKcal - carbKcal)
    fatG = Math.round(fatKcal / 9)
  }

  const actualProteinKcal = proteinG * 4
  const actualCarbKcal = carbG * 4
  const actualFatKcal = fatG * 9
  const totalKcal = actualProteinKcal + actualCarbKcal + actualFatKcal || 1

  return {
    proteinG,
    carbG,
    fatG,
    proteinKcal: actualProteinKcal,
    carbKcal: actualCarbKcal,
    fatKcal: actualFatKcal,
    proteinPct: Math.round((actualProteinKcal / totalKcal) * 100),
    carbPct: Math.round((actualCarbKcal / totalKcal) * 100),
    fatPct: Math.round((actualFatKcal / totalKcal) * 100),
  }
}

/**
 * Full nutrition plan calculation in one call.
 *
 * @param {object} profile  - must include: weight_goal (kg), height_cm, age, sex, activity_level
 * @param {string} cycleType
 * @returns {{ bmr: number, tdee: number, targetCalories: number, macros: object }}
 */
export function calculateNutritionPlan(profile, cycleType) {
  const weightKg = parseFloat(profile?.weight_goal || profile?.weight_kg) || 70
  const heightCm = parseFloat(profile?.height_cm) || 170
  const age = parseFloat(profile?.age) || 30
  const sex = profile?.sex || 'male'
  const activityLevel = profile?.activity_level || 'moderate'

  const bmr = Math.round(calculateBMR(weightKg, heightCm, age, sex))
  const tdee = calculateTDEE(bmr, activityLevel)
  const targetCalories = calculateTargetCalories(tdee, cycleType)
  const macros = calculateMacros(targetCalories, weightKg, cycleType)

  return {
    bmr,
    tdee,
    targetCalories,
    macros,
  }
}
