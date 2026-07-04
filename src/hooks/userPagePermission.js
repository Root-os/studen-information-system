import { useContext, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext";

const usePagePermission = (module) => {
  const { hasPermission } = useContext(AuthContext);

  return useMemo(() => ({
    canView: hasPermission(module, "view"),
    canCreate: hasPermission(module, "create"),
    canUpdate: hasPermission(module, "update"),
    canDelete: hasPermission(module, "delete"),
  }), [hasPermission, module]);
};

export default usePagePermission;