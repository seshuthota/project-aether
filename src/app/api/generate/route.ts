import { NextResponse } from "next/server";
import { MODEL_CONFIG } from "@/config/models";
import { simpleHash, generatePromptFromSeed, generateFinalSeed, ProtocolType } from "@/lib/entropy";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sketch, description, coordinate, apiKey: userApiKey, protocol } = body;

        const currentProtocol = protocol || 'PRECOGNITION'; // Default to Paradox

        // Sketch is now OPTIONAL. Coordinate is required.
        if (!coordinate) {
            return NextResponse.json({ error: "Missing coordinate" }, { status: 400 });
        }

        // 1. Determine Seed based on Protocol
        let seed: number;
        if (currentProtocol === 'REMOTE_VIEWING') {
            // Anchor Mode: Deterministic hash of coordinate
            // The target was "locked" when the coordinate was generated.
            seed = simpleHash(coordinate);
            console.log(`[ANCHOR MODE] Target Locked for ${coordinate}. Seed: ${seed}`);
        } else {
            // Paradox Mode: New random seed NOW.
            // The target is being generated AFTER the observation.
            seed = generateFinalSeed();
            console.log(`[PARADOX MODE] Wave Function Collapsing NOW. Seed: ${seed}`);
        }

        // 2. Generate Prompt (The Entropy Engine)
        const prompt = generatePromptFromSeed(seed);
        console.log("Generated Target Prompt:", prompt);

        const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key Missing" }, { status: 500 });
        }

        // 3. Generate Image (Imagen via OpenRouter)
        let targetImageUrl = "";

        try {
            // Using Chat Completions for Image Generation (OpenRouter Multimodal Standard)
            const imageRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://project-aether.vercel.app",
                    "X-Title": "Project Aether",
                },
                body: JSON.stringify({
                    model: MODEL_CONFIG.generation.modelName,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    modalities: ["image", "text"]
                })
            });

            if (!imageRes.ok) {
                const errorText = await imageRes.text();
                console.error("OpenRouter Image Generation Error:", imageRes.status, errorText);
                return NextResponse.json({ error: `Image Generation Failed (${imageRes.status}): ${errorText}` }, { status: imageRes.status });
            }

            const imageGenData = await imageRes.json();

            // 1. Try to get image from 'images' array (Gemini 2.5 Flash Image structure)
            const images = imageGenData.choices?.[0]?.message?.images;
            if (images && images.length > 0 && images[0].image_url?.url) {
                targetImageUrl = images[0].image_url.url;
            }
            // 2. Fallback: Try to parse markdown from content (Imagen structure)
            else {
                const content = imageGenData.choices?.[0]?.message?.content;
                if (content) {
                    const urlMatch = content.match(/\((https?:\/\/[^\)]+)\)/) || content.match(/(https?:\/\/[^\s]+)/);
                    if (urlMatch) {
                        targetImageUrl = urlMatch[1];
                    }
                }
            }

            if (!targetImageUrl) {
                console.error("OpenRouter Response missing image data:", JSON.stringify(imageGenData, null, 2));
                throw new Error("No image URL or data received from Generation Model");
            }

        } catch (e) {
            console.error("Image Gen Error:", e);
            return NextResponse.json({ error: "Image Generation Failed: " + e }, { status: 500 });
        }


        // 4. Analyze (Gemini via OpenRouter) - OPTIONAL
        let analysisText = "No sketch provided. Analysis skipped.";

        if (sketch) {
            try {
                const analysisRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://project-aether.vercel.app",
                        "X-Title": "Project Aether",
                    },
                    body: JSON.stringify({
                        model: MODEL_CONFIG.analysis.modelName,
                        messages: [
                            {
                                role: "system",
                                content: MODEL_CONFIG.analysis.systemPrompt
                            },
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "text",
                                        text: `Analyze the correlation.\nUser Description: ${description}\nTarget Prompt (Hidden from user): ${prompt}`
                                    },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: sketch
                                        }
                                    },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: targetImageUrl
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                });

                const analysisData = await analysisRes.json();
                analysisText = analysisData.choices?.[0]?.message?.content || "Analysis failed.";
            } catch (e) {
                console.error("Analysis Error:", e);
                analysisText = "Analysis process failed.";
            }
        }

        return NextResponse.json({
            prompt,
            targetUrl: targetImageUrl,
            analysis: analysisText,
            protocol: currentProtocol,
            seed: seed
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
