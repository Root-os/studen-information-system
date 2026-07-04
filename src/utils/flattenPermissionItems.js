export const flattenMenuItems = (items) => {
  const seen = new Set();
  const result = [];

  const traverse = (items) => {
    items.forEach((item) => {
      if (item.permissionKey && !seen.has(item.permissionKey)) {
        seen.add(item.permissionKey);
        result.push({
          label: item.label,
          permissionKey: item.permissionKey,
        });
      }
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };

  traverse(items);
  return result;
};
