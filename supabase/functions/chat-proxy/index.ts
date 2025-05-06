
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured on the server" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract the necessary data from the request
    const { resumeText, spiciness, temperature, model } = requestData;

    if (!resumeText || !spiciness) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Construct the OpenRouter API request
    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.get("origin") || "https://resume-roast-remix.lovable.app",
          "X-Title": "Resume Roaster",
        },
        body: JSON.stringify({
          model: model || "google/gemma-3-1b-it:free",
          messages: [
            {
              role: "system",
              content: "You are a resume roasting expert that creates humorous, critical feedback.",
            },
            {
              role: "user",
              content: `${requestData.prompt}\n\nHere is the resume to roast:\n${resumeText}`,
            },
          ],
          max_tokens: 500,
          temperature: temperature || 0.8,
        }),
      }
    );

    // Get the response from OpenRouter
    const openRouterData = await openRouterResponse.json();

    // Return the response to the client
    return new Response(JSON.stringify(openRouterData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle any errors
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
