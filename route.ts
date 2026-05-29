import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
            {
              type: "text",
              text: `You are an accessibility expert. Analyze this street/sidewalk image and identify:
1. Accessibility barriers (broken pavements, missing curb cuts, obstacles, etc.)
2. Danger level: LOW / MEDIUM / HIGH
3. Recommendations to fix the issues
4. Is this location wheelchair friendly? YES / NO

Be specific and concise.`,
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const text = response.choices[0].message.content;
    return NextResponse.json({ result: text });

  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}