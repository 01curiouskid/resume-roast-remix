
import { ROAST_LEVELS, ROAST_PROMPTS, API_TIMEOUT } from './constants';

type RoastLevel = typeof ROAST_LEVELS[keyof typeof ROAST_LEVELS];

export async function generateRoast(resumeText: string, spiciness: RoastLevel): Promise<string> {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Resume text is too short to generate a proper roast');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const prompt = ROAST_PROMPTS[spiciness];
    
    // Determine base URL for the API
    const baseUrl = import.meta.env.MODE === 'production'
      ? 'https://resume-roast-remix.lovable.app'
      : window.location.origin;
    
    console.log(`Making request to ${baseUrl}/api/chat-proxy`);
    
    // Use Supabase Edge Function instead of direct OpenRouter API call
    const response = await fetch(`${baseUrl}/api/chat-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        spiciness,
        prompt,
        temperature: spiciness === ROAST_LEVELS.MILD ? 0.7 :
                    spiciness === ROAST_LEVELS.SPICY ? 0.8 : 0.9,
        model: 'google/gemma-3-1b-it:free'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Received response with status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `API Error: Status ${response.status}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          console.error('Error details:', errorData);
        }
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    // First get response as text to avoid JSON parse errors
    const responseText = await response.text();
    
    // Log the response content for debugging
    console.log('Response content length:', responseText.length);
    if (responseText.length < 100) {
      console.log('Full response text:', responseText);
    } else {
      console.log('First 100 chars of response:', responseText.substring(0, 100));
    }
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      throw new Error('The API returned an empty response. Please try again later.');
    }
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Successfully parsed response as JSON');
    } catch (error) {
      console.error('Failed to parse API response:', error);
      console.error('Response text (first 100 chars):', responseText.substring(0, 100));
      throw new Error(`Failed to parse API response: ${error.message}`);
    }

    // Check for credit error
    if (response.status === 402 || (data.error && data.error.includes("Insufficient"))) {
      throw new Error('Insufficient Credit: The OpenRouter API key does not have enough credits. Please contact the site administrator.');
    }

    // Check if there's an error message in the parsed data
    if (data.error) {
      throw new Error(`API Error: ${data.error}`);
    }

    const result =
      data.choices?.[0]?.message?.content ??
      data.choices?.[0]?.text ??
      null;

    if (!result) {
      console.error('Invalid response structure:', data);
      throw new Error('The model did not return a valid response.');
    }

    return result.trim();

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again later.');
      }
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
}

function getFallbackRoast(spiciness: RoastLevel): string {
  switch (spiciness) {
    case ROAST_LEVELS.MILD:
      return "I noticed your resume has quite a few 'detail-oriented' claims for someone who used three different font sizes. And those 'leadership skills'? Is that what we're calling asking teammates to cover your shift these days? But hey, at least your dates of employment are consistent, unlike your career path. Keep refining it, you're almost at 'might get an interview' status!";
    case ROAST_LEVELS.SPICY:
      return "Your resume reads like an AI generated it—and not one of the good ones. You've listed 'Excel expert' but somehow couldn't align your bullet points. Those 'five years of experience' must include your time thinking about the job during college. And congratulations on being a 'team player'—corporate speak for 'does others' work without complaint.' Maybe next time try listing actual achievements instead of buzzword bingo?";
    case ROAST_LEVELS.EXTRA_SPICY:
      return "Holy buzzword cemetery, Batman! This resume isn't just bad, it's a crime against HR departments everywhere. You've got more clichés than a motivational Instagram page and less substance than a reality TV star. Your 'proven track record of success' is about as proven as Bigfoot, and those 'specialized skills' are so generic they might as well be 'breathing' and 'showing up occasionally.' If your career trajectory were any flatter, we could use it as a spirit level. The only thing this resume qualifies you for is a masterclass in how to waste printer ink.";
    default:
      return "Hmm, this resume is... certainly a collection of words on a page. Not necessarily the right words, or in the right order, but definitely words. Maybe consider a career in abstract resume art? You'd be a pioneer in the field!";
  }
}
