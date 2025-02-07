import { ElevenLabsClient, play } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Request body:", body);

    const audio = await elevenlabs.textToSpeech.convertAsStream("JBFqnCBsd6RMkjVDRZzb", {
      output_format: "mp3_44100_128",
      text: body.text,
      model_id: "eleven_multilingual_v2",
    });

    await play(audio);

    return new Response(JSON.stringify({ message: "Audio played successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
