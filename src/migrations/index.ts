import * as migration_20261124_232938_initial from './20261124_232938_initial';
import * as migration_20261126_182438_menu_and_roles from './20261126_182438_menu_and_roles';
import * as migration_20261126_190032_orders from './20261126_190032_orders';
import * as migration_20261126_192934_kitchen_emails from './20261126_192934_kitchen_emails';
import * as migration_20261126_200802_accounts from './20261126_200802_accounts';
import * as migration_20261126_203700_kitchen_screens from './20261126_203700_kitchen_screens';
import * as migration_20261126_204959_remove_driver_role from './20261126_204959_remove_driver_role';
import * as migration_20261126_205906_two_step_login from './20261126_205906_two_step_login';
import * as migration_20261126_214052_refunds from './20261126_214052_refunds';
import * as migration_20261127_005924_delivery_settings from './20261127_005924_delivery_settings';

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
    name: '20261126_200802_accounts',
  },
  {
    up: migration_20261126_203700_kitchen_screens.up,
    down: migration_20261126_203700_kitchen_screens.down,
    name: '20261126_203700_kitchen_screens',
  },
  {
    up: migration_20261126_204959_remove_driver_role.up,
    down: migration_20261126_204959_remove_driver_role.down,
    name: '20261126_204959_remove_driver_role',
  },
  {
    up: migration_20261126_205906_two_step_login.up,
    down: migration_20261126_205906_two_step_login.down,
    name: '20261126_205906_two_step_login',
  },
  {
    up: migration_20261126_214052_refunds.up,
    down: migration_20261126_214052_refunds.down,
    name: '20261126_214052_refunds',
  },
  {
    up: migration_20261127_005924_delivery_settings.up,
    down: migration_20261127_005924_delivery_settings.down,
    name: '20261127_005924_delivery_settings'
  },
];
