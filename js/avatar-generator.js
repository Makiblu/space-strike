// SPACE STRIKE - Avatar Generator
// Generates unique, colorful profile avatars

const AvatarGenerator = {
    // Color schemes for avatars
    colorSchemes: [
        { bg: '#1a1a2e', primary: '#16213e', accent: '#0f3460', highlight: '#e94560' },
        { bg: '#0a192f', primary: '#172a45', accent: '#233554', highlight: '#64ffda' },
        { bg: '#1e3a5f', primary: '#2e5984', accent: '#3d75a6', highlight: '#ffd700' },
        { bg: '#2d1b69', primary: '#3d2a7e', accent: '#4e3891', highlight: '#ff6b9d' },
        { bg: '#0d1b2a', primary: '#1b263b', accent: '#2d4263', highlight: '#00d9ff' },
        { bg: '#1a1a2e', primary: '#533483', accent: '#7209b7', highlight: '#f72585' },
        { bg: '#03071e', primary: '#370617', accent: '#6a040f', highlight: '#ffba08' },
        { bg: '#000814', primary: '#001d3d', accent: '#003566', highlight: '#ffc300' },
    ],

    // Generate avatar based on username
    generate(username, size = 120) {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Get consistent color scheme based on username
        const schemeIndex = this.hashCode(username) % this.colorSchemes.length;
        const colors = this.colorSchemes[schemeIndex];

        // Draw background circle
        ctx.fillStyle = colors.bg;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw gradient overlay
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.accent);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw initials
        const initials = this.getInitials(username);
        ctx.fillStyle = colors.highlight;
        ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, size / 2, size / 2);

        // Add subtle border
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();

        // Add decorative elements
        this.addDecorativeElements(ctx, size, colors);

        return canvas.toDataURL();
    },

    // Add decorative sci-fi elements
    addDecorativeElements(ctx, size, colors) {
        ctx.strokeStyle = colors.highlight + '80'; // Semi-transparent
        ctx.lineWidth = 2;

        // Corner brackets
        const cornerSize = size * 0.15;
        const positions = [
            { x: 10, y: 10, angle: 0 },
            { x: size - 10, y: 10, angle: Math.PI / 2 },
            { x: size - 10, y: size - 10, angle: Math.PI },
            { x: 10, y: size - 10, angle: -Math.PI / 2 }
        ];

        positions.forEach(pos => {
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(pos.angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(cornerSize, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, cornerSize);
            ctx.stroke();
            ctx.restore();
        });

        // Rotating hexagon pattern
        const hexSize = size * 0.25;
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.strokeStyle = colors.accent + '40';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * hexSize;
            const y = Math.sin(angle) * hexSize;
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },

    // Get initials from username
    getInitials(username) {
        if (!username) return '??';
        
        // Remove numbers and special characters
        const cleaned = username.replace(/[^a-zA-Z\s]/g, '');
        
        // Split by spaces or camelCase
        const words = cleaned.split(/(?=[A-Z])|[\s_-]+/);
        
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        } else if (words[0] && words[0].length >= 2) {
            return words[0].substring(0, 2).toUpperCase();
        } else if (username.length >= 2) {
            return username.substring(0, 2).toUpperCase();
        }
        
        return username[0].toUpperCase();
    },

    // Simple hash function for consistent colors
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    },

    // Apply avatar to element
    applyToElement(elementId, username, size = 120) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const avatarUrl = this.generate(username, size);
        
        if (element.tagName === 'IMG') {
            element.src = avatarUrl;
        } else {
            element.style.backgroundImage = `url(${avatarUrl})`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
        }
    },

    // Create avatar element
    createAvatarElement(username, size = 120, className = '') {
        const img = document.createElement('img');
        img.src = this.generate(username, size);
        img.alt = `${username} avatar`;
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.borderRadius = '50%';
        if (className) {
            img.className = className;
        }
        return img;
    }
};

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvatarGenerator;
}
