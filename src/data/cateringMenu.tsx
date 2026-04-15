export interface SizeOption {
  size: string;
  serves: string;
}

export interface CateringDish {
  id: string;
  name: string;
  category: string;
  description: string;
  sizes: SizeOption[];
}

export const cateringMenu: CateringDish[] = [
  {
    id: 'jollof-rice',
    name: 'Jollof Rice',
    category: 'Rice Dishes',
    description: 'Our signature jollof rice with perfectly seasoned chicken, turkey, beef, or fish & plantain',
    sizes: [
      { size: 'Small Tray', serves: 'Serves 8–10' },
      { size: 'Medium Tray', serves: 'Serves 15–20' },
      { size: 'Large Tray', serves: 'Serves 30–40' },
      { size: 'Full Cooler', serves: 'Serves 50–60' },
    ],
  },
  {
    id: 'fried-rice',
    name: 'Fried Rice',
    category: 'Rice Dishes',
    description: 'Colorful Nigerian fried rice with vegetables, chicken, turkey, beef, or fish & plantain',
    sizes: [
      { size: 'Small Tray', serves: 'Serves 8–10' },
      { size: 'Medium Tray', serves: 'Serves 15–20' },
      { size: 'Large Tray', serves: 'Serves 30–40' },
      { size: 'Full Cooler', serves: 'Serves 50–60' },
    ],
  },

  {
    id: 'egusi-soup',
    name: 'Egusi Soup',
    category: 'Soup Dishes',
    description: 'Traditional egusi soup with assorted meat, served with pounded yam, fufu, or eba',
    sizes: [
      { size: 'Family Tub', serves: 'Serves 8–10' },
      { size: 'Large Tub', serves: 'Serves 15–20' },
      { size: 'Extra Large', serves: 'Serves 25–30' },
    ],
  },
  {
    id: 'efo-riro',
    name: 'Efo Riro',
    category: 'Soup Dishes',
    description: 'Rich spinach stew cooked with assorted meats and spices',
    sizes: [
      { size: 'Family Tub', serves: 'Serves 8–10' },
      { size: 'Large Tub', serves: 'Serves 15–20' },
      { size: 'Extra Large', serves: 'Serves 25–30' },
    ],
  },
  {
    id: 'ayamase',
    name: 'Ayamase (Designer Stew)',
    category: 'Soup Dishes',
    description: 'Traditional green pepper sauce with assorted meats',
    sizes: [
      { size: 'Family Tub', serves: 'Serves 8–10' },
      { size: 'Large Tub', serves: 'Serves 15–20' },
      { size: 'Extra Large', serves: 'Serves 25–30' },
    ],
  },

  {
    id: 'drumsticks',
    name: 'Drumsticks',
    category: 'Meat Dishes',
    description: 'Marinated chicken drumsticks, grilled to perfection',
    sizes: [
      { size: 'Small', serves: '10–12 pieces' },
      { size: 'Medium', serves: '20–24 pieces' },
      { size: 'Large', serves: '30–36 pieces' },
    ],
  },
  {
    id: 'assorted-meat',
    name: 'Assorted Meat in Stew',
    category: 'Meat Dishes',
    description: 'Beef and chicken garnished in rich stew',
    sizes: [
      { size: 'Small', serves: 'Serves 8–10' },
      { size: 'Medium', serves: 'Serves 15–20' },
      { size: 'Large', serves: 'Serves 30–40' },
    ],
  },

  {
    id: 'grilled-fish',
    name: 'Grilled Fish with Yam & Plantain',
    category: 'Fish Dishes',
    description: 'Freshly grilled fish served with yam and plantain',
    sizes: [
      { size: 'Small', serves: 'Serves 6–8' },
      { size: 'Medium', serves: 'Serves 12–15' },
      { size: 'Large', serves: 'Serves 20–25' },
    ],
  },

  {
    id: 'yam-porridge',
    name: 'Yam Porridge (Asaro)',
    category: 'Yam Dishes',
    description: 'Savory yam porridge cooked with palm oil and spices',
    sizes: [
      { size: 'Small Tray', serves: 'Serves 8–10' },
      { size: 'Medium Tray', serves: 'Serves 15–20' },
      { size: 'Large Tray', serves: 'Serves 30–40' },
    ],
  },

  {
    id: 'moimoi',
    name: 'Moi Moi',
    category: 'Beans Dishes',
    description: 'Steamed bean pudding, rich and flavorful',
    sizes: [
      { size: 'Small', serves: '10 pieces' },
      { size: 'Medium', serves: '15 pieces' },
      { size: 'Large', serves: '25 pieces' },
    ],
  },

  {
    id: 'abula',
    name: 'Abula (Amala, Ewedu & Gbegiri)',
    category: 'Swallow Dishes',
    description: 'Classic Yoruba combo with amala, ewedu and gbegiri soup',
    sizes: [
      { size: 'Family Pack', serves: 'Serves 8–10' },
      { size: 'Large Pack', serves: 'Serves 15–20' },
      { size: 'Extra Large', serves: 'Serves 25–30' },
    ],
  },

  {
    id: 'puff-puff',
    name: 'Puff Puff',
    category: 'Pastries',
    description: 'Sweet Nigerian doughnuts, freshly fried',
    sizes: [
      { size: 'Small', serves: '20 pieces' },
      { size: 'Medium', serves: '40 pieces' },
      { size: 'Large', serves: '60 pieces' },
    ],
  },
];

export const categories = [
  'All Dishes',
  'Rice Dishes',
  'Soup Dishes',
  'Meat Dishes',
  'Fish Dishes',
  'Yam Dishes',
  'Beans Dishes',
  'Swallow Dishes',
  'Pastries',
];
