
// src/ai/flows/generate-developer-insights.ts
'use server';

/**
 * @fileOverview Generates personalized insights for a developer profile.
 *
 * - generateDeveloperInsights - A function that generates personalized insights.
 * - GenerateDeveloperInsightsInput - The input type for the generateDeveloperInsights function.
 * - GenerateDeveloperInsightsOutput - The return type for the generateDeveloperInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema remains the same
const GenerateDeveloperInsightsInputSchema = z.object({
  githubUsername: z.string().describe('The GitHub username of the developer.'),
  totalStars: z.number().describe('Total number of stars received by the developer across all repositories.'),
  totalForks: z.number().describe('Total number of forks received by the developer across all repositories.'),
  totalFollowers: z.number().describe('Total number of followers of the developer.'),
  weeklyCommits: z.number().describe('Number of commits made by the developer in the last week.'),
  badges: z.array(z.string()).describe('List of badges earned by the developer.'),
});
export type GenerateDeveloperInsightsInput = z.infer<typeof GenerateDeveloperInsightsInputSchema>;

// This is the EXPORTED output schema, which the flow will adhere to.
const GenerateDeveloperInsightsOutputSchema = z.object({
  strengths: z.string().describe('Personalized insights into the developer\'s coding strengths.'),
  badgeExplanations: z.record(z.string(), z.string()).describe('Reasons for each badge acquisition. Keys are badge titles, values are explanations.'),
  improvementSuggestions: z.string().describe('Tailored improvement suggestions for the developer.'),
});
export type GenerateDeveloperInsightsOutput = z.infer<typeof GenerateDeveloperInsightsOutputSchema>;

// This is the INTERNAL output schema for the prompt, to work around the API limitation.
const InternalPromptOutputSchema = z.object({
  strengths: z.string().describe('Personalized insights into the developer\'s coding strengths.'),
  badgeExplanationsString: z.string().describe('A JSON string where keys are badge titles and values are their explanations. Example: "{\\"Coding God\\": \\"Awarded for exceptional coding skills.\\", \\"Prolific Committer\\": \\"For making over 100 commits.\\"}"'),
  improvementSuggestions: z.string().describe('Tailored improvement suggestions for the developer.'),
});

// The prompt will use the InternalPromptOutputSchema
const prompt = ai.definePrompt({
  name: 'generateDeveloperInsightsPrompt',
  input: {schema: GenerateDeveloperInsightsInputSchema},
  output: {schema: InternalPromptOutputSchema}, // Use internal schema here
  prompt: `You are an AI expert in analyzing developer profiles and providing personalized insights.

  Based on the provided data, generate insights into the developer's coding strengths, explain the reasons for their badge acquisition, and suggest tailored improvements.

  GitHub Username: {{{githubUsername}}}
  Total Stars: {{{totalStars}}}
  Total Forks: {{{totalForks}}}
  Total Followers: {{{totalFollowers}}}
  Weekly Commits: {{{weeklyCommits}}}
  Badges: {{#each badges}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Output should be structured as a JSON object matching the following, ensuring 'badgeExplanationsString' is a valid JSON string:
  {
    "strengths": "Insight into coding strengths",
    "badgeExplanationsString": "{\\"Badge Title 1\\": \\"Reason for acquiring badge 1\\", \\"Badge Title 2\\": \\"Reason for acquiring badge 2\\"}",
    "improvementSuggestions": "Tailored improvement suggestions"
  }
  `,
});

// The flow's definition uses the EXPORTED output schema.
const generateDeveloperInsightsFlow = ai.defineFlow(
  {
    name: 'generateDeveloperInsightsFlow',
    inputSchema: GenerateDeveloperInsightsInputSchema,
    outputSchema: GenerateDeveloperInsightsOutputSchema, // Flow's public contract
  },
  async (input: GenerateDeveloperInsightsInput): Promise<GenerateDeveloperInsightsOutput> => {
    const {output: internalOutput} = await prompt(input); // This `output` conforms to InternalPromptOutputSchema

    if (!internalOutput) {
      console.error('AI prompt returned no output for input:', JSON.stringify(input));
      throw new Error('AI prompt returned no output.');
    }

    let parsedBadgeExplanations: Record<string, string> = {};
    try {
      if (internalOutput.badgeExplanationsString && internalOutput.badgeExplanationsString.trim() !== "") {
        parsedBadgeExplanations = JSON.parse(internalOutput.badgeExplanationsString);
      } else {
        console.warn('AI returned empty badgeExplanationsString for input:', JSON.stringify(input), 'Defaulting to empty explanations.');
      }
    } catch (e) {
      console.error('Failed to parse badgeExplanationsString from AI. String was:', internalOutput.badgeExplanationsString, 'Error:', (e as Error).message, 'Input was:', JSON.stringify(input));
      throw new Error(`AI returned malformed JSON for badge explanations: ${(e as Error).message}. Raw string: ${internalOutput.badgeExplanationsString}`);
    }

    return {
      strengths: internalOutput.strengths,
      badgeExplanations: parsedBadgeExplanations,
      improvementSuggestions: internalOutput.improvementSuggestions,
    };
  }
);

// The exported function remains the same.
export async function generateDeveloperInsights(
  input: GenerateDeveloperInsightsInput
): Promise<GenerateDeveloperInsightsOutput> {
  return generateDeveloperInsightsFlow(input);
}
