// ─── Exercise Library ────────────────────────────────────────────────────────

export const EXERCISE_LIBRARY = {
  crossfit: {
    olympic: [
      { id: 'cf_oly_muscle_snatch', name: 'Muscle Snatch' },
      { id: 'cf_oly_power_snatch', name: 'Power Snatch' },
      { id: 'cf_oly_squat_snatch', name: 'Squat Snatch' },
      { id: 'cf_oly_hang_muscle_snatch', name: 'Hang Muscle Snatch' },
      { id: 'cf_oly_hang_power_snatch', name: 'Hang Power Snatch' },
      { id: 'cf_oly_hang_squat_snatch', name: 'Hang Squat Snatch' },
      { id: 'cf_oly_low_hang_power_snatch', name: 'Low Hang Power Snatch' },
      { id: 'cf_oly_low_hang_squat_snatch', name: 'Low Hang Squat Snatch' },
      { id: 'cf_oly_dumbbell_snatch', name: 'Dumbbell Snatch' },
      { id: 'cf_oly_kettlebell_snatch', name: 'Kettlebell Snatch' },
      { id: 'cf_oly_sandbag_snatch', name: 'Sandbag Snatch' },
      { id: 'cf_oly_snatch_balance', name: 'Snatch Balance' },
      { id: 'cf_oly_muscle_clean', name: 'Muscle Clean' },
      { id: 'cf_oly_power_clean', name: 'Power Clean' },
      { id: 'cf_oly_squat_clean', name: 'Squat Clean' },
      { id: 'cf_oly_hang_muscle_clean', name: 'Hang Muscle Clean' },
      { id: 'cf_oly_hang_power_clean', name: 'Hang Power Clean' },
      { id: 'cf_oly_hang_squat_clean', name: 'Hang Squat Clean' },
      { id: 'cf_oly_low_hang_power_clean', name: 'Low Hang Power Clean' },
      { id: 'cf_oly_low_hang_squat_clean', name: 'Low Hang Squat Clean' },
      { id: 'cf_oly_medicine_ball_clean', name: 'Medicine Ball Clean' },
      { id: 'cf_oly_dumbbell_clean', name: 'Dumbbell Clean' },
      { id: 'cf_oly_kettlebell_clean', name: 'Kettlebell Clean' },
      { id: 'cf_oly_sandbag_clean', name: 'Sandbag Clean' },
      { id: 'cf_oly_clean_and_jerk', name: 'Clean and Jerk' },
      { id: 'cf_oly_shoulder_press', name: 'Shoulder Press' },
      { id: 'cf_oly_push_press', name: 'Push Press' },
      { id: 'cf_oly_push_jerk', name: 'Push Jerk' },
      { id: 'cf_oly_split_jerk', name: 'Split Jerk' },
      { id: 'cf_oly_power_jerk', name: 'Power Jerk' },
      { id: 'cf_oly_squat_jerk', name: 'Squat Jerk' },
      { id: 'cf_oly_dumbbell_jerk', name: 'Dumbbell Jerk' },
      { id: 'cf_oly_kettlebell_jerk', name: 'Kettlebell Jerk' },
    ],
    gymnastics: [
      { id: 'cf_gym_strict_pull_up', name: 'Strict Pull-up' },
      { id: 'cf_gym_kipping_pull_up', name: 'Kipping Pull-up' },
      { id: 'cf_gym_butterfly_pull_up', name: 'Butterfly Pull-up' },
      { id: 'cf_gym_strict_chest_to_bar', name: 'Strict Chest-to-Bar' },
      { id: 'cf_gym_kipping_chest_to_bar', name: 'Kipping Chest-to-Bar' },
      { id: 'cf_gym_butterfly_chest_to_bar', name: 'Butterfly Chest-to-Bar' },
      { id: 'cf_gym_bar_muscle_up', name: 'Bar Muscle-up' },
      { id: 'cf_gym_strict_toes_to_bar', name: 'Strict Toes-to-Bar' },
      { id: 'cf_gym_kipping_toes_to_bar', name: 'Kipping Toes-to-Bar' },
      { id: 'cf_gym_knees_to_elbows', name: 'Knees-to-Elbows' },
      { id: 'cf_gym_knees_to_chest', name: 'Knees-to-Chest' },
      { id: 'cf_gym_l_sit_hold', name: 'L-Sit Hold' },
      { id: 'cf_gym_chin_up', name: 'Chin-up' },
      { id: 'cf_gym_ring_row', name: 'Ring Row' },
      { id: 'cf_gym_strict_ring_dip', name: 'Strict Ring Dip' },
      { id: 'cf_gym_kipping_ring_dip', name: 'Kipping Ring Dip' },
      { id: 'cf_gym_strict_ring_muscle_up', name: 'Strict Ring Muscle-up' },
      { id: 'cf_gym_kipping_ring_muscle_up', name: 'Kipping Ring Muscle-up' },
      { id: 'cf_gym_ring_support_hold', name: 'Ring Support Hold' },
      { id: 'cf_gym_skin_the_cat', name: 'Skin the Cat' },
      { id: 'cf_gym_push_up', name: 'Push-up' },
      { id: 'cf_gym_handstand_hold', name: 'Handstand Hold' },
      { id: 'cf_gym_strict_hspu', name: 'Strict HSPU' },
      { id: 'cf_gym_kipping_hspu', name: 'Kipping HSPU' },
      { id: 'cf_gym_deficit_hspu', name: 'Deficit HSPU' },
      { id: 'cf_gym_handstand_walk', name: 'Handstand Walk' },
      { id: 'cf_gym_air_squat', name: 'Air Squat' },
      { id: 'cf_gym_pistol_squat', name: 'Pistol Squat' },
      { id: 'cf_gym_burpee', name: 'Burpee' },
      { id: 'cf_gym_burpee_target', name: 'Burpee Target' },
      { id: 'cf_gym_abmat_sit_up', name: 'Abmat Sit-up' },
      { id: 'cf_gym_v_up', name: 'V-up' },
      { id: 'cf_gym_hollow_rock', name: 'Hollow Rock' },
      { id: 'cf_gym_arch_rock', name: 'Arch Rock' },
      { id: 'cf_gym_plank', name: 'Plank' },
      { id: 'cf_gym_l_sit_parallettes', name: 'L-Sit Parallettes' },
    ],
    strength: [
      { id: 'cf_str_back_squat', name: 'Back Squat' },
      { id: 'cf_str_front_squat', name: 'Front Squat' },
      { id: 'cf_str_overhead_squat', name: 'Overhead Squat' },
      { id: 'cf_str_goblet_squat', name: 'Goblet Squat' },
      { id: 'cf_str_deadlift', name: 'Deadlift' },
      { id: 'cf_str_sumo_deadlift', name: 'Sumo Deadlift' },
      { id: 'cf_str_sumo_deadlift_high_pull', name: 'Sumo Deadlift High Pull' },
      { id: 'cf_str_thruster', name: 'Thruster' },
      { id: 'cf_str_wall_ball_shot', name: 'Wall Ball Shot' },
      { id: 'cf_str_box_jump', name: 'Box Jump' },
      { id: 'cf_str_box_jump_over', name: 'Box Jump Over' },
      { id: 'cf_str_burpee_box_jump_over', name: 'Burpee Box Jump Over' },
      { id: 'cf_str_step_up', name: 'Step-up' },
      { id: 'cf_str_walking_lunge', name: 'Walking Lunge' },
      { id: 'cf_str_overhead_lunge', name: 'Overhead Lunge' },
      { id: 'cf_str_front_rack_lunge', name: 'Front Rack Lunge' },
      { id: 'cf_str_devil_press', name: 'Devil Press' },
      { id: 'cf_str_farmers_carry', name: "Farmer's Carry" },
      { id: 'cf_str_overhead_carry', name: 'Overhead Carry' },
      { id: 'cf_str_front_rack_carry', name: 'Front Rack Carry' },
    ],
    monostructural: [
      { id: 'cf_mono_double_under', name: 'Double Under' },
      { id: 'cf_mono_single_under', name: 'Single Under' },
      { id: 'cf_mono_triple_under', name: 'Triple Under' },
      { id: 'cf_mono_rowing', name: 'Rowing' },
      { id: 'cf_mono_assault_bike', name: 'Assault Bike' },
      { id: 'cf_mono_bike_erg', name: 'BikeErg' },
      { id: 'cf_mono_ski_erg', name: 'SkiErg' },
      { id: 'cf_mono_running', name: 'Running' },
      { id: 'cf_mono_shuttle_run', name: 'Shuttle Run' },
    ],
  },

  strength_training: {
    chest: [
      { id: 'wb_chest_supino_reto_barra', name: 'Supino Reto Barra' },
      { id: 'wb_chest_supino_reto_halteres', name: 'Supino Reto Halteres' },
      { id: 'wb_chest_supino_reto_maquina', name: 'Supino Reto Máquina' },
      { id: 'wb_chest_supino_inclinado_barra', name: 'Supino Inclinado Barra' },
      { id: 'wb_chest_supino_inclinado_halteres', name: 'Supino Inclinado Halteres' },
      { id: 'wb_chest_supino_declinado_barra', name: 'Supino Declinado Barra' },
      { id: 'wb_chest_supino_declinado_halteres', name: 'Supino Declinado Halteres' },
      { id: 'wb_chest_crucifixo_reto', name: 'Crucifixo Reto' },
      { id: 'wb_chest_crucifixo_inclinado', name: 'Crucifixo Inclinado' },
      { id: 'wb_chest_crossover_polia_alta', name: 'Crossover Polia Alta' },
      { id: 'wb_chest_crossover_polia_media', name: 'Crossover Polia Média' },
      { id: 'wb_chest_crossover_polia_baixa', name: 'Crossover Polia Baixa' },
      { id: 'wb_chest_peck_deck', name: 'Peck Deck' },
      { id: 'wb_chest_flexao_de_bracos', name: 'Flexão de Braços' },
      { id: 'wb_chest_dips_peito', name: 'Dips Peito' },
      { id: 'wb_chest_pullover', name: 'Pullover' },
    ],
    back: [
      { id: 'wb_back_puxada_alta_pronada', name: 'Puxada Alta Pronada' },
      { id: 'wb_back_puxada_alta_supinada', name: 'Puxada Alta Supinada' },
      { id: 'wb_back_puxada_aberta', name: 'Puxada Aberta' },
      { id: 'wb_back_puxada_triangulo', name: 'Puxada Triângulo' },
      { id: 'wb_back_barra_fixa_pull_up', name: 'Barra Fixa Pull-up' },
      { id: 'wb_back_barra_fixa_chin_up', name: 'Barra Fixa Chin-up' },
      { id: 'wb_back_remada_curvada_barra', name: 'Remada Curvada Barra' },
      { id: 'wb_back_remada_curvada_halteres', name: 'Remada Curvada Halteres' },
      { id: 'wb_back_remada_cavalinho', name: 'Remada Cavalinho' },
      { id: 'wb_back_remada_unilateral', name: 'Remada Unilateral' },
      { id: 'wb_back_remada_baixa_polia', name: 'Remada Baixa Polia' },
      { id: 'wb_back_remada_baixa_triangulo', name: 'Remada Baixa Triângulo' },
      { id: 'wb_back_pullover_halter', name: 'Pullover Halter' },
      { id: 'wb_back_pullover_polia', name: 'Pullover Polia' },
      { id: 'wb_back_levantamento_terra_costas', name: 'Levantamento Terra Costas' },
      { id: 'wb_back_face_pull', name: 'Face Pull' },
    ],
    legs: [
      { id: 'wb_legs_agachamento_livre', name: 'Agachamento Livre' },
      { id: 'wb_legs_agachamento_frontal', name: 'Agachamento Frontal' },
      { id: 'wb_legs_leg_press_45', name: 'Leg Press 45' },
      { id: 'wb_legs_leg_press_horizontal', name: 'Leg Press Horizontal' },
      { id: 'wb_legs_cadeira_extensora', name: 'Cadeira Extensora' },
      { id: 'wb_legs_cadeira_flexora', name: 'Cadeira Flexora' },
      { id: 'wb_legs_mesa_flexora', name: 'Mesa Flexora' },
      { id: 'wb_legs_stiff_barra', name: 'Stiff Barra' },
      { id: 'wb_legs_stiff_halteres', name: 'Stiff Halteres' },
      { id: 'wb_legs_avanco', name: 'Avanço' },
      { id: 'wb_legs_afundo', name: 'Afundo' },
      { id: 'wb_legs_agachamento_bulgaro', name: 'Agachamento Búlgaro' },
      { id: 'wb_legs_agachamento_hack', name: 'Agachamento Hack' },
      { id: 'wb_legs_agachamento_sumo', name: 'Agachamento Sumô' },
      { id: 'wb_legs_hip_thrust', name: 'Hip Thrust' },
      { id: 'wb_legs_good_morning', name: 'Good Morning' },
      { id: 'wb_legs_cadeira_abdutora', name: 'Cadeira Abdutora' },
      { id: 'wb_legs_gluteo_cabo', name: 'Glúteo Cabo' },
      { id: 'wb_legs_sissy_squat', name: 'Sissy Squat' },
    ],
    shoulders: [
      { id: 'wb_shoulders_desenvolvimento_militar_barra', name: 'Desenvolvimento Militar Barra' },
      { id: 'wb_shoulders_desenvolvimento_halteres', name: 'Desenvolvimento Halteres' },
      { id: 'wb_shoulders_desenvolvimento_maquina', name: 'Desenvolvimento Máquina' },
      { id: 'wb_shoulders_desenvolvimento_arnold', name: 'Desenvolvimento Arnold' },
      { id: 'wb_shoulders_elevacao_lateral_halteres', name: 'Elevação Lateral Halteres' },
      { id: 'wb_shoulders_elevacao_lateral_polia', name: 'Elevação Lateral Polia' },
      { id: 'wb_shoulders_elevacao_frontal_barra', name: 'Elevação Frontal Barra' },
      { id: 'wb_shoulders_elevacao_frontal_halteres', name: 'Elevação Frontal Halteres' },
      { id: 'wb_shoulders_elevacao_frontal_polia', name: 'Elevação Frontal Polia' },
      { id: 'wb_shoulders_elevacao_posterior_halteres', name: 'Elevação Posterior Halteres' },
      { id: 'wb_shoulders_peck_deck_inverso', name: 'Peck Deck Inverso' },
      { id: 'wb_shoulders_remada_alta_barra', name: 'Remada Alta Barra' },
      { id: 'wb_shoulders_remada_alta_polia', name: 'Remada Alta Polia' },
      { id: 'wb_shoulders_encolhimento_barra', name: 'Encolhimento Barra' },
      { id: 'wb_shoulders_encolhimento_halteres', name: 'Encolhimento Halteres' },
    ],
    biceps: [
      { id: 'wb_biceps_rosca_direta_barra_w', name: 'Rosca Direta Barra W' },
      { id: 'wb_biceps_rosca_direta_barra_reta', name: 'Rosca Direta Barra Reta' },
      { id: 'wb_biceps_rosca_alternada', name: 'Rosca Alternada' },
      { id: 'wb_biceps_rosca_martelo', name: 'Rosca Martelo' },
      { id: 'wb_biceps_rosca_concentrada', name: 'Rosca Concentrada' },
      { id: 'wb_biceps_rosca_scott', name: 'Rosca Scott' },
      { id: 'wb_biceps_rosca_21', name: 'Rosca 21' },
      { id: 'wb_biceps_rosca_polia', name: 'Rosca Polia' },
    ],
    triceps: [
      { id: 'wb_triceps_pulley_corda', name: 'Tríceps Pulley Corda' },
      { id: 'wb_triceps_pulley_barra_reta', name: 'Tríceps Pulley Barra Reta' },
      { id: 'wb_triceps_frances_halter', name: 'Tríceps Francês Halter' },
      { id: 'wb_triceps_frances_polia', name: 'Tríceps Francês Polia' },
      { id: 'wb_triceps_testa_barra', name: 'Tríceps Testa Barra' },
      { id: 'wb_triceps_testa_halteres', name: 'Tríceps Testa Halteres' },
      { id: 'wb_triceps_coice', name: 'Tríceps Coice' },
      { id: 'wb_triceps_supino_fechado', name: 'Supino Fechado' },
      { id: 'wb_triceps_mergulho_paralelas', name: 'Mergulho Paralelas' },
      { id: 'wb_triceps_extensao_overhead', name: 'Extensão Overhead' },
    ],
    abs: [
      { id: 'wb_abs_crunch_abdominal', name: 'Crunch Abdominal' },
      { id: 'wb_abs_abdominal_infra', name: 'Abdominal Infra' },
      { id: 'wb_abs_elevacao_de_pernas', name: 'Elevação de Pernas' },
      { id: 'wb_abs_abdominal_obliquo', name: 'Abdominal Oblíquo' },
      { id: 'wb_abs_placa_isometrica', name: 'Placa Isométrica' },
      { id: 'wb_abs_abdominal_maquina', name: 'Abdominal Máquina' },
      { id: 'wb_abs_extensao_lombar', name: 'Extensão Lombar' },
      { id: 'wb_abs_roda_abdominal', name: 'Roda Abdominal' },
      { id: 'wb_abs_russian_twist', name: 'Russian Twist' },
      { id: 'wb_abs_ghd_sit_up', name: 'GHD Sit-up' },
    ],
    calves: [
      { id: 'wb_calves_gemeos_pe_maquina', name: 'Gêmeos em Pé Máquina' },
      { id: 'wb_calves_gemeos_pe_smith', name: 'Gêmeos em Pé Smith' },
      { id: 'wb_calves_gemeos_sentado', name: 'Gêmeos Sentado' },
      { id: 'wb_calves_gemeos_leg_press', name: 'Gêmeos Leg Press' },
    ],
  },

  functional: [
    { id: 'func_kettlebell_swing', name: 'Kettlebell Swing' },
    { id: 'func_turkish_get_up', name: 'Turkish Get Up' },
    { id: 'func_farmer_carry', name: 'Farmer Carry' },
    { id: 'func_sled_push', name: 'Sled Push' },
    { id: 'func_sled_pull', name: 'Sled Pull' },
    { id: 'func_battle_rope', name: 'Battle Rope' },
    { id: 'func_medicine_ball_slam', name: 'Medicine Ball Slam' },
    { id: 'func_sandbag_clean', name: 'Sandbag Clean' },
    { id: 'func_trx_row', name: 'TRX Row' },
    { id: 'func_trx_push_up', name: 'TRX Push Up' },
    { id: 'func_box_step_up', name: 'Box Step Up' },
    { id: 'func_bear_crawl', name: 'Bear Crawl' },
    { id: 'func_crab_walk', name: 'Crab Walk' },
    { id: 'func_kettlebell_clean', name: 'Kettlebell Clean' },
    { id: 'func_kettlebell_snatch', name: 'Kettlebell Snatch' },
    { id: 'func_battle_rope_waves', name: 'Battle Rope Waves' },
    { id: 'func_wall_ball', name: 'Wall Ball' },
    { id: 'func_slamball', name: 'Slamball' },
  ],
}

