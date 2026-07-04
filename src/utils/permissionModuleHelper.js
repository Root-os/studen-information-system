export const buildPermissionsFromMenu = (menuItems) => {
  const permissions = {};

  const traverse = (items) => {
    items.forEach((item) => {
      if (item.permissionKey && !permissions[item.permissionKey]) {
        permissions[item.permissionKey] = {
          view: false,
          create: false,
          read: false,
          update: false,
          delete: false,
        };
      }
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };

  traverse(menuItems);
  return permissions;
};
