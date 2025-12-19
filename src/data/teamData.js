// Team data factory function that accepts translation function
export const getTeamData = (t) => [
    {
        id: 1,
        name: t('about.teamMembers.imamAbdullah.name'),
        role: t('about.teamMembers.imamAbdullah.role'),
        description: t('about.teamMembers.imamAbdullah.description'),
        image: null
    },
    {
        id: 2,
        name: t('about.teamMembers.drAisha.name'),
        role: t('about.teamMembers.drAisha.role'),
        description: t('about.teamMembers.drAisha.description'),
        image: null
    },
    {
        id: 3,
        name: t('about.teamMembers.yusufKhan.name'),
        role: t('about.teamMembers.yusufKhan.role'),
        description: t('about.teamMembers.yusufKhan.description'),
        image: null
    },
    {
        id: 4,
        name: t('about.teamMembers.fatimaAhmed.name'),
        role: t('about.teamMembers.fatimaAhmed.role'),
        description: t('about.teamMembers.fatimaAhmed.description'),
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
