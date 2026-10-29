import React from "react";

export function NetflixLogo({ height = 28, className = "", style = {} }) {
  const width = Math.round(height * 3.33);
  return (
    <svg
      viewBox="0 0 300 90"
      width={width}
      height={height}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="Netflix"
    >
      <defs>
        <linearGradient id="n-shadow-comp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="n-diag-comp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E50914" />
          <stop offset="100%" stopColor="#9E060E" />
        </linearGradient>
      </defs>
      
      {/* Netflix N Ribbon */}
      <g transform="translate(10, 14) scale(0.34)">
        <rect x="0" y="0" width="36" height="180" fill="#E50914" rx="2" />
        <rect x="68" y="0" width="36" height="180" fill="#E50914" rx="2" />
        <polygon points="0,0 36,0 104,180 68,180" fill="url(#n-diag-comp)" />
        <polygon points="0,0 36,0 36,180 0,180" fill="url(#n-shadow-comp)" />
      </g>

      {/* Netflix Wordmark Typography */}
      <g fill="#E50914" transform="translate(62, 22) scale(0.68)">
        <path d="M0 0h17.8l20.4 52.8V0h15.6v70H36.2L15.6 17.2V70H0V0zm62.4 0h37.4v13.6H78v14.4h20.4v13.6H78v14.8h22.6V70H62.4V0zm43 0h39.6v13.6h-12v56.4h-15.6V13.6h-12V0zm45.2 0h15.6v56.4h22.2V70h-37.8V0zm43.4 0h15.6v70H194V0zm24.6 0h17.6l12.4 22.8L261 0h17.6l-21.2 34.6L279.4 70h-18l-12.8-23.4L235.8 70h-17.8l21.4-35.4L218.6 0z" />
      </g>
    </svg>
  );
}

export function PrimeVideoLogo({ height = 28, className = "", style = {} }) {
  const width = Math.round(height * 3.55);
  return (
    <svg
      viewBox="0 0 320 90"
      width={width}
      height={height}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="Amazon Prime Video"
    >
      <defs>
        <linearGradient id="prime-cyan-comp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00A8E1" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>
      </defs>
      <text
        x="16"
        y="48"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="44px"
        letterSpacing="-1.5px"
      >
        prime
      </text>
      <text
        x="145"
        y="48"
        fill="#00A8E1"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="40px"
        letterSpacing="-0.5px"
      >
        video
      </text>
      <path
        d="M 22 58 C 55 76, 98 76, 128 58 C 130 56.5, 133 58.5, 131.5 60.5 C 99 83.5, 52 83.5, 19 60.5 C 17.5 59, 19.8 56.5, 22 58 Z"
        fill="url(#prime-cyan-comp)"
      />
      <path
        d="M 126 53 L 138 60 L 128 69 C 127 67, 128 64, 130 62.5 C 128 60, 126.5 56, 126 53 Z"
        fill="url(#prime-cyan-comp)"
      />
    </svg>
  );
}

export function SpotifyLogo({ height = 28, className = "", style = {} }) {
  const width = Math.round(height * 3.55);
  return (
    <svg
      viewBox="0 0 320 90"
      width={width}
      height={height}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="Spotify"
    >
      <g transform="translate(16, 15)">
        <circle cx="30" cy="30" r="30" fill="#1DB954" />
        <path
          d="M 43.5 43.5 C 42.8 44.5 41.5 44.8 40.5 44.2 C 33.2 39.8 24 38.8 13.5 41.2 C 12.5 41.5 11.5 40.8 11.2 39.8 C 11 38.8 11.6 37.8 12.6 37.5 C 24.2 34.8 34.5 36 42.8 41 C 43.8 41.6 44.1 42.8 43.5 43.5 Z"
          fill="#000000"
        />
        <path
          d="M 47 35.5 C 46.2 36.8 44.6 37.2 43.3 36.4 C 34.8 31.2 22 29.8 12.2 32.8 C 10.9 33.2 9.5 32.4 9.1 31.1 C 8.7 29.8 9.5 28.4 10.8 28 C 22 24.6 36.2 26.2 46 32.2 C 47.3 33 47.7 34.6 47 35.5 Z"
          fill="#000000"
        />
        <path
          d="M 47.5 27 C 37.5 21 21 20.5 11.2 23.5 C 9.6 24 8 23.1 7.5 21.5 C 7 19.9 7.9 18.3 9.5 17.8 C 20.8 14.4 39.2 15 50.5 21.8 C 51.9 22.6 52.3 24.5 51.5 25.9 C 50.7 27.3 48.9 27.8 47.5 27 Z"
          fill="#000000"
        />
      </g>
      <text
        x="92"
        y="52"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="40px"
        letterSpacing="-0.8px"
      >
        Spotify
      </text>
    </svg>
  );
}

