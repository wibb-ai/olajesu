import * as migration_20261124_232938_initial from './20261124_232938_initial';
import * as migration_20261126_182438_menu_and_roles from './20261126_182438_menu_and_roles';
import * as migration_20261126_190032_orders from './20261126_190032_orders';
import * as migration_20261126_192934_kitchen_emails from './20261126_192934_kitchen_emails';
import * as migration_20261126_200802_accounts from './20261126_200802_accounts';

export const migrations = [
  {
    up: migration_20261124_232938_initial.up,
    down: migration_20261124_232938_initial.down,
    name: '20261124_232938_initial',
  },
  {
    up: migration_20261126_182438_menu_and_roles.up,
    down: migration_20261126_182438_menu_and_roles.down,
    name: '20261126_182438_menu_and_roles',
  },
  {
    up: migration_20261126_190032_orders.up,
    down: migration_20261126_190032_orders.down,
    name: '20261126_190032_orders',
  },
  {
    up: migration_20261126_192934_kitchen_emails.up,
    down: migration_20261126_192934_kitchen_emails.down,
    name: '20261126_192934_kitchen_emails',
  },
  {
    up: migration_20261126_200802_accounts.up,
    down: migration_20261126_200802_accounts.down,
    name: '20261126_200802_accounts'
  },
];
