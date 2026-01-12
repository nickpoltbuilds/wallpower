/**
 * Food Emoji Mapping Service
 * Maps food item names to appropriate emojis for visual display
 */

interface FoodEmojiMapping {
  keywords: string[];
  emoji: string;
}

const FOOD_EMOJI_MAP: FoodEmojiMapping[] = [
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
  { keywords: ['rice', 'fried rice'], emoji: '🍚' },
  { keywords: ['pasta', 'macaroni', 'penne', 'linguine'], emoji: '🍝' },
  { keywords: ['mac and cheese', 'mac & cheese', 'macaroni and cheese'], emoji: '🧀' },
  { keywords: ['potato', 'mashed potato', 'baked potato'], emoji: '🥔' },
  { keywords: ['tomato'], emoji: '🍅' },
  { keywords: ['cucumber'], emoji: '🥒' },
  { keywords: ['pepper', 'bell pepper'], emoji: '🫑' },
  { keywords: ['green bean', 'string bean'], emoji: '🫘' },
  { keywords: ['peas'], emoji: '🫛' },

  // Fruits
  { keywords: ['apple', 'applesauce'], emoji: '🍎' },
  { keywords: ['orange', 'mandarin'], emoji: '🍊' },
  { keywords: ['banana'], emoji: '�banana' },
  { keywords: ['strawberry', 'berry', 'berries', 'blueberry', 'raspberry'], emoji: '🍓' },
  { keywords: ['watermelon'], emoji: '🍉' },
  { keywords: ['grapes'], emoji: '🍇' },
  { keywords: ['fruit cup', 'fruit salad', 'mixed fruit', 'fresh fruit'], emoji: '🍇' },
  { keywords: ['pear'], emoji: '🍐' },
  { keywords: ['peach'], emoji: '🍑' },
  { keywords: ['pineapple'], emoji: '🍍' },
  { keywords: ['lemon'], emoji: '🍋' },
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
  { keywords: ['chips', 'doritos', 'cheetos'], emoji: '🥔' },

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

  // Condiments & Add-ons
  { keywords: ['ketchup'], emoji: '🍅' },
  { keywords: ['mustard'], emoji: '💛' },
  { keywords: ['ranch', 'dressing'], emoji: '🥗' },
];

/**
 * Maps a food item name to the best matching emoji
 * @param foodName - The name of the food item
 * @returns The emoji that best represents the food item
 */
export function getFoodEmoji(foodName: string): string {
  if (!foodName) return '🍽️';

  const lowerName = foodName.toLowerCase();

  // Find first matching emoji based on keywords
  for (const mapping of FOOD_EMOJI_MAP) {
    for (const keyword of mapping.keywords) {
      if (lowerName.includes(keyword)) {
        return mapping.emoji;
      }
    }
  }

  // Default fallback emoji
  return '🍽️';
}

/**
 * Gets emojis for multiple food items
 * @param foodItems - Array of food item names
 * @returns Array of objects with food name and emoji
 */
export function getFoodEmojis(foodItems: string[]): Array<{ name: string; emoji: string }> {
  return foodItems.map(item => ({
    name: item,
    emoji: getFoodEmoji(item)
  }));
}
