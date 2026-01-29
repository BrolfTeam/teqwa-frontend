// Team data factory function that accepts translation function
export const getTeamData = (t) => [
    {
        id: 1,
        name: t('about.teamMembers.shehKamil.name'),
        role: t('about.teamMembers.shehKamil.role'),
        description: t('about.teamMembers.shehKamil.description'),
        image: null
    },
    {
        id: 2,
        name: t('about.teamMembers.shehSeidAli.name'),
        role: t('about.teamMembers.shehSeidAli.role'),
        description: t('about.teamMembers.shehSeidAli.description'),
        image: null
    },
    {
        id: 3,
        name: t('about.teamMembers.shehSeidSherif.name'),
        role: t('about.teamMembers.shehSeidSherif.role'),
        description: t('about.teamMembers.shehSeidSherif.description'),
        image: null
    },
    {
        id: 4,
        name: t('about.teamMembers.ustazAli.name'),
        role: t('about.teamMembers.ustazAli.role'),
        description: t('about.teamMembers.ustazAli.description'),
        image: null
    }
];

// Legacy export for backward compatibility (will use English)
export const teamData = [
    {
        id: 1,
        name: "Imam Abdullah Al-Mansour",
        role: "Head Imam",
        description: "Serving the community with dedication for many years.",
        image: null
    },
    {
        id: 2,
        name: "Dr. Aisha Rahman",
        role: "Education Director",
        description: "Leads our learning & youth programs.",
        image: null
    },
    {
        id: 3,
        name: "Yusuf Khan",
        role: "Community Outreach",
        description: "Connects community members and initiatives.",
        image: null
    },
    {
        id: 4,
        name: "Fatima Ahmed",
        role: "Youth Coordinator",
        description: "Builds strong programs for our young people.",
        image: null
    }
];
