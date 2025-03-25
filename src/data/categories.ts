import { Category } from '../types';

export const expenseCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: 'bg-orange-500' },
  { id: '2', name: 'Transportation', icon: 'car', color: 'bg-blue-500' },
  { id: '3', name: 'Housing', icon: 'home', color: 'bg-green-500' },
  { id: '4', name: 'Entertainment', icon: 'tv', color: 'bg-purple-500' },
  { id: '5', name: 'Shopping', icon: 'shopping-bag', color: 'bg-pink-500' },
  { id: '6', name: 'Utilities', icon: 'zap', color: 'bg-yellow-500' },
  { id: '7', name: 'Health', icon: 'heart', color: 'bg-red-500' },
  { id: '8', name: 'Education', icon: 'book', color: 'bg-indigo-500' },
  { id: '9', name: 'Travel', icon: 'plane', color: 'bg-teal-500' },
  { id: '10', name: 'Other', icon: 'more-horizontal', color: 'bg-gray-500' },
];

export const incomeCategories: Category[] = [
  { id: '11', name: 'Salary', icon: 'briefcase', color: 'bg-green-600' },
  { id: '12', name: 'Freelance', icon: 'code', color: 'bg-blue-600' },
  { id: '13', name: 'Investments', icon: 'trending-up', color: 'bg-purple-600' },
  { id: '14', name: 'Gifts', icon: 'gift', color: 'bg-pink-600' },
  { id: '15', name: 'Other', icon: 'more-horizontal', color: 'bg-gray-600' },
];

export const getAllCategories = (): Category[] => {
  return [...expenseCategories, ...incomeCategories];
};

export const getCategoryById = (id: string): Category | undefined => {
  return getAllCategories().find(category => category.id === id);
};

