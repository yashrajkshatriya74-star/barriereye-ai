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
              text: `Eres un experto en accesibilidad urbana. Analiza esta imagen de calle o banqueta e identifica:
1. Barreras de accesibilidad (banquetas dañadas, obstáculos, falta de rampas, etc.)
2. Nivel de peligro: BAJO / MEDIO / ALTO
3. Recomendaciones para resolver los problemas
4. ¿Es este lugar accesible para sillas de ruedas? SI / NO

Se especifico y conciso. Responde en español.`,
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
