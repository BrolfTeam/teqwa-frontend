import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiUsers, 
  FiUser, 
  FiBook, 
  FiUserCheck, 
  FiArrowRight,
  FiHelpCircle
} from 'react-icons/fi';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { Card } from '@/components/ui/Card';
import authLogo from '@/assets/logo.png';

const ROLE_OPTIONS = [
  {
    id: 'admin',
    title: 'Admin',
    description: 'System administrator with full access to manage the platform',
    icon: <FiShield className="h-8 w-8" />,
    color: 'from-red-600 to-red-800',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    hoverColor: 'hover:border-red-500 dark:hover:border-red-500',
    textColor: 'text-red-700 dark:text-red-300',
    allowRegister: false, // Admin registration typically requires manual approval
  },
  {
    id: 'staff',
    title: 'Staff / Teacher',
    description: 'Mosque staff, teachers, and other personnel',
    icon: <FiUsers className="h-8 w-8" />,
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverColor: 'hover:border-blue-500 dark:hover:border-blue-500',
    textColor: 'text-blue-700 dark:text-blue-300',
    allowRegister: true,
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Students enrolled in educational programs',
    icon: <FiBook className="h-8 w-8" />,
    color: 'from-green-600 to-green-800',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverColor: 'hover:border-green-500 dark:hover:border-green-500',
    textColor: 'text-green-700 dark:text-green-300',
    allowRegister: true,
  },
  {
    id: 'parent',
    title: 'Parent',
    description: 'Parents of students or community members',
    icon: <FiUserCheck className="h-8 w-8" />,
    color: 'from-purple-600 to-purple-800',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverColor: 'hover:border-purple-500 dark:hover:border-purple-500',
    textColor: 'text-purple-700 dark:text-purple-300',
    allowRegister: true,
  },
  {
    id: 'member',
    title: 'User / Member',
    description: 'General community members and visitors',
    icon: <FiUser className="h-8 w-8" />,
    color: 'from-emerald-600 to-emerald-800',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverColor: 'hover:border-emerald-500 dark:hover:border-emerald-500',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    allowRegister: true,
  },
];

const RoleSelection = memo(() => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    // Small delay for visual feedback
    setTimeout(() => {
      if (role.allowRegister) {
        // Navigate to register with role, but also allow login
        navigate(`/register?role=${role.id}`);
      } else {
        // Admin can only login (registration disabled)
        navigate(`/login?role=${role.id}`);
      }
    }, 200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-900 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <IslamicPattern className="w-full h-full" color="currentColor" opacity={0.1} />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src={authLogo} 
              alt="Teqwa Logo" 
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-serif text-emerald-950 dark:text-emerald-50 mb-4">
            Welcome to Teqwa
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto mb-2">
            Select your role to continue
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
            Choose the option that best describes your relationship with our community
          </p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {ROLE_OPTIONS.map((role) => (
            <motion.div
              key={role.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`
                  ${role.bgColor}
                  ${role.borderColor}
                  ${role.hoverColor}
                  border-2 cursor-pointer transition-all duration-300
                  relative overflow-hidden group h-full
                `}
                onClick={() => handleRoleSelect(role)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10 p-6">
                  {/* Icon */}
                  <div className={`mb-4 inline-flex p-4 rounded-xl bg-gradient-to-br ${role.color} text-white shadow-lg`}>
                    {role.icon}
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-bold mb-2 ${role.textColor}`}>
                    {role.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 text-sm mb-4">
                    {role.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-700">
                    {!role.allowRegister && (
                      <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <FiHelpCircle className="h-3 w-3" />
                        Login only
                      </span>
                    )}
                    <div className={`flex items-center gap-2 ${role.textColor} font-medium text-sm`}>
                      {role.allowRegister ? 'Register or Login' : 'Login'}
                      <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-stone-500 dark:text-stone-400"
        >
          <p>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium underline"
            >
              Sign in directly
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
});

RoleSelection.displayName = 'RoleSelection';
export default RoleSelection;
