// src/ai/flows/generate-hints.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating hints for puzzles using an LLM.
 *
 * The flow takes the puzzle type, difficulty, current state, and user attempt as input, and returns a helpful hint.
 * It exports:
 * - `generateHint`: A function that takes the puzzle details and returns a generated hint.
 * - `GenerateHintInput`: The input type for the generateHint function.
 * - `GenerateHintOutput`: The return type for the generateHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHintInputSchema = z.object({
  puzzleType: z.string().describe('The type of puzzle (e.g., Sudoku, Wordle).'),
  difficulty: z.string().describe('The difficulty level of the puzzle.'),
  currentState: z.string().describe('The current state of the puzzle as a string.'),
  attemptId: z.string().describe('The attempt ID of the current puzzle.'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('A helpful hint for the puzzle.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const generateHintPrompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are an expert puzzle solver. Provide a helpful hint for the following puzzle.

Puzzle Type: {{{puzzleType}}}
Difficulty: {{{difficulty}}}
Current State: {{{currentState}}}

Hint:`,
});

const generateHintFlow = ai.defineFlow(
  {
    name: 'generateHintFlow',
    inputSchema: GenerateHintInputSchema,
    outputSchema: GenerateHintOutputSchema,
  },
  async input => {
    const {output} = await generateHintPrompt(input);
    return output!;
  }
);
