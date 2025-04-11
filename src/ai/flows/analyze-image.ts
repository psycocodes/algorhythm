'use server';

/**
 * @fileOverview Analyzes an image to identify dominant colors, objects, and overall mood.
 *
 * - analyzeImage - A function that handles the image analysis process.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the AnalyzeImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeImageInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the photo to analyze.'),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  dominantColors: z.array(z.string()).describe('The dominant colors in the image.'),
  objects: z.array(z.string()).describe('The objects detected in the image.'),
  mood: z.string().describe('The overall mood of the image.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the photo to analyze.'),
    }),
  },
  output: {
    schema: z.object({
      dominantColors: z.array(z.string()).describe('The dominant colors in the image.'),
      objects: z.array(z.string()).describe('The objects detected in the image.'),
      mood: z.string().describe('The overall mood of the image.'),
    }),
  },
  prompt: `You are an AI expert in computer vision with a deep understanding of art and emotion.

You will analyze the image at the provided URL and identify the dominant colors, objects, and overall mood of the image. Pay close attention to the emotional context and subtle details within the picture.

Consider how the arrangement of objects, the use of light and shadow, and the color palette contribute to the overall feeling conveyed by the image. Identify not just the objects present, but also their relationships and how they interact to create a cohesive emotional experience.

Return the dominant colors as an array of strings.
Return the objects detected as an array of strings, focusing on those that contribute most to the image's emotional impact.
Return the overall mood of the image as a string, capturing the nuances and complexities of the emotional experience it evokes.

Photo URL: {{photoUrl}}`,
});

const analyzeImageFlow = ai.defineFlow<
  typeof AnalyzeImageInputSchema,
  typeof AnalyzeImageOutputSchema
>({
  name: 'analyzeImageFlow',
  inputSchema: AnalyzeImageInputSchema,
  outputSchema: AnalyzeImageOutputSchema,
}, async input => {
  const {output} = await analyzeImagePrompt(input);
  return output!;
});
