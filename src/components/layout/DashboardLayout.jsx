import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiCalendar, FiHeart, FiUsers, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const allNavItems = [
        { to: "/dashboard", label: "Overview", icon: <FiHome className="w-5 h-5" />, roles: ['admin', 'staff', 'member', 'teacher', 'parent', 'student'] },
        { to: "/admin/users", label: "Users", icon: <FiUsers className="w-5 h-5" />, roles: ['admin'] },
        { to: "/admin/donations", label: "Donations", icon: <FiHeart className="w-5 h-5" />, roles: ['admin'] },
        { to: "/admin/settings", label: "Settings", icon: <FiSettings className="w-5 h-5" />, roles: ['admin'] },
        { to: "/staff/tasks", label: "My Tasks", icon: <FiCalendar className="w-5 h-5" />, roles: ['staff'] },
        { to: "/bookings", label: "Bookings", icon: <FiCalendar className="w-5 h-5" />, roles: ['member', 'student', 'parent', 'admin', 'staff'] },
        { to: "/donate", label: "Donations", icon: <FiHeart className="w-5 h-5" />, roles: ['member', 'student', 'parent', 'staff', 'visitor'] },
    ];

    const navItems = allNavItems.filter(item => {
        const userRole = user?.role;
        const isSuperUser = user?.is_superuser;

        // If it's the public donations link and user is an admin, hide it (as they have the admin one)
        if (item.to === "/donate" && (userRole === 'admin' || isSuperUser)) return false;

        return !item.roles || item.roles.includes(userRole) || (isSuperUser && item.roles.includes('admin'));
    });

    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-card dark:bg-slate-900 border-r border-border/40">
            <div className="p-6 border-b border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                        T
                    </div>
                    <span className="font-bold text-xl text-emerald-950 dark:text-emerald-50">Teqwa Admin</span>
                </div>
                <button onClick={closeSidebar} className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors">
                    <FiX className="w-6 h-6" />
                </button>
            </div>
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${location.pathname === item.to
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                            }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-border/10">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                    <p className="text-xs text-center text-emerald-800 dark:text-emerald-300 font-medium">© 2024 Teqwa Project</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeSidebar}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl md:hidden"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-72 bg-card border-r border-border sticky top-0 h-screen overflow-y-auto">
                    <SidebarContent />
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-16">
                        <div className="container mx-auto h-full px-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleSidebar}
                                    className="md:hidden p-2 -ml-2 text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                                >
                                    <FiMenu className="w-6 h-6" />
                                </button>
                                <h1 className="font-semibold text-lg md:text-xl">Dashboard</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Place for other header items like User Profile dropdown */}
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
