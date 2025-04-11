'use server';
/**
 * @fileOverview Generates music based on image analysis.
 *
 * - generateMusic - A function that handles the music generation process.
 * - GenerateMusicInput - The input type for the generateMusic function.
 * - GenerateMusicOutput - The return type for the GenerateMusic function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateMusicInputSchema = z.object({
  mood: z.string().describe('The overall mood of the photo.'),
  dominantColors: z.array(z.string()).describe('The dominant colors in the photo.'),
  objects: z.array(z.string()).describe('The objects detected in the photo.'),
});
export type GenerateMusicInput = z.infer<typeof GenerateMusicInputSchema>;

const GenerateMusicOutputSchema = z.object({
  tempo: z.number().describe('The tempo of the music in BPM.'),
  key: z.string().describe('The key of the music (e.g., C major, A minor).'),
  timeSignature: z.string().describe('The time signature of the music (e.g., 4/4, 3/4).'),
  instruments: z.array(z.string()).describe('The instruments used in the music.'),
  notes: z.array(z.string()).describe('An array of musical notes for the melody.'),
  melodyDescription: z.string().describe('A description of the melody. '),
});
export type GenerateMusicOutput = z.infer<typeof GenerateMusicOutputSchema>;

export async function generateMusic(input: GenerateMusicInput): Promise<GenerateMusicOutput> {
  return generateMusicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMusicPrompt',
  input: {
    schema: z.object({
      mood: z.string().describe('The overall mood of the photo.'),
      dominantColors: z.array(z.string()).describe('The dominant colors in the photo.'),
      objects: z.array(z.string()).describe('The objects detected in the photo.'),
    }),
  },
  output: {
    schema: z.object({
      tempo: z.number().describe('The tempo of the music in BPM.'),
      key: z.string().describe('The key of the music (e.g., C major, A minor).'),
      timeSignature: z.string().describe('The time signature of the music (e.g., 4/4, 3/4).'),
      instruments: z.array(z.string()).describe('The instruments used in the music.'),
      notes: z.array(z.string()).describe('An array of musical notes for the melody.'),
      melodyDescription: z.string().describe('A description of the melody.'),
    }),
  },
  prompt: `You are an experienced composer with a talent for translating visual art into music.

Based on the mood, dominant colors, and objects detected in the photo, generate a rich and complex musical piece that captures the emotional essence of the image.

Mood: {{{mood}}}
Dominant Colors: {{#each dominantColors}}{{{this}}} {{/each}}
Objects: {{#each objects}}{{{this}}} {{/each}}

Consider these factors when composing the music:
- Translate the emotional nuances of the image into specific musical elements.
- Use tempo variations, harmonic complexity, and dynamic range to reflect the mood.
- Let the dominant colors influence the timbre and texture of the music, selecting instruments and sounds that evoke the visual palette.
- Weave the objects into the melody and rhythm, creating musical motifs that represent their significance.

Output the tempo in BPM, the key, the time signature, the instruments used, an array of musical notes for the melody, and a description of the melody. The notes should be a string array of notes.

Ensure the music is not just harmonious, but also emotionally resonant and deeply connected to the source image. Create a melody that truly captures the picture's emotional core.`,
});

const generateMusicFlow = ai.defineFlow<
  typeof GenerateMusicInputSchema,
  typeof GenerateMusicOutputSchema
>(
  {
    name: 'generateMusicFlow',
    inputSchema: GenerateMusicInputSchema,
    outputSchema: GenerateMusicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
