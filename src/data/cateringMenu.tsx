export interface SizeOption {
  size: string;
  price: string;
  serves?: string;
}

export interface CateringDish {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  basePrice: string;
  sizes: SizeOption[];
}

export const cateringMenu: CateringDish[] = [
  // Rice Dishes
  {
    id: 'jollof-rice',
    name: 'Jollof Rice',
    category: 'Rice Dishes',
    image: '/catering/jolloftray.jpeg',
    description: 'Our signature jollof rice with perfectly seasoned chicken, turkey, beef, or fish & plantain',
    basePrice: 'From £35.00',
    sizes: [
      { size: 'Small Tray', price: '£35.00', serves: 'Serves 8-10' },
      { size: 'Medium Tray', price: '£55.00', serves: 'Serves 15-20' },
      { size: 'Large Tray', price: '£85.00', serves: 'Serves 30-40' },
      { size: 'Full Cooler', price: '£120.00', serves: 'Serves 50-60' }
    ]
  },
  {
    id: 'fried-rice',
    name: 'Fried Rice',
    category: 'Rice Dishes',
    image: '/catering/friedricetray.jpeg',
    description: 'Colorful Nigerian fried rice with vegetables, chicken, turkey, beef, or fish & plantain',
    basePrice: 'From £48.00',
    sizes: [
      { size: 'Small Tray', price: '£48.00', serves: 'Serves 8-10' },
      { size: 'Medium Tray', price: '£75.00', serves: 'Serves 15-20' },
      { size: 'Large Tray', price: '£110.00', serves: 'Serves 30-40' },
      { size: 'Full Cooler', price: '£150.00', serves: 'Serves 50-60' }
    ]
  },
  
  // Soup Dishes
  {
    id: 'egusi-soup',
    name: 'Egusi Soup',
    category: 'Soup Dishes',
    image: '/food/egusi.jpeg',
    description: 'Traditional egusi soup with assorted meat, served with pounded yam, fufu, or eba',
    basePrice: 'From £85.00',
    sizes: [
      { size: 'Family Tub', price: '£85.00', serves: 'Serves 8-10' },
      { size: 'Large Tub', price: '£130.00', serves: 'Serves 15-20' },
      { size: 'Extra Large', price: '£180.00', serves: 'Serves 25-30' }
    ]
  },
  {
    id: 'efo-riro',
    name: 'Efo Riro',
    category: 'Soup Dishes',
    image: '/food/efo.jpeg',
    description: 'Rich spinach stew cooked with assorted meats and spices',
    basePrice: 'From £85.00',
    sizes: [
      { size: 'Family Tub', price: '£85.00', serves: 'Serves 8-10' },
      { size: 'Large Tub', price: '£130.00', serves: 'Serves 15-20' },
      { size: 'Extra Large', price: '£180.00', serves: 'Serves 25-30' }
    ]
  },
  {
    id: 'ayamase',
    name: 'Ayamase (Designer Stew)',
    category: 'Soup Dishes',
    image: '/catering/ayamashetray.jpeg',
    description: 'Traditional green pepper sauce with assorted meats',
    basePrice: 'From £86.00',
    sizes: [
      { size: 'Family Tub', price: '£86.00', serves: 'Serves 8-10' },
      { size: 'Large Tub', price: '£135.00', serves: 'Serves 15-20' },
      { size: 'Extra Large', price: '£185.00', serves: 'Serves 25-30' }
    ]
  },
  
  // Meat Dishes
  {
    id: 'chicken-pulvera',
    name: 'Chicken (Pulvera)',
    category: 'Meat Dishes',
    image: '/food/jollof.jpeg',
    description: 'Succulent grilled chicken, perfectly seasoned',
    basePrice: 'From £60.00',
    sizes: [
      { size: 'Small', price: '£60.00', serves: '10-12 pieces' },
      { size: 'Medium', price: '£95.00', serves: '20-24 pieces' },
      { size: 'Large', price: '£140.00', serves: '30-36 pieces' }
    ]
  },
  {
    id: 'drumsticks',
    name: 'Drumsticks',
    category: 'Meat Dishes',
    image: '/food/jollof.jpeg',
    description: 'Marinated chicken drumsticks, grilled to perfection',
    basePrice: 'From £60.00',
    sizes: [
      { size: 'Small', price: '£60.00', serves: '10-12 pieces' },
      { size: 'Medium', price: '£95.00', serves: '20-24 pieces' },
      { size: 'Large', price: '£140.00', serves: '30-36 pieces' }
    ]
  },
  {
    id: 'assorted-meat',
    name: 'Assorted Meat in Stew',
    category: 'Meat Dishes',
    image: '/food/jollof.jpeg',
    description: 'Beef and chicken garnished in rich stew',
    basePrice: 'From £95.00',
    sizes: [
      { size: 'Small', price: '£95.00', serves: 'Serves 8-10' },
      { size: 'Medium', price: '£150.00', serves: 'Serves 15-20' },
      { size: 'Large', price: '£220.00', serves: 'Serves 30-40' }
    ]
  },
  
  // Fish Dishes
  {
    id: 'fried-hake',
    name: 'Fried Hake Fish',
    category: 'Fish Dishes',
    image: '/food/yamfish.jpeg',
    description: 'Crispy fried hake fish, perfectly seasoned',
    basePrice: 'From £90.00',
    sizes: [
      { size: 'Small', price: '£90.00', serves: '6-8 pieces' },
      { size: 'Medium', price: '£140.00', serves: '12-15 pieces' },
      { size: 'Large', price: '£200.00', serves: '20-25 pieces' }
    ]
  },
  {
    id: 'grilled-fish',
    name: 'Grilled Fish with Yam & Plantain',
    category: 'Fish Dishes',
    image: '/food/yamfish.jpeg',
    description: 'Freshly grilled fish served with yam and plantain',
    basePrice: 'From £90.00',
    sizes: [
      { size: 'Small', price: '£90.00', serves: 'Serves 6-8' },
      { size: 'Medium', price: '£140.00', serves: 'Serves 12-15' },
      { size: 'Large', price: '£200.00', serves: 'Serves 20-25' }
    ]
  },
  
  // Yam Dishes
  {
    id: 'yam-porridge',
    name: 'Yam Porridge (Asaro)',
    category: 'Yam Dishes',
    image: '/food/yamporridge.jpeg',
    description: 'Savory yam porridge cooked with palm oil and spices',
    basePrice: 'From £48.33',
    sizes: [
      { size: 'Small Tray', price: '£48.33', serves: 'Serves 8-10' },
      { size: 'Medium Tray', price: '£75.00', serves: 'Serves 15-20' },
      { size: 'Large Tray', price: '£110.00', serves: 'Serves 30-40' }
    ]
  },
  
  // Beans Dishes
  {
    id: 'moimoi',
    name: 'Moi Moi',
    category: 'Beans Dishes',
    image: '/food/jollof.jpeg',
    description: 'Steamed bean pudding, rich and flavorful',
    basePrice: 'From £20.00',
    sizes: [
      { size: 'Plastic (Small)', price: '£20.00', serves: '10 pieces' },
      { size: 'Leaf (Medium)', price: '£36.67', serves: '15 pieces' },
      { size: 'Large', price: '£55.00', serves: '25 pieces' }
    ]
  },
  
  // Swallow Dishes
  {
    id: 'abula',
    name: 'Abula (Amala, Ewedu & Gbegiri)',
    category: 'Swallow Dishes',
    image: '/food/abula.jpeg',
    description: 'Classic Yoruba combo with amala, ewedu and gbegiri soup',
    basePrice: 'From £85.00',
    sizes: [
      { size: 'Family Pack', price: '£85.00', serves: 'Serves 8-10' },
      { size: 'Large Pack', price: '£130.00', serves: 'Serves 15-20' },
      { size: 'Extra Large', price: '£180.00', serves: 'Serves 25-30' }
    ]
  },
  
  // Pastries
  {
    id: 'meat-pie-small',
    name: 'Small Meat Pie',
    category: 'Pastries',
    image: '/food/jollof.jpeg',
    description: 'Flaky pastry filled with seasoned meat',
    basePrice: '£32.00',
    sizes: [
      { size: 'Dozen', price: '£32.00', serves: '12 pieces' },
      { size: 'Two Dozen', price: '£60.00', serves: '24 pieces' },
      { size: 'Three Dozen', price: '£85.00', serves: '36 pieces' }
    ]
  },
  {
    id: 'meat-pie-big',
    name: 'Big Meat Pie',
    category: 'Pastries',
    image: '/food/jollof.jpeg',
    description: 'Large flaky pastry filled with seasoned meat',
    basePrice: '£32.00',
    sizes: [
      { size: 'Dozen', price: '£32.00', serves: '12 pieces' },
      { size: 'Two Dozen', price: '£60.00', serves: '24 pieces' },
      { size: 'Three Dozen', price: '£85.00', serves: '36 pieces' }
    ]
  },
  {
    id: 'puff-puff',
    name: 'Puff Puff',
    category: 'Pastries',
    image: '/food/jollof.jpeg',
    description: 'Sweet Nigerian doughnuts, freshly fried',
    basePrice: 'From £50.00',
    sizes: [
      { size: 'Small', price: '£50.00', serves: '20 pieces' },
      { size: 'Medium', price: '£85.00', serves: '40 pieces' },
      { size: 'Large', price: '£120.00', serves: '60 pieces' }
    ]
  }
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
  'Pastries'
];

