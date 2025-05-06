
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

    console.log("Sending request to OpenRouter API");
    
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

      console.error("OpenRouter API error:", errorMessage);
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: openRouterResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Received response from OpenRouter API");
    
    // Get the response text first to avoid JSON parse errors
    const responseText = await openRouterResponse.text();
    
    // Check if the response is empty
    if (!responseText || responseText.trim() === '') {
      console.error("Empty response from OpenRouter API");
      return new Response(
        JSON.stringify({ error: "Empty response from OpenRouter API" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Response text length:", responseText.length);
    
    // Try to parse the response as JSON
    let openRouterData;
    try {
      openRouterData = JSON.parse(responseText);
      console.log("Successfully parsed JSON response");
    } catch (error) {
      // If parsing fails, return the error
      console.error("Failed to parse response as JSON:", error.message);
      console.error("Raw response (first 500 chars):", responseText.substring(0, 500));
      
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

    // Verify we have the expected data structure
    if (!openRouterData.choices || !openRouterData.choices[0]) {
      console.error("Missing 'choices' in API response:", JSON.stringify(openRouterData).substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "Invalid response structure from OpenRouter API",
          details: "Missing 'choices' array in response",
          partialResponse: JSON.stringify(openRouterData).substring(0, 500)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return the response to the client
    console.log("Sending successful response to client");
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
