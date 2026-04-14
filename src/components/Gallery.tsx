import OrderingButtons from './OrderingButtons';

export default function Gallery() {
  const dishes = [
    {
      name: 'Jollof Rice, Chicken/Turkey/Beef/Fish & Plantain',
      image: '/food/jollof.jpeg',
      description: 'Our signature jollof rice with perfectly seasoned grilled chicken',
      callInPrice: 'from £15.00'
    },
    {
      name: 'Fried Rice, Chicken/Turkey/Beef/Fish & Plantain',
      image: '/food/friedrice.jpeg',
      description: 'Colorful Nigerian fried rice with vegetables and proteins',
      callInPrice: 'from £15.00'
    },
    {
      name: 'Grilled Fish with Yam & Plantain',
      image: '/food/yamfish.jpeg',
      description: 'Freshly grilled fish served with yam and vegetables',
      callInPrice: 'from £20.00'
    },
    {
      name: 'Egusi Soup & Pounded Yam',
      image: '/food/egusi.jpeg',
      description: 'Traditional egusi soup served with smooth pounded yam',
      callInPrice: 'from £15.00'
    },
    {
      name: 'Abula (Amala, Ewedu & Gbegiri)',
      image: '/food/abula.jpeg',
      description: 'Classic Yoruba combo with amala, ewedu and gbegiri soup',
      callInPrice: 'from £15.00'
    },
    {
      name: 'Efo Riro with Assorted Meat',
      image: '/food/efo.jpeg',
      description: 'Rich spinach stew cooked with assorted meats and spices',
      callInPrice: 'from £15.00'
    },
    {
      name: 'Peppered Gizzard',
      image: '/food/gizzard.jpeg',
      description: 'Spicy grilled gizzards in a flavorful pepper sauce',
      callInPrice: 'from £10.00'
    },
    {
      name: 'Ayamase (Designer Stew)',
      image: '/food/ayamashe.jpeg',
      description: 'Traditional green pepper sauce with assorted meats',
      callInPrice: 'from £10.00'
    },
    {
      name: 'Yam Porridge (Asaro)',
      image: '/food/yamporridge.jpeg',
      description: 'Savory yam porridge cooked with palm oil and spices',
      callInPrice: 'from £10.00'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-brand-dark mb-4">Our Dishes & Takeaway Menu</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
          <p className="text-xl text-brand-green max-w-3xl mx-auto">
            Our takeaway menu, available to order via Uber Eats or by calling us directly. Call-in prices are lower, and we offer free delivery from £30 within our delivery area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-t-2xl">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-dark mb-2">{dish.name}</h3>
                <p className="text-brand-green text-sm leading-relaxed mb-3">{dish.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-brand-dark">{dish.callInPrice} (call-in)</span>
                  <span className="text-[11px] uppercase tracking-wide text-brand-green/70">
                    Uber Eats pricing may be higher
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-6">
          <p className="text-brand-green text-lg">
            All dishes are prepared fresh using authentic Nigerian ingredients and traditional cooking methods. Free
            delivery on call-in takeaway orders from £30 within our delivery area.
          </p>
          <div className="pt-4">
            <p className="text-brand-dark font-semibold mb-4">Ready to order?</p>
            <OrderingButtons variant="compact" />
          </div>
        </div>
      </div>
    </section>
  );
}
