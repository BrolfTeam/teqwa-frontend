import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';

const TeamMemberCard = ({ member }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="h-full"
        >
            <Card className="h-full text-center hover:shadow-lg transition-shadow border-border/40 hover:border-primary/50 bg-background/50 backdrop-blur-sm dark:bg-card/40 flex flex-col items-center justify-between p-0 shadow-sm overflow-hidden">
                {/* Top accent line */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                <CardContent className="pt-8 flex flex-col items-center flex-grow w-full px-6 pb-6">
                    {/* Avatar/Image Placeholder */}
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 overflow-hidden shadow-inner ring-4 ring-background">
                        {member.image ? (
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                                {/* Initials */}
                                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-4 bg-primary/10 px-3 py-1 rounded-full">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {member.description}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TeamMemberCard;
