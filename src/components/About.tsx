import { Heart, Award, Users } from 'lucide-react';
import { ScribbleUnderline, DotPattern } from './DecorativeElements';

export default function About() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <DotPattern className="absolute inset-0 text-brand-green opacity-30" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 relative">
          <h2 className="text-5xl font-bold text-brand-dark mb-4 relative inline-block">
            Our Story
            <div className="absolute -bottom-2 left-0 right-0">
              <ScribbleUnderline className="w-full h-3 text-brand-gold" />
            </div>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16 relative z-10">
          <div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold to-brand-green rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
              <img
                src="/aboutimage.jpeg"
                alt="Nigerian cuisine preparation"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover relative z-10 ring-4 ring-brand-gold/20"
              />
            </div>
          </div>
          <div className="space-y-6">
            <p className="text-lg text-brand-green leading-relaxed">
              Olajesu Kitchen brings the authentic taste of Nigeria to Manchester.
              Rooted in our rich cultural heritage, we're passionate about sharing
              the vibrant flavours of West African cuisine with our community.
            </p>
            <p className="text-lg text-brand-green leading-relaxed">
              Operating from our ghost kitchen in Manchester, we specialize in
              premium meal preparation and catering services. Every dish is crafted
              with traditional ingredients, authentic recipes, and a commitment to
              quality that reflects our Nigerian roots.
            </p>
            <p className="text-lg text-brand-green leading-relaxed">
              Whether you're looking for convenient weekly meal prep or planning
              a special event, we deliver the warmth and richness of Nigerian
              hospitality through our food.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-8 rounded-xl bg-brand-cream hover:bg-brand-cream/70 transition-all duration-300 border-2 border-brand-gold hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Heart className="w-12 h-12 text-brand-gold mx-auto mb-4 relative z-10" />
            <h3 className="text-xl font-bold text-brand-dark mb-3">Authentic Heritage</h3>
            <p className="text-brand-green">
              Traditional recipes passed down through generations, made with genuine Nigerian ingredients
            </p>
          </div>
          <div className="text-center p-8 rounded-xl bg-brand-green hover:bg-brand-green/90 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Award className="w-12 h-12 text-brand-gold mx-auto mb-4 relative z-10" />
            <h3 className="text-xl font-bold text-white mb-3">Premium Quality</h3>
            <p className="text-brand-cream">
              We source the finest ingredients and maintain the highest standards in preparation
            </p>
          </div>
          <div className="text-center p-8 rounded-xl bg-brand-cream hover:bg-brand-cream/70 transition-all duration-300 border-2 border-brand-gold hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Users className="w-12 h-12 text-brand-gold mx-auto mb-4 relative z-10" />
            <h3 className="text-xl font-bold text-brand-dark mb-3">Community Focused</h3>
            <p className="text-brand-green">
              Serving Manchester and surrounding areas with dedication and cultural pride
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
