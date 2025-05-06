
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

    // Check if the response status is ok
    if (!openRouterResponse.ok) {
      // Try to get the error message from the response
      let errorMessage;
      try {
        const errorData = await openRouterResponse.json();
        errorMessage = errorData.error?.message || `OpenRouter API error: ${openRouterResponse.status}`;
      } catch (e) {
        // If we can't parse the error as JSON, use the status text
        errorMessage = `OpenRouter API error: ${openRouterResponse.status} ${openRouterResponse.statusText}`;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: openRouterResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the response text first to avoid JSON parse errors
    const responseText = await openRouterResponse.text();
    
    // Check if the response is empty
    if (!responseText || responseText.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Empty response from OpenRouter API" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try to parse the response as JSON
    let openRouterData;
    try {
      openRouterData = JSON.parse(responseText);
    } catch (error) {
      // If parsing fails, return the error
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse OpenRouter API response", 
          details: error.message,
          rawResponse: responseText.substring(0, 500) // First 500 chars for debugging
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return the response to the client
    return new Response(JSON.stringify(openRouterData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    
    // Handle any errors
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
