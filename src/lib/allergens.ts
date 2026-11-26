/** The 14 allergens UK law requires us to declare. Shared by the dashboard and the shop. */
export const ALLERGENS = [
  { label: 'Celery', value: 'celery' },
  { label: 'Cereals containing gluten', value: 'gluten' },
  { label: 'Crustaceans', value: 'crustaceans' },
  { label: 'Eggs', value: 'eggs' },
  { label: 'Fish', value: 'fish' },
  { label: 'Lupin', value: 'lupin' },
  { label: 'Milk', value: 'milk' },
  { label: 'Molluscs', value: 'molluscs' },
  { label: 'Mustard', value: 'mustard' },
  { label: 'Tree nuts', value: 'tree-nuts' },
  { label: 'Peanuts', value: 'peanuts' },
  { label: 'Sesame', value: 'sesame' },
  { label: 'Soya', value: 'soya' },
  { label: 'Sulphur dioxide and sulphites', value: 'sulphites' },
] as const;

export type Allergen = (typeof ALLERGENS)[number]['value'];

export const allergenLabel = (value: string) => ALLERGENS.find(a => a.value === value)?.label ?? value;
