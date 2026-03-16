
const FOOD_EMOJI_MAP: { keywords: string[]; emoji: string }[] = [
  // Proteins & Mains
  { keywords: ['chicken', 'tender', 'nugget', 'popcorn chicken', 'fried chicken'], emoji: '🍗' },
  { keywords: ['burger', 'hamburger', 'cheeseburger'], emoji: '🍔' },
  { keywords: ['pizza'], emoji: '🍕' },
  { keywords: ['hot dog', 'hotdog', 'corn dog'], emoji: '🌭' },
  { keywords: ['taco'], emoji: '🌮' },
  { keywords: ['burrito', 'wrap'], emoji: '🌯' },
  { keywords: ['sandwich', 'sub', 'hoagie'], emoji: '🥪' },
  { keywords: ['fish', 'salmon', 'tuna', 'tilapia'], emoji: '🐟' },
  { keywords: ['spaghetti', 'meatball'], emoji: '🍝' },
  { keywords: ['steak', 'beef'], emoji: '🥩' },
  { keywords: ['turkey'], emoji: '🦃' },
  { keywords: ['pork', 'ham'], emoji: '🥓' },
  { keywords: ['sushi'], emoji: '🍣' },
  { keywords: ['soup', 'chili', 'stew'], emoji: '🍲' },
  { keywords: ['ramen', 'noodle'], emoji: '🍜' },

  // Sides & Vegetables
  { keywords: ['fries', 'french fries', 'potato wedge'], emoji: '🍟' },
  { keywords: ['salad', 'greens', 'lettuce'], emoji: '🥗' },
  { keywords: ['broccoli'], emoji: '🥦' },
  { keywords: ['carrot'], emoji: '🥕' },
  { keywords: ['corn', 'maize'], emoji: '🌽' },
  { keywords: ['mac and cheese', 'mac & cheese', 'macaroni and cheese'], emoji: '🧀' },
  { keywords: ['pasta', 'macaroni', 'penne', 'linguine'], emoji: '🍝' },
  { keywords: ['rice', 'fried rice'], emoji: '🍚' },
  { keywords: ['potato', 'mashed potato', 'baked potato'], emoji: '🥔' },
  { keywords: ['tomato'], emoji: '🍅' },
  { keywords: ['cucumber'], emoji: '🥒' },
  { keywords: ['pepper', 'bell pepper'], emoji: '🫑' },
  { keywords: ['green bean', 'string bean'], emoji: '🫘' },
  { keywords: ['peas'], emoji: '🫛' },

  // Fruits
  { keywords: ['apple', 'applesauce'], emoji: '🍎' },
  { keywords: ['orange', 'mandarin'], emoji: '🍊' },
  { keywords: ['banana'], emoji: '🍌' },
  { keywords: ['strawberry', 'blueberry', 'raspberry', 'berry', 'berries'], emoji: '🍓' },
  { keywords: ['watermelon'], emoji: '🍉' },
  { keywords: ['grapes', 'fruit cup', 'fruit salad', 'mixed fruit', 'fresh fruit'], emoji: '🍇' },
  { keywords: ['pear'], emoji: '🍐' },
  { keywords: ['peach'], emoji: '🍑' },
  { keywords: ['pineapple'], emoji: '🍍' },
  { keywords: ['cherry'], emoji: '🍒' },

  // Drinks
  { keywords: ['milk', 'chocolate milk', 'white milk'], emoji: '🥛' },
  { keywords: ['juice', 'apple juice', 'orange juice'], emoji: '🧃' },
  { keywords: ['water', 'bottled water'], emoji: '💧' },

  // Desserts & Snacks
  { keywords: ['cookie', 'chocolate chip'], emoji: '🍪' },
  { keywords: ['ice cream', 'frozen yogurt'], emoji: '🍨' },
  { keywords: ['cake', 'cupcake'], emoji: '🍰' },
  { keywords: ['donut', 'doughnut'], emoji: '🍩' },
  { keywords: ['brownie', 'chocolate'], emoji: '🍫' },
  { keywords: ['pretzel'], emoji: '🥨' },
  { keywords: ['popcorn'], emoji: '🍿' },

  // Breakfast Items
  { keywords: ['pancake', 'flapjack'], emoji: '🥞' },
  { keywords: ['waffle'], emoji: '🧇' },
  { keywords: ['egg', 'omelet', 'omelette', 'scrambled'], emoji: '🍳' },
  { keywords: ['bacon'], emoji: '🥓' },
  { keywords: ['toast', 'bread', 'roll', 'bun'], emoji: '🍞' },
  { keywords: ['bagel'], emoji: '🥯' },
  { keywords: ['cereal'], emoji: '🥣' },
  { keywords: ['croissant'], emoji: '🥐' },

  // Cheese & Dairy
  { keywords: ['cheese', 'cheddar', 'mozzarella'], emoji: '🧀' },
  { keywords: ['yogurt'], emoji: '🥛' },
];

export function getFoodEmoji(foodName: string): string {
  if (!foodName) return '🍽️';
  const lower = foodName.toLowerCase();
  for (const { keywords, emoji } of FOOD_EMOJI_MAP) {
    if (keywords.some(k => lower.includes(k))) return emoji;
  }
  return '🍽️';
}