export function DisneyHotstarLogo({ height = 28, className = "", style = {} }) {
  const width = Math.round(height * 3.8);
  return (
    <svg
      viewBox="0 0 350 90"
      width={width}
      height={height}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="Disney+ Hotstar"
    >
      <defs>
        <linearGradient id="dh-spark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF066" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF4500" />
        </linearGradient>
      </defs>
      
      {/* Disney+ part */}
      <g transform="translate(10, 18)">
        <text
          x="0"
          y="40"
          fill="#FFFFFF"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="36px"
          letterSpacing="-1px"
        >
          Disney<tspan fill="#0063E5" fontWeight="900">+</tspan>
        </text>
      </g>

      {/* Spark Star & Hotstar typography */}
      <g transform="translate(160, 18)">
        <g transform="translate(0, 2) scale(0.72)">
          <path
            d="M 27 0 L 32 18 L 48 13 L 36 26 L 54 33 L 34 37 L 42 54 L 27 41 L 12 54 L 20 37 L 0 33 L 18 26 L 6 13 L 22 18 Z"
            fill="url(#dh-spark)"
          />
          <circle cx="27" cy="27" r="4.5" fill="#FFFFFF" />
        </g>
        <text
          x="44"
          y="40"
          fill="#FFFFFF"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="32px"
          letterSpacing="-0.5px"
        >
          hotstar
        </text>
      </g>
    </svg>
  );
}

export function JioHotstarLogo(props) {
  return <DisneyHotstarLogo {...props} />;
}

export function ChurnWiseLogo({ height = 32, className = "", style = {} }) {
  const width = Math.round(height * 4.2);
  return (
    <svg
      viewBox="0 0 340 90"
      width={width}
      height={height}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="ChurnWise"
    >
      <defs>
        <linearGradient id="churn-shield-comp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E50914" />
          <stop offset="50%" stopColor="#7B2CBF" />
          <stop offset="100%" stopColor="#0057FF" />
        </linearGradient>
      </defs>
      <g transform="translate(14, 15)">
        <path d="M 30 0 L 58 15 L 58 45 L 30 60 L 2 45 L 2 15 Z" fill="url(#churn-shield-comp)" />
        <path
          d="M 12 30 L 22 30 L 27 18 L 33 42 L 38 30 L 48 30"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="86"
        y="44"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="34px"
        letterSpacing="-0.5px"
      >
        Churn<tspan fill="#00D2FF">Wise</tspan>
      </text>
      <text
        x="88"
        y="62"
        fill="rgba(255,255,255,0.7)"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="11px"
        letterSpacing="2px"
      >
        STREAMING RETENTION AI
      </text>
    </svg>
  );
}

export function PlatformEmblem({ platform = "Netflix", size = 28 }) {
  const norm = (platform || "").toLowerCase();
  
  if (norm.includes("netflix")) {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ verticalAlign: "middle", borderRadius: "22%" }}>
        <rect width="100" height="100" rx="22" fill="#141414" />
        <g transform="translate(26, 15) scale(0.48)">
          <rect x="0" y="0" width="36" height="145" fill="#E50914" rx="2" />
          <rect x="64" y="0" width="36" height="145" fill="#E50914" rx="2" />
          <polygon points="0,0 36,0 100,145 64,145" fill="#B20710" />
        </g>
      </svg>
    );
  }
  
  if (norm.includes("prime") || norm.includes("amazon")) {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ verticalAlign: "middle", borderRadius: "22%" }}>
        <rect width="100" height="100" rx="22" fill="#00050D" />
        <text x="50" y="52" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="32px" textAnchor="middle">prime</text>
        <path d="M 22 64 C 42 78, 62 78, 78 64" fill="none" stroke="#00A8E1" strokeWidth="5" strokeLinecap="round" />
        <path d="M 75 58 L 84 65 L 75 72" fill="#00A8E1" />
      </svg>
    );
  }
  
  if (norm.includes("spotify")) {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ verticalAlign: "middle" }}>
        <circle cx="50" cy="50" r="48" fill="#1DB954" />
        <g transform="translate(18, 18) scale(1.05)">
          <path d="M 43.5 43.5 C 42.8 44.5 41.5 44.8 40.5 44.2 C 33.2 39.8 24 38.8 13.5 41.2 C 12.5 41.5 11.5 40.8 11.2 39.8 C 11 38.8 11.6 37.8 12.6 37.5 C 24.2 34.8 34.5 36 42.8 41 C 43.8 41.6 44.1 42.8 43.5 43.5 Z" fill="#000000" />
          <path d="M 47 35.5 C 46.2 36.8 44.6 37.2 43.3 36.4 C 34.8 31.2 22 29.8 12.2 32.8 C 10.9 33.2 9.5 32.4 9.1 31.1 C 8.7 29.8 9.5 28.4 10.8 28 C 22 24.6 36.2 26.2 46 32.2 C 47.3 33 47.7 34.6 47 35.5 Z" fill="#000000" />
          <path d="M 47.5 27 C 37.5 21 21 20.5 11.2 23.5 C 9.6 24 8 23.1 7.5 21.5 C 7 19.9 7.9 18.3 9.5 17.8 C 20.8 14.4 39.2 15 50.5 21.8 C 51.9 22.6 52.3 24.5 51.5 25.9 C 50.7 27.3 48.9 27.8 47.5 27 Z" fill="#000000" />
        </g>
      </svg>
    );
  }
  
  // Disney+ Hotstar
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ verticalAlign: "middle", borderRadius: "22%" }}>
      <defs>
        <linearGradient id="dh-emblem-star" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF066" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF4500" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#040714" />
      <g transform="translate(18, 16) scale(1.15)">
        <path d="M 27 0 L 32 18 L 48 13 L 36 26 L 54 33 L 34 37 L 42 54 L 27 41 L 12 54 L 20 37 L 0 33 L 18 26 L 6 13 L 22 18 Z" fill="url(#dh-emblem-star)" />
        <circle cx="27" cy="27" r="4.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function PlatformLogo({ platform = "Netflix", height = 28, className = "", style = {} }) {
  const norm = (platform || "").toLowerCase();
  if (norm.includes("netflix")) {
    return <NetflixLogo height={height} className={className} style={style} />;
  }
  if (norm.includes("prime") || norm.includes("amazon")) {
    return <PrimeVideoLogo height={height} className={className} style={style} />;
  }
  if (norm.includes("spotify")) {
    return <SpotifyLogo height={height} className={className} style={style} />;
  }
  return <DisneyHotstarLogo height={height} className={className} style={style} />;
}

