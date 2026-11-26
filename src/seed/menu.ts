/**
 * Seeds the launch menu decided in the menu ticket (.scratch/meal-prep/issues/04-meal-prep-menu.md).
 * Safe to run more than once: anything that already exists (by name) is left alone.
 *
 *   npm run seed
 *
 * Everything starts as "Not on the menu": the kitchen must record ingredients, allergens and the
 * Allergen check for each Meal and Add-on before it can be made available.
 */
import { getPayload } from 'payload';

import config from '../payload.config';

const ADD_ONS = [
  { name: 'Eba', price: 3 },
  { name: 'Amala', price: 3 },
  { name: 'Semo', price: 3 },
  { name: 'Pounded Yam', price: 3.5 },
  { name: 'Plantain', price: 3 },
  { name: 'Moi Moi', price: 2.5 },
  { name: 'Extra protein', price: 4 },
  { name: 'Puff Puff (6 pieces)', price: 3 },
];

const SWALLOWS = ['Eba', 'Amala', 'Semo', 'Pounded Yam'];
const FOR_ALL = ['Plantain', 'Extra protein', 'Puff Puff (6 pieces)'];

const PROTEIN_OPTIONS = [
  { name: 'No protein', price: 6 },
  { name: 'Chicken', price: 10 },
  { name: 'Beef', price: 12 },
  { name: 'Turkey', price: 15 },
];

type SeedMeal = {
  name: string;
  category: 'rice' | 'soups-stews';
  description: string;
  price?: number;
  options?: typeof PROTEIN_OPTIONS;
  spice: 'none' | 'mild' | 'medium' | 'hot';
};

const MEALS: SeedMeal[] = [
  { name: 'Jollof Rice', category: 'rice', options: PROTEIN_OPTIONS, spice: 'medium', description: 'Smoky party-style jollof, cooked slowly in a rich tomato and pepper base.' },
  { name: 'Fried Rice', category: 'rice', options: PROTEIN_OPTIONS, spice: 'mild', description: 'Nigerian fried rice with mixed vegetables and a fragrant curry and thyme seasoning.' },
  { name: 'Egusi Soup', category: 'soups-stews', price: 13, spice: 'medium', description: 'Ground melon seed soup with leafy greens, assorted meat and fish.' },
  { name: 'Efo Riro', category: 'soups-stews', price: 15, spice: 'medium', description: 'Rich spinach stew in a pepper and palm oil base, with assorted meat and fish.' },
  { name: 'Okra Stew', category: 'soups-stews', price: 13, spice: 'medium', description: 'Fresh okra cooked in a seasoned stew with assorted meat and fish.' },
  { name: 'Bitter Leaf Soup', category: 'soups-stews', price: 13, spice: 'medium', description: 'Traditional bitter leaf soup with cocoyam, assorted meat and fish.' },
  { name: 'Ayamase', category: 'soups-stews', price: 13, spice: 'hot', description: 'Green pepper designer stew with locust beans and assorted meat.' },
  { name: 'Assorted Meat Stew', category: 'soups-stews', price: 12, spice: 'medium', description: 'Classic Nigerian tomato and pepper stew with assorted meat.' },
];

const STORAGE = 'Keep refrigerated at 5°C or below. Eat by the use-by date on the label.';
const REHEATING = 'Remove the lid and microwave until piping hot all the way through, stirring halfway. Do not reheat more than once.';

async function seed() {
  const payload = await getPayload({ config });
  const addOnIds = new Map<string, number>();

  for (const [i, addOn] of ADD_ONS.entries()) {
    const found = await payload.find({ collection: 'add-ons', where: { name: { equals: addOn.name } }, limit: 1 });
    const doc = found.docs[0] ?? (await payload.create({ collection: 'add-ons', data: { ...addOn, status: 'hidden', sortOrder: i + 1 } }));
    addOnIds.set(addOn.name, doc.id);
    payload.logger.info(`${found.docs[0] ? 'kept' : 'added'} Add-on: ${addOn.name}`);
  }

  for (const [i, meal] of MEALS.entries()) {
    const found = await payload.find({ collection: 'meals', where: { name: { equals: meal.name } }, limit: 1 });
    if (found.docs[0]) {
      payload.logger.info(`kept Meal: ${meal.name}`);
      continue;
    }
    const offered = [...(meal.category === 'rice' ? ['Moi Moi'] : SWALLOWS), ...FOR_ALL].map(n => addOnIds.get(n)!);
    await payload.create({
      collection: 'meals',
      data: {
        ...meal,
        addOns: offered,
        portionGrams: 500,
        shelfLifeDays: 2,
        storage: STORAGE,
        reheating: REHEATING,
        status: 'hidden',
        sortOrder: i + 1,
      },
    });
    payload.logger.info(`added Meal: ${meal.name}`);
  }

  const packs = await payload.findGlobal({ slug: 'pack-settings' });
  if (!packs.packs?.length) {
    await payload.updateGlobal({
      slug: 'pack-settings',
      data: { packs: [{ size: 5, discountPercent: 10 }, { size: 10, discountPercent: 15 }] },
    });
    payload.logger.info('added Packs: 5 Meals 10% off, 10 Meals 15% off');
  }
}

await seed();
process.exit(0);
