import { FiClock, FiUsers, FiBookOpen, FiTarget, FiEye, FiHeart, FiGlobe } from 'react-icons/fi';

export const aboutData = {
    hero: {
        title: "About",
        titleHighlight: "MUJEMA’ TEQWA MOSQUE",
        description: "A beacon of faith, knowledge, and community service in the heart of our city."
    },
    stats: [
        { icon: FiClock, number: '2023', label: 'Established' },
        { icon: FiUsers, number: '2500+', label: 'Masjid Capacity' },
        { icon: FiBookOpen, number: '50+', label: 'Weekly Programs' },
    ],
    purpose: {
        title: "Our Purpose",
        subtitle: "Guided by faith and driven by service"
    },
    mission: {
        title: "Our Mission",
        desc: "At MUJEMA’ TEQWA MOSQUE, we strive to be a welcoming space for worship, learning, and community building. Our mission is to nurture faith, knowledge, and service while preserving Islamic values and traditions.",
        icon: FiTarget
    },
    vision: {
        title: "Our Vision",
        desc: "We envision a vibrant community where individuals and families grow spiritually, intellectually, and socially, contributing positively to society at large.",
        icon: FiEye
    },
    values: [
        { icon: FiBookOpen, title: 'Worship', desc: 'Providing a spiritual home for daily prayers and religious observances.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: FiUsers, title: 'Education', desc: 'Offering comprehensive Islamic education for all age groups.', color: 'text-green-500', bg: 'bg-green-500/10' },
        { icon: FiHeart, title: 'Community', desc: 'Building bridges and fostering unity within our diverse community.', color: 'text-red-500', bg: 'bg-red-500/10' },
        { icon: FiGlobe, title: 'Service', desc: 'Serving humanity through charitable initiatives and social programs.', color: 'text-orange-500', bg: 'bg-orange-500/10' }
    ],
    timeline: {
        title: "Our Journey",
        subtitle: "From humble beginnings to a thriving community center",
        items: [
            { year: '2023', title: 'Established', desc: 'MUJEMA’ TEQWA MOSQUE was established to serve the community in Kolfe Keraniyo.' },
            { year: '2023', title: 'Digital Launch', desc: 'Launched online services and digital systems to connect our community.' }
        ]
    },
    cta: {
        title: "Join Our Community",
        description: "Be part of a growing community dedicated to faith, learning, and service.",
        primaryAction: { label: "Get Involved", link: "/contact" },
        secondaryAction: { label: "View Programs", link: "/events" }
    }
};
