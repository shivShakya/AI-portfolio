export async function POST(request) {
  try {
    const { text } = await request.json();
    const url = 'https://api.v7.unrealspeech.com/speech';
    
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        "Authorization": `Bearer ${process.env.UNREAL_VOICE}`,
      },
      body: JSON.stringify({
        Text: text, 
        VoiceId: 'Scarlett',
        Bitrate: '192k',
        Speed: '0',
        Pitch: '1',
        TimestampType: 'word'
      })
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}



/* 
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
*/
