/**
 * Whether the meal-prep shop replaces catering on the homepage.
 *
 * The site switches only when ordering goes live (site-restructure ticket). Until then
 * production keeps catering at "/", while local dev and preview deployments show the shop.
 * At launch, set SHOP_ENABLED=true in Vercel for Production.
 */
export const shopEnabled = () => process.env.SHOP_ENABLED === 'true' || process.env.VERCEL_ENV !== 'production';
