// Centralized App Configuration
const CONFIG = {
    // HostAfrica Live Backend URL
    API_BASE_URL: 'https://mfocan.org.za',

    // Default Fetch Options
    FETCH_OPTIONS: {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },

    // Resolves complete API endpoints
    getApiUrl(path) {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${this.API_BASE_URL}/${cleanPath}`;
    },

    // Resolves image paths for Native WebViews / Mobile
    getImageUrl(path, fallback = 'placeholder.png') {
        if (!path) return fallback;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${this.API_BASE_URL}/${cleanPath}`;
    }
};

// Prevent runtime tampering
Object.freeze(CONFIG);