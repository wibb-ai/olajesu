import { postgresAdapter } from '@payloadcms/db-postgres';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { ActivityLog } from './collections/ActivityLog';
import { AddOns } from './collections/AddOns';
import { Customers } from './collections/Customers';
import { LoginTokens } from './collections/LoginTokens';
import { Meals } from './collections/Meals';
import { Orders } from './collections/Orders';
import { Users } from './collections/Users';
import { KitchenSettings } from './globals/KitchenSettings';
import { PackSettings } from './globals/PackSettings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (process.env.NODE_ENV === 'production' && !process.env.PAYLOAD_SECRET) {
  console.error('payload: PAYLOAD_SECRET is not set; admin sign-in will not work');
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    // Built-in avatar: Gravatar would send a hash of each staff email to a third party.
    avatar: 'default',
    meta: { titleSuffix: ' · OlaJesu Admin' },
    components: { beforeDashboard: ['/components/admin/KitchenLink'] },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Orders, Customers, Meals, AddOns, Users, ActivityLog, LoginTokens],
  globals: [PackSettings, KitchenSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // Serverless functions each hold their own pool; keep it small.
      max: 5,
    },
    // Local dev pushes schema changes straight to the dev database. Deployed
    // databases change only through committed migrations, which run before each
    // Vercel build (the "ci" script in package.json).
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
});