// ─── Category Metadata ───────────────────────────────────────────────────────

export const EXERCISE_CATEGORIES = {
  crossfit: {
    label: 'CrossFit',
    icon: '🏋️',
    subcategories: {
      olympic: 'LPO',
      gymnastics: 'Ginástico',
      strength: 'Força',
      monostructural: 'Monoestrutural',
    },
  },
  strength_training: {
    label: 'Musculação',
    icon: '💪',
    subcategories: {
      chest: 'Peito',
      back: 'Costas',
      legs: 'Pernas',
      shoulders: 'Ombros',
      biceps: 'Bíceps',
      triceps: 'Tríceps',
      abs: 'Abdômen',
      calves: 'Panturrilha',
    },
  },
  functional: {
    label: 'Funcional',
    icon: '⚡',
    subcategories: null,
  },
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/**
 * Case-insensitive search across all categories and subcategories.
 * Returns array of { ...exercise, category, subcategory } objects.
 */
export function searchExercises(query) {
  if (!query || !query.trim()) return getAllExercises()
  const q = query.trim().toLowerCase()
  return getAllExercises().filter((ex) => ex.name.toLowerCase().includes(q))
}

/**
 * Find a single exercise by id across the entire library.
 * Returns { ...exercise, category, subcategory } or undefined.
 */
export function getExerciseById(id) {
  return getAllExercises().find((ex) => ex.id === id)
}

/**
 * Flatten the entire exercise library into a single array.
 * Each item includes: id, name, category, subcategory (null for flat lists).
 */
export function getAllExercises() {
  const results = []

  for (const [categoryKey, categoryValue] of Object.entries(EXERCISE_LIBRARY)) {
    if (Array.isArray(categoryValue)) {
      // Flat category (e.g. functional)
      for (const exercise of categoryValue) {
        results.push({ ...exercise, category: categoryKey, subcategory: null })
      }
    } else {
      // Nested category with subcategories
      for (const [subcategoryKey, exercises] of Object.entries(categoryValue)) {
        for (const exercise of exercises) {
          results.push({ ...exercise, category: categoryKey, subcategory: subcategoryKey })
        }
      }
    }
  }

  return results
}
