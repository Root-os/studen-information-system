import React, { useEffect, useState, useContext, useMemo } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import api from "../../hooks/api";
import { FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";
import { AuthContext } from "../../contexts/AuthContext";
import usePagePermission from "../../hooks/userPagePermission";

const AssignUserPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();
  const { canCreate, canDelete } = usePagePermission("assign user");

  const [staffUsers, setStaffUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    staffUserId: "",
    teacherId: "",
    roleId: "",
    departmentId: "",
    isActive: true,
  });

  const fetchAll = async () => {
    try {
      const [staffRes, teacherRes, roleRes, deptRes] = await Promise.all([
        api.get("/staff"),
        api.get("/teacher"),
        api.get("/role"),
        api.get("/department"),
      ]);

      setStaffUsers(staffRes.data.data || []);
      setTeachers(teacherRes.data.data || teacherRes.data || []);
      setRoles(roleRes.data.data || []);
      setDepartments(deptRes.data.data || deptRes.data || []);
    } catch (err) {
      error("Failed to load data");
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assign-user");

      console.log("RAW ASSIGN RESPONSE:", res.data);

      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      setAssignments(data);
    } catch (err) {
      error("Failed to load assignments");
    }
  };

  useEffect(() => {
    fetchAll();
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (user?.department) {
      setFormData((prev) => ({
        ...prev,
        departmentId: String(user.department.id),
      }));
    }
  }, [user]);

  useEffect(() => {
  setFormData(prev => ({
    ...prev,
    departmentId: user?.department ? String(user.department.id) : "",
    roleId: user?.role ? String(user.role.id) : "",
  }));
}, [user]);

  const filteredAssignments = useMemo(() => {
    if (user?.role?.name === "Super Admin") {
      return assignments;
    }

    if (user?.department) {
      return assignments.filter(
        (item) => item.Department?.id === user.department.id,
      );
    }

    return assignments;
  }, [assignments, user]);

  const filteredRoles = useMemo(() => {
    if (user?.role?.name === "Super Admin") {
      return roles;
    }

    if (user?.department) {
      return roles.filter((role) =>
        role.name.toLowerCase().includes("department"),
      );
    }

    return roles;
  }, [roles, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/assign-user", {
        teacherId: formData.teacherId || null,
        staffUserId: formData.staffUserId || null,
        roleId: formData.roleId,
        departmentId: formData.departmentId || null,
        isActive: formData.isActive,
      });

      success("User assigned successfully");

      setFormData({
        staffUserId: "",
        teacherId: "",
        roleId: "",
        departmentId: user?.department ? String(user.department.id) : "",
        isActive: true,
      });

      fetchAssignments();
    } catch (err) {
      error("Failed to assign user");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/assign-user/${id}`);
      success("Deleted successfully");
      fetchAssignments();
    } catch (err) {
      error("Delete failed");
    }
  };

  const inputStyle =
    currentTheme === "dark"
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-white text-gray-900 border-gray-300";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
        <h2 className={`text-xl font-bold ${theme.text}`}>
          Assign User Role & Department
        </h2>
      </div>

      {/* FORM */}
      <div className="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Staff */}
          <select
            className={`p-2 border rounded ${inputStyle}`}
            value={formData.staffUserId}
            onChange={(e) =>
              setFormData({ ...formData, staffUserId: e.target.value })
            }
          >
            <option value="">Select Staff</option>
            {staffUsers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>

          {/* Teacher */}
          <select
            className={`p-2 border rounded ${inputStyle}`}
            value={formData.teacherId}
            onChange={(e) =>
              setFormData({ ...formData, teacherId: e.target.value })
            }
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>

          {/* Role */}
          <select
            className={`p-2 border rounded ${inputStyle}`}
            value={formData.roleId}
            onChange={(e) =>
              setFormData({ ...formData, roleId: e.target.value })
            }
            required
          >
            <option value="">Select Role</option>
            {filteredRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Department */}
          <select
            className={`p-2 border rounded ${inputStyle}`}
            value={formData.departmentId}
            onChange={(e) =>
              setFormData({ ...formData, departmentId: e.target.value })
            }
            disabled={!!user?.department}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Submit */}
          {canCreate && (
            <button
              type="submit"
              className={`${theme.primary} text-white px-4 py-2 rounded col-span-full md:col-span-2 lg:col-span-4`}
            >
              Assign User
            </button>
          )}
        </form>
      </div>

      {/* CARDS */}
      <div className="p-6 rounded-lg shadow bg-white dark:bg-gray-800 space-y-4">
        <h3 className={`text-lg font-semibold ${theme.text}`}>
          Assigned Users
        </h3>

        {filteredAssignments.length === 0 ? (
          <p className="text-gray-500">No assignments yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border dark:border-gray-700 shadow-sm hover:shadow-md transition"
              >
                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-semibold ${theme.text}`}>
                      {item.StaffUser?.fullName ||
                        item.Teacher?.fullName ||
                        "Unknown User"}
                    </h4>

                    <p className="text-sm text-gray-500">
                      Role: {item.role?.name || "—"}
                    </p>

                    {item.Department && (
                      <p className="text-sm text-gray-500">
                        Department: {item.Department.name}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:bg-red-100 p-2 rounded"
                  >
                    {canDelete && <FiTrash2 />}
                  </button>
                </div>

                {/* BADGES */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {item.teacherId && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Teacher
                    </span>
                  )}

                  {item.staffUserId && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      Staff
                    </span>
                  )}

                  {item.isActive ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignUserPage;
