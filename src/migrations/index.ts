import * as migration_20261124_232938_initial from './20261124_232938_initial';
import * as migration_20261126_182438_menu_and_roles from './20261126_182438_menu_and_roles';

export const migrations = [
  {
    up: migration_20261124_232938_initial.up,
    down: migration_20261124_232938_initial.down,
    name: '20261124_232938_initial',
  },
  {
    up: migration_20261126_182438_menu_and_roles.up,
    down: migration_20261126_182438_menu_and_roles.down,
    name: '20261126_182438_menu_and_roles'
  },
];
