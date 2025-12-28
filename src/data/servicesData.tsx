import { Calendar, Users, Utensils, Clock, ShoppingBag, CheckCircle2, Star } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ServiceFeature {
  icon: LucideIcon;
  text: string;
}

export interface Service {
  id: string;
  title: string;
  icon: LucideIcon;
  shortDescription: string;
  detailedDescription: string;
  features: ServiceFeature[];
  highlights: string[];
  additionalInfo: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
}

export const services: Service[] = [
  {
    id: 'meal-prep',
    title: 'Meal Prep Service',
    icon: Utensils,
    shortDescription:
      'Enjoy the convenience of healthy, authentic Nigerian meals in larger portions. Perfect for busy professionals and families who want nutritious, flavorful food prepped in bulk.',
    detailedDescription:
      'Our Meal Prep Service is designed for busy professionals and families who value nutritious, authentic Nigerian cuisine but lack the time for extensive meal preparation. We prepare larger portions of your favourite dishes – from single trays to half coolers and family-size soups – so you can portion and enjoy them throughout the week. Each batch is carefully crafted using traditional recipes and fresh ingredients, maintaining the authentic flavors you love while meeting modern nutritional standards.',
    features: [
      { icon: Clock, text: 'Time-saving weekly meal preparation' },
      { icon: Utensils, text: 'Portion-controlled, nutritionally balanced meals' },
      { icon: Calendar, text: 'Flexible scheduling and menu options' },
      { icon: CheckCircle2, text: 'Fresh, high-quality ingredients' },
      { icon: Star, text: 'Customizable dietary preferences' },
      { icon: CheckCircle2, text: 'Professional packaging and delivery' }
    ],
    highlights: [
      'Jollof Rice',
      'Egusi Soup',
      'Pepper Soup',
      'Moi Moi',
      'Fried Rice',
      'Efo Riro',
      'Ayamase Stew',
      'Ofada Rice'
    ],
    additionalInfo: 'All meals are prepared in our certified kitchen and delivered in eco-friendly, microwave-safe containers. Perfect for individuals, couples, or families looking to maintain a healthy diet while enjoying authentic Nigerian flavors.',
    gradientFrom: 'from-brand-gold',
    gradientTo: 'to-brand-gold/80',
    iconColor: 'text-brand-dark'
  },
  {
    id: 'catering',
    title: 'Catering Service',
    icon: Users,
    shortDescription: 'Make your event unforgettable with our premium catering service. From intimate gatherings to large celebrations, we bring the authentic taste of Nigeria to your special occasions.',
    detailedDescription: 'Transform your special occasions into memorable culinary experiences with our professional catering service. Whether you\'re hosting an intimate dinner party, a corporate event, or a grand wedding celebration, we provide authentic Nigerian cuisine that impresses guests and honors traditions. Our experienced team handles everything from menu planning to setup and service, ensuring your event runs smoothly while you focus on your guests.',
    features: [
      { icon: Users, text: 'Corporate events and private parties' },
      { icon: Calendar, text: 'Weddings and cultural celebrations' },
      { icon: Utensils, text: 'Customizable menus to suit your needs' },
      { icon: Star, text: 'Professional service staff available' },
      { icon: CheckCircle2, text: 'Full equipment and setup included' },
      { icon: CheckCircle2, text: 'Dietary accommodations and special requests' }
    ],
    highlights: [
      'Weddings',
      'Corporate Functions',
      'Birthday Parties',
      'Cultural Events',
      'Anniversary Celebrations',
      'Naming Ceremonies',
      'Graduation Parties',
      'Holiday Gatherings'
    ],
    additionalInfo: 'We cater events of all sizes, from intimate gatherings of 20 guests to large celebrations of 500+. Our team works closely with you to create a customized menu that reflects your taste and budget, with options for buffet-style or plated service.',
    gradientFrom: 'from-brand-green',
    gradientTo: 'to-brand-dark',
    iconColor: 'text-brand-gold'
  },
  {
    id: 'takeaway',
    title: 'Takeaway Service',
    icon: ShoppingBag,
    shortDescription:
      'Order your favourite Nigerian dishes for collection or delivery. Call us directly for lower prices and free delivery from £30, or use Uber Eats for added convenience.',
    detailedDescription:
      "Craving authentic Nigerian food? Our Takeaway Service brings restaurant-quality meals directly to your door. You can order via Uber Eats for maximum convenience, or call us directly to place your order at lower call-in prices. For call-in takeaway within our delivery area, we offer free delivery on orders from £30. Whether you're at home, at work, or on the go, enjoy the same high-quality dishes served in our kitchen, prepared fresh to order.",
    features: [
      { icon: ShoppingBag, text: 'Order through Uber Eats and Just Eat' },
      { icon: Clock, text: 'Fast preparation and delivery' },
      { icon: Utensils, text: 'Full menu available for takeaway' },
      { icon: Star, text: 'Special meal deals and combos' },
      { icon: CheckCircle2, text: 'Contactless delivery options' },
      { icon: CheckCircle2, text: 'Easy online ordering and payment' }
    ],
    highlights: [
      'Uber Eats',
      'Call-in Orders',
      'Individual Portions',
      'Family Packs',
      'Lunch Specials',
      'Weekend Deals',
      'Party Trays',
      'Combo Meals'
    ],
    additionalInfo:
      'All takeaway orders are carefully packaged to maintain temperature and freshness during delivery. Call-in orders are priced lower than on Uber Eats, and within our delivery area we offer free delivery from £30. We also provide contactless delivery and accept various payment methods for your convenience.',
    gradientFrom: 'from-brand-dark',
    gradientTo: 'to-brand-green',
    iconColor: 'text-brand-gold'
  }
];