// Category keywords for better matching
const categoryKeywords = {
  // Expense categories
  "1": [
    // Food & Dining
    "food",
    "restaurant",
    "lunch",
    "dinner",
    "breakfast",
    "cafe",
    "coffee",
    "grocery",
    "groceries",
    "supermarket",
    "takeout",
    "meal",
    "snack",
    "pizza",
    "burger",
    "bakery",
    "deli",
    "market",
    "bar",
    "pub",
    "drink",
    "dining",
    "cuisine",
    "Chinese",
    "Italian",
    "Mexican",
    "Chicken",
    "Pie",
    "Burger",
    "Fries",
    "Salad",
    "Sandwich",
    "recipe",
    "cooking",
    "fast food",
    "cake",
    "dessert",
    "ice cream",
    "sweets",
    "chocolate",
    "candy",
    "soda",
    "beverage",
    "juice",
    "tea",
    "alcohol",
    "beer",
    "coke",
    "pepsi",
    "sprite",
    "fanta",
    "cola",
    "wine",
    "liquor",
    "whiskey",
    "vodka",
    "rum",
    "gin",
    "beans",
    "vegetable",
    "apple",
    "mango",
    "banana",
    "orange",
    "grapes",
    "strawberry",
    "blueberry",
    "raspberry",
    "blackberry",
    "kiwi",
    "pineapple",
    "watermelon",
    "melon",
    "cantaloupe",
    "honeydew",
    "papaya",
    "peach",
    "pear",
    "plum",
    "apricot",
    "cherry",
    "avocado",
    "tomato",
    "potato",
    "onion",
    "garlic",
    "ginger",
    "carrot",
    "cucumber",
    "lettuce",
    "spinach",
    "kale",
    "broccoli",
    "cauliflower",
    "cabbage",
    "brussels sprouts",
    "asparagus",
    "eggplant",
    "zucchini",
    "squash",
    "bell pepper",
    "jalapeno",
    "habanero",
    "poblano",
    "serrano",
    "cayenne",
    "chili",
    "pepper",
    "mushroom",
    "corn",
    "peas",
    "lentils",
    "chickpeas",
    "soybeans",
    "tofu",
    "tempeh",
    "seitan",
    "quinoa",
    "bulgur",
    "barley",
    "oats",
    "rice",
    "pasta",
    "noodle",
    "bread",
    "bagel",
    "tortilla",
    "biscuit",
    "muffin",
    "pancake",
    "waffle",
    "croissant",
    "scone",
    "donut",
    "pie",
    "cookie",
    "brownie",
    "cupcake",
    "pudding",
    "custard",
    "sorbet",
    "gelato",
    "sherbet",
    "frozen yogurt",
    "caramel",
    "toffee",
    "fudge",
    "gum",
    "lollipop",
    "marshmallow",
    "jelly",
    "jam",
    "honey",
    "syrup",
    "sauce",
    "dressing",
    "mayonnaise",
    "ketchup",
    "mustard",
    "relish",
    "salsa",
    "guacamole",
    "hummus",
    "pesto",
    "tapenade",
    "tzatziki",
    "ranch",
    "blue cheese",
    "vinaigrette",
    "soy sauce",
    "teriyaki",
    "hoisin",
    "sriracha",
    "wasabi",
    "horseradish",
  ],
  "2": [
    // Transportation
    "uber",
    "lyft",
    "taxi",
    "cab",
    "gas",
    "fuel",
    "petrol",
    "car",
    "auto",
    "vehicle",
    "aeroplane",
    "airplane",
    "flight",
    "subway",
    "metro",
    "fare",
    "ride",
    "commute",
    "boat",
    "bus",
    "train",
    "subway",
    "metro",
    "transport",
    "fare",
    "ride",
    "commute",
    "toll",
    "parking",
    "bicycle",
    "bike",
    "scooter",
    "rental",
    "maintenance",
    "repair",
    "service",
  ],
  "3": [
    // Housing
    "rent",
    "mortgage",
    "home",
    "house",
    "apartment",
    "flat",
    "condo",
    "lease",
    "property",
    "real estate",
    "housing",
    "accommodation",
    "residence",
    "tenant",
    "landlord",
    "deposit",
    "maintenance",
    "repair",
    "furniture",
    "decor",
    "renovation",
    "improvement",
  ],
  "4": [
    // Entertainment
    "movie",
    "netflix",
    "spotify",
    "entertainment",
    "theater",
    "cinema",
    "concert",
    "show",
    "ticket",
    "event",
    "game",
    "gaming",
    "subscription",
    "streaming",
    "music",
    "video",
    "play",
    "fun",
    "hobby",
    "leisure",
    "recreation",
    "amusement",
    "party",
    "festival",
  ],
  "5": [
    // Shopping
    "shopping",
    "store",
    "mall",
    "retail",
    "purchase",
    "buy",
    "clothes",
    "clothing",
    "apparel",
    "fashion",
    "shoes",
    "accessory",
    "accessories",
    "electronics",
    "gadget",
    "device",
    "appliance",
    "fuel",
    "Plastic",
    "Jug",
    "Gas",
    "Cigarette",
    "Cigarettes",
    "Cigars",
    "Hose",
    "Aluminium Screw",
    "Bolt",
    "Nut",
    "furniture",
    "home goods",
    "decor",
    "gift",
    "online",
    "amazon",
    "ebay",
    "etsy",
  ],
  "6": [
    // Utilities
    "utility",
    "utilities",
    "electric",
    "electricity",
    "water",
    "gas",
    "power",
    "energy",
    "internet",
    "wifi",
    "broadband",
    "phone",
    "mobile",
    "Keyboard",
    "Keyboards",
    "bag",
    "laptop",
    "Mouse",
    "Monitor",
    "Printer",
    "Scanner",
    "Speaker",
    "Headphones",
    "Microphone",
    "cell",
    "bill",
    "service",
    "provider",
    "cable",
    "tv",
    "trash",
    "garbage",
    "waste",
    "sewage",
    "heating",
    "cooling",
    "hvac",
  ],
  "7": [
    // Health
    "health",
    "medical",
    "doctor",
    "physician",
    "hospital",
    "clinic",
    "dentist",
    "dental",
    "vision",
    "eye",
    "prescription",
    "medicine",
    "medication",
    "pharmacy",
    "drug",
    "vitamin",
    "supplement",
    "fitness",
    "gym",
    "workout",
    "exercise",
    "therapy",
    "counseling",
    "insurance",
  ],
  "8": [
    // Education
    "education",
    "school",
    "college",
    "university",
    "tuition",
    "course",
    "class",
    "lesson",
    "training",
    "workshop",
    "seminar",
    "book",
    "textbook",
    "supplies",
    "student",
    "loan",
    "scholarship",
    "degree",
    "certificate",
    "program",
    "study",
    "learning",
    "teaching",
  ],
  "9": [
    // Travel
    "travel",
    "trip",
    "vacation",
    "holiday",
    "flight",
    "plane",
    "airline",
    "hotel",
    "motel",
    "lodging",
    "accommodation",
    "resort",
    "booking",
    "reservation",
    "tour",
    "cruise",
    "beach",
    "sightseeing",
    "tourism",
    "passport",
    "visa",
    "luggage",
    "baggage",
    "souvenir",
  ],
  // Income categories
  "11": [
    // Salary
    "salary",
    "paycheck",
    "wage",
    "income",
    "pay",
    "earnings",
    "compensation",
    "remuneration",
    "stipend",
    "employment",
    "job",
    "work",
    "career",
    "profession",
    "occupation",
    "bonus",
    "commission",
    "overtime",
    "allowance",
    "benefit",
  ],
  "12": [
    // Freelance
    "freelance",
    "contract",
    "gig",
    "project",
    "client",
    "customer",
    "service",
    "consulting",
    "consultation",
    "advisor",
    "independent",
    "self-employed",
    "business",
    "entrepreneur",
    "startup",
    "venture",
    "side hustle",
    "moonlighting",
    "commission",
  ],
  "13": [
    // Investments
    "investment",
    "dividend",
    "interest",
    "stock",
    "bond",
    "mutual fund",
    "etf",
    "security",
    "portfolio",
    "asset",
    "equity",
    "share",
    "return",
    "profit",
    "gain",
    "yield",
    "appreciation",
    "capital",
    "market",
    "trading",
    "broker",
    "crypto",
    "bitcoin",
    "ethereum",
  ],
  "14": [
    // Gifts
    "gift",
    "present",
    "donation",
    "charity",
    "contribution",
    "grant",
    "scholarship",
    "award",
    "prize",
    "bonus",
    "inheritance",
    "estate",
    "will",
    "bequest",
    "endowment",
    "offering",
    "gratuity",
    "tip",
    "birthday",
    "holiday",
    "celebration",
    "congratulation",
  ],
};

