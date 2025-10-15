'use server';
/**
 * @fileOverview A solution validation AI agent.
 *
 * - validateSolution - A function that handles the solution validation process.
 * - ValidateSolutionInput - The input type for the validateSolution function.
 * - ValidateSolutionOutput - The return type for the validateSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateSolutionInputSchema = z.object({
  puzzleType: z.string().describe('The type of puzzle (e.g., Sudoku, Wordle).'),
  userSolution: z.string().describe('The user-submitted solution to the puzzle.'),
  puzzleState: z.string().describe('The initial state of the puzzle.'),
});
export type ValidateSolutionInput = z.infer<typeof ValidateSolutionInputSchema>;

const ValidateSolutionOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the user-submitted solution is valid.'),
  explanation: z.string().describe('Explanation of why the solution is valid or invalid.'),
});
export type ValidateSolutionOutput = z.infer<typeof ValidateSolutionOutputSchema>;

export async function validateSolution(input: ValidateSolutionInput): Promise<ValidateSolutionOutput> {
  return validateSolutionFlow(input);
}

const validateSolutionPrompt = ai.definePrompt({
  name: 'validateSolutionPrompt',
  input: {schema: ValidateSolutionInputSchema},
  output: {schema: ValidateSolutionOutputSchema},
  prompt: `You are an expert puzzle solver. Your task is to validate user-submitted solutions for various types of puzzles.

Puzzle Type: {{{puzzleType}}}
Initial Puzzle State: {{{puzzleState}}}
User Solution: {{{userSolution}}}

Determine whether the user solution is valid given the puzzle type and initial state. Provide a clear explanation for your determination.
If the solution is not valid, explain the mistake and how to correct it.

Output your repsonse in JSON format:
{
  "isValid": true or false,
  "explanation": "Explanation here"
}
`,
});

const validateSolutionFlow = ai.defineFlow(
  {
    name: 'validateSolutionFlow',
    inputSchema: ValidateSolutionInputSchema,
    outputSchema: ValidateSolutionOutputSchema,
  },
  async input => {
    const {output} = await validateSolutionPrompt(input);
    return output!;
  }
);
