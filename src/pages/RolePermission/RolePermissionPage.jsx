import React, { useEffect, useState, useContext, useMemo } from "react";

import ThemeContext from "../../components/layout/ThemeContext";
import api from "../../hooks/api";
import { useToast } from "../../components/ui/toast";
import { menuItems } from "../../components/layout/SidebarLink";
import { flattenMenuItems } from "../../utils/flattenPermissionItems";
import { buildPermissionsFromMenu } from "../../utils/permissionModuleHelper";
import { AuthContext } from "../../contexts/AuthContext";

import { FiShield, FiSearch, FiSave, FiEdit2, FiTrash2 } from "react-icons/fi";

const ACTIONS = ["view", "create", "update", "delete"];

const RolePermissionPage = () => {
  const { hasPermission, user } = useContext(AuthContext);
  const canUpdate = hasPermission("role permission", "update");
  const canDelete = hasPermission("role permission", "delete");

  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [existing, setExisting] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [permissions, setPermissions] = useState(
    buildPermissionsFromMenu(menuItems),
  );

  const [permissionId, setPermissionId] = useState(null);
  const [loadingPermission, setLoadingPermission] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState("");
  const isSuperAdmin = user?.role?.name === "Super Admin";

  const modules = useMemo(() => {
    const allModules = flattenMenuItems(menuItems);

    // Super Admin can see everything
    if (isSuperAdmin) {
      return allModules;
    }

    // Other roles only see modules they have at least one permission for
    return allModules.filter((module) => {
      const permission = user?.permissions?.[module.permissionKey];

      return (
        permission &&
        (permission.view ||
          permission.create ||
          permission.read ||
          permission.update ||
          permission.delete)
      );
    });
  }, [user, isSuperAdmin]);

  // console.log(user);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/role");
      setRoles(res.data.data || []);
    } catch {
      error("Failed to load roles");
    }
  };

  const filteredRoles = useMemo(() => {
    // Super Admin sees every role
    if (user?.role?.name === "Super Admin") {
      return roles;
    }

    // Users with a department only see department roles
    if (user?.department) {
      return roles.filter((role) =>
        role.name.toLowerCase().includes("department"),
      );
    }

    // Other users
    return roles;
  }, [roles, user]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/department");
      setDepartments(res.data || []);
    } catch {
      error("Failed to load departments");
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/role-permission");
      setExisting(res.data.data || []);
    } catch {
      error("Failed to load permissions");
    }
  };

  const filteredExisting = useMemo(() => {
    if (user?.role?.name === "Super Admin") {
      return existing;
    }

    return existing.filter(
      (item) => item.department?.id === user.department.id,
    );
  }, [existing, user]);

  const fetchSinglePermission = async (roleId, departmentId) => {
    if (!roleId) return;
    setLoadingPermission(true);
    try {
      const res = await api.get("/role-permission", {
        params: { roleId, departmentId },
      });
      const data = res.data.data?.[0];
      if (data) {
        setPermissions(data.permissions || {});
        setPermissionId(data.id);
      } else {
        setPermissions(buildPermissionsFromMenu(menuItems));
        setPermissionId(null);
      }
    } catch {
      error("Failed to load permission set");
    } finally {
      setLoadingPermission(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(String(user.role.id));
    }
  }, [user]);

  useEffect(() => {
    if (user?.department) {
      setSelectedDepartment(String(user.department.id));
    }
  }, [user]);

  useEffect(() => {
    if (selectedRole) {
      fetchSinglePermission(selectedRole, selectedDepartment || null);
    }
  }, [selectedRole, selectedDepartment]);

  const togglePermission = (module, action) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev?.[module]?.[action],
      },
    }));
  };

  const toggleAll = (module) => {
    const enabled = ACTIONS.every((action) => permissions?.[module]?.[action]);
    const updatedModule = {};
    ACTIONS.forEach((a) => {
      updatedModule[a] = !enabled;
    });
    setPermissions((prev) => ({ ...prev, [module]: updatedModule }));
  };

  const loadRow = (item) => {
    setSelectedRole(String(item.role?.id || ""));
    setSelectedDepartment(String(item.department?.id || ""));
    setPermissions(item.permissions || {});
    setPermissionId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this permission record?")) return;
    try {
      await api.delete(`/role-permission/${id}`);
      success("Permission deleted");
      if (permissionId === id) {
        setPermissionId(null);
        setPermissions(buildPermissionsFromMenu(menuItems));
        setSelectedRole("");
        setSelectedDepartment("");
      }
      fetchPermissions();
    } catch {
      error("Failed to delete permission");
    }
  };
  const isOwnRolePermission =
    permissionId && selectedRole === String(user?.role?.id);

  const canSavePermission = isSuperAdmin || !isOwnRolePermission;

  const handleSave = async () => {
    if (!canSavePermission) {
      return error("Only Super Admin can update this role's permissions.");
    }
    if (!selectedRole) return error("Please select a role");
    setIsSaving(true);
    try {
      if (permissionId) {
        await api.put(`/role-permission/${permissionId}`, {
          roleId: selectedRole,
          departmentId: selectedDepartment || null,
          permissions,
        });
        success("Permissions updated successfully");
      } else {
        await api.post("/role-permission", {
          roleId: selectedRole,
          departmentId: selectedDepartment || null,
          permissions,
        });
        success("Permissions created successfully");
      }
      fetchPermissions();
    } catch {
      error("Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredModules = modules.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  const isDark = currentTheme === "dark";
  const cardBg = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const text = isDark ? "text-white" : "text-gray-900";
  const subText = "text-gray-500";
  const inputCls = isDark
    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
    : "bg-white text-gray-900 border-gray-300";
  const theadCls = isDark
    ? "bg-gray-700 text-gray-300"
    : "bg-gray-50 text-gray-600";
  const rowCls = isDark
    ? "border-gray-700 hover:bg-gray-700/50"
    : "border-gray-100 hover:bg-gray-50";

  // Summary helpers for the table
  const countActiveModules = (perms) =>
    Object.values(perms || {}).filter((actions) =>
      Object.values(actions).some(Boolean),
    ).length;

  const countActiveActions = (perms) =>
    Object.values(perms || {}).reduce(
      (sum, actions) => sum + Object.values(actions).filter(Boolean).length,
      0,
    );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <h1 className={`text-2xl font-bold ${text}`}>
          Role Permission Management
        </h1>
        <p className={`${subText} mt-1`}>
          Configure access for roles &amp; departments
        </p>
      </div>

      {/* BUILDER */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        {/* ROLE + DEPARTMENT */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`border rounded-lg p-3 ${inputCls}`}
          >
            <option value="">Select Role</option>
            {filteredRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={`border rounded-lg p-3 ${inputCls}`}
            disabled={!!user?.department}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH */}
        <div className="relative mb-5">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className={`w-full border rounded-lg pl-10 pr-4 py-3 ${inputCls}`}
          />
        </div>

        {/* MATRIX */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className={theadCls}>
              <tr>
                <th className="text-left p-3 font-semibold">Module</th>
                {ACTIONS.map((a) => (
                  <th
                    key={a}
                    className="text-center p-3 capitalize font-semibold"
                  >
                    {a}
                  </th>
                ))}
                <th className="text-center p-3 font-semibold">All</th>
              </tr>
            </thead>

            <tbody>
              {!selectedRole ? (
                <tr>
                  <td
                    colSpan={ACTIONS.length + 2}
                    className="p-8 text-center text-gray-400"
                  >
                    Select a role above to configure permissions
                  </td>
                </tr>
              ) : loadingPermission ? (
                <tr>
                  <td
                    colSpan={ACTIONS.length + 2}
                    className="p-4 text-center text-gray-500"
                  >
                    Loading permissions...
                  </td>
                </tr>
              ) : (
                filteredModules.map((module) => {
                  const key = module.permissionKey;
                  const allOn = ACTIONS.every((a) => permissions?.[key]?.[a]);

                  return (
                    <tr key={key} className={`border-t ${rowCls}`}>
                      <td className={`p-3 font-medium ${text}`}>
                        {module.label}
                      </td>

                      {ACTIONS.map((action) => (
                        <td key={action} className="text-center p-3">
                          <input
                            type="checkbox"
                            checked={permissions?.[key]?.[action] || false}
                            onChange={() => togglePermission(key, action)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                      ))}

                      <td className="text-center p-3">
                        <button
                          onClick={() => toggleAll(key)}
                          className={`text-xs px-2 py-1 rounded ${
                            allOn
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {allOn ? "None" : "All"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={isSaving || !selectedRole || !canSavePermission}
          className={`${theme.primary} text-white mt-5 px-5 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          title={
            !canSavePermission
              ? "Only Super Admin can update this role's permissions."
              : ""
          }
        >
          <FiSave />
          {isSaving
            ? "Saving..."
            : permissionId
              ? "Update Permissions"
              : "Save Permissions"}
        </button>
      </div>

      {/* ASSIGNED PERMISSIONS — Table */}
      <div className={`${cardBg} border rounded-xl p-6`}>
        <div className="flex items-center gap-2 mb-5">
          <FiShield className="text-blue-500" size={20} />
          <h2 className={`text-xl font-bold ${text}`}>Assigned Permissions</h2>
          <span className="ml-auto text-sm text-gray-400">
            {existing.length} record{existing.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className={theadCls}>
              <tr>
                <th className="text-left p-3 font-semibold w-8">#</th>
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-left p-3 font-semibold">Department</th>
                <th className="text-center p-3 font-semibold">
                  Modules Active
                </th>
                <th className="text-center p-3 font-semibold">
                  Permissions Granted
                </th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {existing.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No permissions assigned yet
                  </td>
                </tr>
              ) : (
                filteredExisting.map((item, index) => {
                  const activeModules = countActiveModules(item.permissions);
                  const totalModules = Object.keys(
                    item.permissions || {},
                  ).length;
                  const activeActions = countActiveActions(item.permissions);
                  const totalActions = totalModules * ACTIONS.length;

                  // const isSuperAdmin = user?.role?.name === "Super Admin";

                  const isOwnRole = item.role?.id === user?.role?.id;

                  const canManage = isSuperAdmin || !isOwnRole;

                  return (
                    <tr key={item.id} className={`border-t ${rowCls}`}>
                      <td className={`p-3 ${subText}`}>{index + 1}</td>

                      <td className="p-3">
                        <span className={`font-medium ${text}`}>
                          {item.role?.name}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`${subText}`}>
                          {item.department?.name || "All Departments"}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            activeModules === totalModules
                              ? "bg-green-100 text-green-700"
                              : activeModules === 0
                                ? "bg-gray-100 text-gray-500"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {activeModules} / {totalModules}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            activeActions === totalActions
                              ? "bg-green-100 text-green-700"
                              : activeActions === 0
                                ? "bg-gray-100 text-gray-500"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {activeActions} / {totalActions}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-3">
                          {canUpdate && (
                            <button
                              onClick={() => canManage && loadRow(item)}
                              disabled={!canManage}
                              className={`p-1 rounded ${
                                canManage
                                  ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                  : "text-gray-300 cursor-not-allowed"
                              }`}
                              title={
                                canManage
                                  ? "Load into editor"
                                  : "You cannot edit your own role"
                              }
                            >
                              <FiEdit2 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionPage;
