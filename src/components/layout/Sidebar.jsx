import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeContext from "./ThemeContext";
import { menuItems } from "./SidebarLink";
import { AuthContext } from "../../contexts/AuthContext";

import {
  FiChevronLeft,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";

const themes = {
  blue: { bg: "bg-blue-600", hover: "hover:bg-blue-700", text: "text-white" },
  green: { bg: "bg-green-600", hover: "hover:bg-green-700", text: "text-white" },
  purple: { bg: "bg-purple-600", hover: "hover:bg-purple-700", text: "text-white" },
  orange: { bg: "bg-orange-600", hover: "hover:bg-orange-700", text: "text-white" },
  dark: { bg: "bg-gray-900", hover: "hover:bg-gray-800", text: "text-white" },
};

const AppSidebar = ({ isOpen, toggleSidebar }) => {
  const { currentTheme } = useContext(ThemeContext);
  const colors = themes[currentTheme] || themes.dark;

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout, hasPermission, hasModuleAccess } = useContext(AuthContext);

  const [openFolders, setOpenFolders] = useState({});

  const handleFolderToggle = (label) => {
    setOpenFolders((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    setOpenFolders({});
    navigate("/login");
  };

  // 🔥 NEW PERMISSION-BASED FILTER (MAIN FIX)
const filteredMenu = useMemo(() => {
  if (!user) return [];
  console.log("🔐 USER PERMISSIONS:", user.permissions);
  console.log("📋 MENU ITEMS:", menuItems.map(m => m.permissionKey));

  return menuItems
    .map((item) => {
      // 🔵 Parent with children (MODULE)
      if (item.children) {
        const children = item.children.filter((child) => {
          if (!child.permissionKey) return true;

          const action = child.action ?? "view";

          return hasPermission(child.permissionKey, action);
        });

        return children.length > 0
          ? { ...item, children }
          : null;
      }

      // 🟢 Single item (MODULE LEVEL ACCESS)
      if (!item.permissionKey) return item;

      return hasModuleAccess(item.permissionKey) ? item : null;
    })
    .filter(Boolean);
}, [user, hasPermission, hasModuleAccess]);

  useEffect(() => {
    setOpenFolders({});
  }, [location.pathname, user]);

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-all duration-300
          ${colors.bg} ${colors.text}
          ${isOpen ? "w-64" : "w-16"}
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <span className={`font-bold text-lg ${!isOpen && "hidden"}`}>
              SIS
            </span>

            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-black/20"
            >
              <span className="hidden md:block">
                {isOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
              </span>
              <span className="md:hidden">
                {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-2 mt-4">
            {filteredMenu.map((item) => {
              const Icon = item.icon;

              if (item.children) {
                const isOpenFolder = openFolders[item.label] || false;

                return (
                  <div key={item.label} className="mb-2">

                    {/* Parent */}
                    <div
                      className={`flex items-center gap-3 p-3 rounded cursor-pointer ${colors.hover}`}
                      onClick={() => handleFolderToggle(item.label)}
                    >
                      <Icon size={20} />
                      {isOpen && (
                        <span className="flex-1">{item.label}</span>
                      )}

                      {isOpen && (
                        <span>
                          {isOpenFolder ? (
                            <FiChevronDown size={16} />
                          ) : (
                            <FiChevronRight size={16} />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Children */}
                    {isOpen && isOpenFolder && (
                      <div className="ml-8 flex flex-col">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={handleLinkClick}
                            className="p-2 rounded hover:bg-black/20"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 p-3 rounded hover:bg-black/20"
                >
                  <Icon size={20} />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-black/20">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-2 rounded ${colors.hover}`}
          >
            <FiLogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;