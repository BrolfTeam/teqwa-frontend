import { motion } from 'framer-motion';
import { FiInbox, FiPlus } from 'react-icons/fi';
import { Button } from './Button';

const EmptyState = ({ 
  icon: Icon = FiInbox,
  title = "No items found",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction,
  action,
  className = ""
}) => {
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action || (actionLabel && onAction && (
        <Button onClick={onAction} className="flex items-center">
          <FiPlus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      ))}
    </motion.div>
  );
};

export default EmptyState;