export const STREAMING_PLATFORMS = [
  {
    id: "Netflix",
    name: "Netflix",
    subtitle: "Originals · Series · 4K HDR",
    tag: "Global Leader",
    color: "#E50914",
    glow: "rgba(229, 9, 20, 0.45)",
    genre: "Binge & Series",
    benchmark: "18.5h binge avg",
    cardBg: "linear-gradient(135deg, rgba(30, 8, 12, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)",
    badgeStyle: {
      background: "rgba(229, 9, 20, 0.12)",
      color: "#E50914",
      border: "1px solid rgba(229, 9, 20, 0.35)"
    }
  },
  {
    id: "Amazon Prime Video",
    name: "Prime Video",
    subtitle: "Prime Originals & Live Sports",
    tag: "OTT + Shopping",
    color: "#00A8E1",
    glow: "rgba(0, 168, 225, 0.45)",
    genre: "Movies & Sports",
    benchmark: "Shopping + OTT Bundle",
    cardBg: "linear-gradient(135deg, rgba(6, 24, 42, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)",
    badgeStyle: {
      background: "rgba(0, 168, 225, 0.12)",
      color: "#00A8E1",
      border: "1px solid rgba(0, 168, 225, 0.35)"
    }
  },
  {
    id: "Disney+ Hotstar",
    name: "Disney+ Hotstar",
    subtitle: "Live Cricket & Disney Specials",
    tag: "Live Sports & OTT",
    color: "#0063E5",
    glow: "rgba(0, 99, 229, 0.45)",
    genre: "Cricket & Specials",
    benchmark: "Tournament Retention",
    cardBg: "linear-gradient(135deg, rgba(6, 18, 48, 0.95) 0%, rgba(12, 17, 34, 0.95) 100%)",
    badgeStyle: {
      background: "rgba(0, 99, 229, 0.15)",
      color: "#3B82F6",
      border: "1px solid rgba(0, 99, 229, 0.35)"
    }
  },
  {
    id: "Spotify",
    name: "Spotify",
    subtitle: "Lossless Audio & Podcasts",
    tag: "Hi-Fi Streaming",
    color: "#1DB954",
    glow: "rgba(29, 185, 84, 0.45)",
    genre: "Music & Podcasts",
    benchmark: "28.0h audio avg",
    cardBg: "linear-gradient(135deg, rgba(8, 34, 18, 0.95) 0%, rgba(12, 14, 22, 0.95) 100%)",
    badgeStyle: {
      background: "rgba(29, 185, 84, 0.12)",
      color: "#1DB954",
      border: "1px solid rgba(29, 185, 84, 0.35)"
    }
  }
];

export function getPlatformMeta(platform = "Netflix") {
  const norm = (platform || "").toLowerCase();
  if (norm.includes("netflix")) return STREAMING_PLATFORMS[0];
  if (norm.includes("prime") || norm.includes("amazon")) return STREAMING_PLATFORMS[1];
  if (norm.includes("disney") || norm.includes("hotstar")) return STREAMING_PLATFORMS[2];
  if (norm.includes("spotify")) return STREAMING_PLATFORMS[3];
  return STREAMING_PLATFORMS[0];
}

export default PlatformLogo;
