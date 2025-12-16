import { memo } from 'react';

const IslamicPattern = memo(({ className = "", opacity = 0.05, color = "currentColor" }) => {
    return (
        <div
            className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
            aria-hidden="true"
            style={{ zIndex: 0 }}
        >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="islamic-geometric" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
                        <circle cx="20" cy="20" r="5" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
                        <path d="M20 0 V40 M0 20 H40" fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 0.5} />
                    </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-geometric)" />
            </svg>
        </div>
    );
});

IslamicPattern.displayName = 'IslamicPattern';
export default IslamicPattern;
