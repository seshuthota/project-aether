// --- CONSTANTS ---

export const SUBJECTS = [
    // Artifacts & Objects
    "A rusty anchor", "A crystal pyramid", "A golden key", "A cracked mirror", "A burning candle",
    "A pocket watch", "A message in a bottle", "A compass", "A violin", "A masquerade mask",
    "A chessboard", "A skull with flowers", "A floating lantern", "A mechanical heart",
    "A broken hourglass", "A jeweled beetle", "A ship in a bottle", "A vintage camera",
    "A typewriter", "A marionette", "A birdcage", "A porcelain doll", "A dreamcatcher",
    "A gargoyle", "A suit of armor", "A crown of thorns", "A holy grail", "A magic lamp",
    "A crystal ball", "A samurai sword", "A viking shield", "A rubik's cube", "A neon sign",

    // Nature & Cosmos
    "A sleeping cat", "A lone wolf", "A cherry blossom tree", "A geometric cube",
    "A giant mushroom", "A bonsai tree", "A spiraling galaxy", "A solar eclipse",
    "A raven on a branch", "A blooming lotus", "A jellyfish", "A coral reef",
    "A tornado", "A volcano", "A crescent moon", "A black hole", "A nebula",
    "A planet with rings", "A spiderweb with dew", "A beehive", "A hummingbird",
    "A chameleon", "A dragon", "A phoenix", "A unicorn", "A mermaid", "A kraken",

    // Structures & Places
    "A steam locomotive", "A floating island", "A stone statue", "A lighthouse",
    "A torii gate", "A gothic cathedral", "A windmill", "A treehouse", "A submarine",
    "A hot air balloon", "A derelict spaceship", "A pyramid on mars", "A castle in the clouds",
    "A door in the sky", "A labyrinth", "A pagoda", "A ziggurat", "A colosseum",
    "A stonehenge", "A moai statue", "A clock tower", "A factory", "A skyscraper"
];

export const CONTEXTS = [
    // Atmospheric
    "in a dense fog", "under neon rain", "burning in a fireplace", "submerged underwater",
    "in a desert storm", "on a snowy peak", "encased in ice", "crumbling to dust",
    "in the eye of a hurricane", "surrounded by autumn leaves", "buried in sand",
    "glowing with heat", "dripping with slime", "covered in moss", "overgrown with vines",

    // Abstract
    "floating in outer space", "in a chaotic void", "bathed in moonlight",
    "surrounded by fireflies", "in a mirror maze", "glowing with radiation",
    "melting into liquid", "crystallizing into glass", "exploding into confetti",
    "floating in zero gravity", "entangled in vines", "reflected in a puddle",
    "inside a teardrop", "glitching out", "inverted colors", "double exposed",

    // Locations
    "in a cyberpunk alley", "in a quiet library", "on a distant planet",
    "in an abandoned carnival", "inside a geode", "on a chessboard floor",
    "in a bioluminescent cave", "under a microscope", "in a parallel universe",
    "in a dreamscape", "in a video game", "in a bamboo forest", "in a zen garden",
    "in a haunted house", "in a spaceship cockpit", "in a subway tunnel",
    "in a lush jungle", "in a vast desert", "on a floating rock"
];

export const STYLES = [
    // Pure Aesthetic Modifiers (Removed Nouns like 'Alien' to prevent prompt conflict)
    "Cyberpunk", "Steampunk", "Noir", "Surrealist", "Bauhaus", "Art Deco",
    "Impressionist", "Cubist", "Abstract Expressionist", "Pop Art", "Renaissance",
    "Baroque", "Gothic Horror", "Ukiyo-e", "Synthwave", "Vaporwave",
    "Realism", "Minimalism", "Futurism", "Pointillism", "Constructivism",
    "Street Art", "Graffiti", "Banksy Style", "Basquiat Style", "Warhol Style",
    "Van Gogh Style", "Rembrandt Style", "Hokusai Style", "Studio Ghibli Style",

    // Mediums
    "Oil Painting", "Watercolor", "Pencil Sketch", "Charcoal Drawing", "Ink Wash",
    "Claymation", "Papercraft", "Origami", "Stained Glass", "Marble Sculpture",
    "Woodcut Print", "Mosaic", "Embroidery", "Chalk Art", "Pastel Drawing",
    "Polaroid Photo", "Pixel Art", "Low Poly 3D", "Cinematic Lighting",
    "Thermal Imaging", "X-Ray", "Infrared", "Blueprint", "Unreal Engine 5 Render"
];

// --- LOGIC ---

export type ProtocolType = 'PRECOGNITION' | 'REMOTE_VIEWING';

interface SessionConfig {
    protocol: ProtocolType;
    coordinate: string;
    seed: number; // The number used to pick from the arrays
}

export function initializeSession(protocol: ProtocolType): SessionConfig {
    const coordinate = generateCoordinate();

    // THE CRITICAL DISTINCTION
    let seed: number;

    if (protocol === 'REMOTE_VIEWING') {
        // Mode B: Anchor Protocol
        // The seed is determined NOW by the coordinate. The target exists now.
        // We hash the coordinate string to get a deterministic number.
        seed = simpleHash(coordinate);
    } else {
        // Mode A: Paradox Protocol (Precognition)
        // We set a temporary seed (0) because the REAL seed 
        // will be generated only AFTER submission.
        seed = 0;
    }

    return { protocol, coordinate, seed };
}

// Used for PRECOGNITION mode at the moment of submission
export function generateFinalSeed(): number {
    return Math.floor(Math.random() * 10000000);
}

export function generateCoordinate(): string {
    const part1 = Math.floor(Math.random() * 9000) + 1000;
    const part2 = Math.floor(Math.random() * 9000) + 1000;
    return `${part1}-${part2}`;
}

// Deterministic hash for Remote Viewing mode
// Ensures 1234-5678 always produces the same prompt
export function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function generatePromptFromSeed(seed: number): string {
    // We use the seed to pick indices.
    // This allows us to reconstruct the exact prompt later if we have the seed.

    const subIndex = seed % SUBJECTS.length;
    const ctxIndex = (seed >> 2) % CONTEXTS.length; // Bit shift to get different variance
    const styIndex = (seed >> 4) % STYLES.length;

    const subject = SUBJECTS[subIndex];
    const context = CONTEXTS[ctxIndex];
    const style = STYLES[styIndex];

    return `${subject} ${context}, ${style} style. highly detailed, 8k resolution.`;
}