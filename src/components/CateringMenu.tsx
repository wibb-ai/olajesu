import { useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingCart, Check } from 'lucide-react';
import { cateringMenu, categories, CateringDish } from '../data/cateringMenu';
import { useCart } from '../context/CartContext';

export default function CateringMenu() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Dishes');
  const [expandedDish, setExpandedDish] = useState<string | null>(null);
  const { addItem, items } = useCart();

  const filteredDishes = selectedCategory === 'All Dishes' 
    ? cateringMenu 
    : cateringMenu.filter(dish => dish.category === selectedCategory);

  const categoriesInView = selectedCategory === 'All Dishes'
    ? categories.filter(c => c !== 'All Dishes')
    : [selectedCategory];

  const getDishesByCategory = (category: string) => {
    return filteredDishes.filter(dish => dish.category === category);
  };

  const toggleDishOptions = (dishId: string) => {
    setExpandedDish(expandedDish === dishId ? null : dishId);
  };

  const handleAddToEnquiry = (dish: CateringDish, size: { size: string; price: string; serves?: string }) => {
    addItem({
      dishId: dish.id,
      dishName: dish.name,
      size: size.size,
      price: size.price,
      serves: size.serves,
    });
  };

  const isItemInCart = (dishId: string, size: string) => {
    return items.some((item) => item.dishId === dishId && item.size === size);
  };

  return (
    <section className="py-24 bg-brand-cream">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-6xl font-bold text-brand-dark mb-6 tracking-tight">MENU</h2>
          <div className="w-full h-px bg-brand-green/20 mb-8"></div>
        </div>

        {/* Category Tabs */}
        <div className="mb-12 flex flex-wrap justify-center gap-4 border-b border-brand-green/20 pb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setExpandedDish(null);
              }}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-200 ${
                selectedCategory === category
                  ? 'text-brand-gold border-b-2 border-brand-gold'
                  : 'text-brand-green hover:text-brand-gold'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Content */}
        <div className="space-y-16">
          {categoriesInView.map((category) => {
            const dishes = getDishesByCategory(category);
            if (dishes.length === 0) return null;

            return (
              <div key={category}>
                {/* Section Heading */}
                <h3 className="text-3xl font-bold text-brand-dark mb-8 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="w-full h-px bg-brand-green/20 mb-8"></div>

                {/* Dishes Grid - Two columns on larger screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
                  {dishes.map((dish) => (
                    <div key={dish.id} className="group">
                      {/* Dish Name */}
                      <h4 className="text-xl font-bold text-brand-dark mb-2 uppercase tracking-wide">
                        {dish.name}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-brand-green/80 leading-relaxed mb-3">
                        {dish.description}
                      </p>

                      {/* Price and Options Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-dark">
                          {dish.basePrice}
                        </span>
                        <button
                          onClick={() => toggleDishOptions(dish.id)}
                          className="flex items-center gap-1 text-brand-gold hover:text-brand-dark text-sm font-medium transition-colors"
                        >
                          {expandedDish === dish.id ? (
                            <>
                              Hide options
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Show options
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Expanded Size Options */}
                      {expandedDish === dish.id && (
                        <div className="mt-4 pt-4 border-t border-brand-gold/30 space-y-3 animate-slide-up">
                          {dish.sizes.map((size, idx) => {
                            const inCart = isItemInCart(dish.id, size.size);
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-white/60 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold text-brand-dark">{size.size}</p>
                                  {size.serves && (
                                    <p className="text-xs text-brand-green/70">{size.serves}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-brand-gold">{size.price}</span>
                                  <button
                                    onClick={() => handleAddToEnquiry(dish, size)}
                                    disabled={inCart}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                      inCart
                                        ? 'bg-brand-green text-white cursor-not-allowed'
                                        : 'bg-brand-gold hover:bg-brand-gold/90 text-brand-dark hover:shadow-md'
                                    }`}
                                  >
                                    {inCart ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        Added
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="w-3 h-3" />
                                        Add
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Divider between items */}
                      <div className="mt-6 h-px bg-brand-green/10"></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-green text-lg">No dishes found in this category.</p>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-brand-green/20 text-center">
          <p className="text-brand-green/80">
            All dishes are prepared fresh using authentic Nigerian ingredients. Minimum order lead time: 48 hours. 
            Contact us to discuss custom quantities or special dietary requirements.
          </p>
        </div>
      </div>
    </section>
  );
}
