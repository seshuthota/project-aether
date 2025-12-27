export const MODEL_CONFIG = {
    provider: "openrouter",
    generation: {
        modelName: "google/gemini-2.5-flash-image", // Correct Image Generation Model
        safetySettings: "block_medium_and_above",
        aspectRatio: "1:1",
        guidanceScale: 7.5,
    },
    analysis: {
        modelName: "google/gemini-3-flash-preview", // Example OpenRouter ID
        systemPrompt: `You are a parapsychology researcher analyzing a remote viewing session.

Task: Compare the User's Sketch/Description against the Actual Target.
Criteria:
1. Gestalt: Do the main shapes match? (e.g., User drew a circle, Target is a planet).
2. Colors/Textures: strict match required.
3. Orientation: Is the main subject positioned correctly?

Output: Provide a 'Hit Score' from 0-100 and a 3-sentence summary of the similarities. Be skeptical but fair. If the user drew a tree and the target is a skyscraper, the score is 0, even if both are 'tall'.`,
        maxTokens: 500,
    }
}