// Transaction history for learning
const transactionHistory: Array<{description: string, categoryId: string}> = [];

// Add a transaction to history for learning
export const addToTransactionHistory = (description: string, categoryId: string) => {
  transactionHistory.push({ description, categoryId });
};

// Calculate similarity score between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Check for exact match or containment
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Check for word overlap
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchCount = 0;
  for (const word1 of words1) {
    if (word1.length < 3) continue; // Skip short words
    for (const word2 of words2) {
      if (word2.length < 3) continue; // Skip short words
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matchCount++;
        break;
      }
    }
  }
  
  return matchCount / Math.max(words1.length, words2.length);
};

// Enhanced category suggestion with learning capabilities
export const suggestCategory = (description: string): Category | undefined => {
  const lowerDesc = description.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Step 1: Check transaction history for similar descriptions
  for (const transaction of transactionHistory) {
    const similarity = calculateSimilarity(transaction.description, description);
    if (similarity > 0.7) { // High similarity threshold
      scores[transaction.categoryId] = (scores[transaction.categoryId] || 0) + similarity * 2; // Double weight for history matches
    }
  }
  
  // Step 2: Check keyword matches
  for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        scores[categoryId] = (scores[categoryId] || 0) + 1;
      }
    }
  }
  
  // Step 3: Check for amount patterns (e.g., round numbers often indicate certain categories)
  const amountMatch = lowerDesc.match(/\$?\d+(\.\d{2})?/);
  if (amountMatch) {
    const amount = parseFloat(amountMatch[0].replace('$', ''));
    
    // Large round amounts often indicate rent/mortgage
    if (amount > 500 && amount % 100 === 0) {
      scores['3'] = (scores['3'] || 0) + 0.5; // Housing
    }
    
    // Small amounts often indicate food/coffee
    if (amount < 20) {
      scores['1'] = (scores['1'] || 0) + 0.3; // Food & Dining
    }
  }
  
  // Find the category with the highest score
  let highestScore = 0;
  let bestCategoryId = '';
  
  for (const [categoryId, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestCategoryId = categoryId;
    }
  }
  
  // If we have a clear winner with a decent score
  if (highestScore > 0.5) {
    return getCategoryById(bestCategoryId);
  }
  
  // Fallback to simple keyword matching for common cases
  if (lowerDesc.includes('food') || lowerDesc.includes('restaurant') || lowerDesc.includes('lunch') || lowerDesc.includes('dinner')) {
    return expenseCategories[0]; // Food & Dining
  }
  
  if (lowerDesc.includes('uber') || lowerDesc.includes('lyft') || lowerDesc.includes('taxi') || lowerDesc.includes('gas') || lowerDesc.includes('fuel')) {
    return expenseCategories[1]; // Transportation
  }
  
  if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage') || lowerDesc.includes('home')) {
    return expenseCategories[2]; // Housing
  }
  
  if (lowerDesc.includes('movie') || lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('entertainment')) {
    return expenseCategories[3]; // Entertainment
  }
  
  if (lowerDesc.includes('salary') || lowerDesc.includes('paycheck') || lowerDesc.includes('wage')) {
    return incomeCategories[0]; // Salary
  }
  
  // Default to "Other" expense category if no match
  return expenseCategories[9];
};