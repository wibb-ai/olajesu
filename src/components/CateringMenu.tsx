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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-brand-dark mb-4">Catering Menu</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
          <p className="text-xl text-brand-green max-w-3xl mx-auto">
            Browse our complete catering menu organized by category. All dishes are available in multiple sizes to suit your event needs.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setExpandedDish(null);
              }}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-brand-gold text-brand-dark shadow-md'
                  : 'bg-brand-cream text-brand-green hover:bg-brand-gold/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-t-2xl">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-dark mb-2">{dish.name}</h3>
                <p className="text-brand-green text-sm leading-relaxed mb-4">{dish.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-brand-dark text-lg">{dish.basePrice}</span>
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
                  
                  {expandedDish === dish.id && (
                    <div className="mt-4 pt-4 border-t border-brand-gold/30 space-y-3 animate-slide-up">
                      {dish.sizes.map((size, idx) => {
                        const inCart = isItemInCart(dish.id, size.size);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-brand-cream/50 rounded-lg"
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-green text-lg">No dishes found in this category.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-brand-green text-lg">
            All dishes are prepared fresh using authentic Nigerian ingredients. Minimum order lead time: 48 hours. 
            Contact us to discuss custom quantities or special dietary requirements.
          </p>
        </div>
      </div>
    </section>
  );
}

