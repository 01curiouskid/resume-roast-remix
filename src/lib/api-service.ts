import { ROAST_LEVELS, ROAST_PROMPTS, API_TIMEOUT } from './constants';

type RoastLevel = typeof ROAST_LEVELS[keyof typeof ROAST_LEVELS];

export async function generateRoast(resumeText: string, spiciness: RoastLevel): Promise<string> {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Resume text is too short to generate a proper roast');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // Get the API key from window or localStorage
    const openRouterApiKey = (window as any).OPENROUTER_API_KEY || localStorage.getItem('openRouterApiKey');

    // If no API key is provided, return a fallback message
    if (!openRouterApiKey) {
      console.warn('No OpenRouter API key provided, using fallback response');
      clearTimeout(timeoutId);
      return getFallbackRoast(spiciness);
    }

    const prompt = ROAST_PROMPTS[spiciness];
    const message = `${prompt}\n\nHere is the resume to roast:\n${resumeText}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Resume Roaster'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it:free',
        messages: [
          {
            role: 'system',
            content: 'You are a resume roasting expert that creates humorous, critical feedback.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: spiciness === ROAST_LEVELS.MILD ? 0.7 :
                     spiciness === ROAST_LEVELS.SPICY ? 0.8 : 0.9
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      // Show credit error if relevant
      if (response.status === 402 || (errorData.error && errorData.error.message === "Insufficient credit")) {
        throw new Error('Insufficient Credit: Your OpenRouter API key does not have enough credits. Please add credits to your account.');
      }
      throw new Error(`API Error: ${errorData.error?.message || 'Failed to generate roast'}`);
    }

    // const data = await response.json();
    // return data.choices[0].message.content.trim();
    const data = await response.json();

    const result =
      data.choices?.[0]?.message?.content ??
      data.choices?.[0]?.text ??
      null;

    if (!result) {
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
