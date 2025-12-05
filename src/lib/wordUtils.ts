// src/lib/wordUtils.ts

const WORD_LIST_URL = 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words';

export async function getWordList(): Promise<string[]> {
  try {
    const response = await fetch(WORD_LIST_URL);
    if (!response.ok) throw new Error('Failed to fetch word list');

    const text = await response.text();
    // Split by new line and ensure 5 letters
    return text.split('\n').filter(word => word.length === 5);
  } catch (error) {
    console.error("Error loading words:", error);
    return ['react', 'nextjs', 'codes', 'games', 'world']; 
  }
}

export async function getRandomWord(): Promise<string> {
  const words = await getWordList();
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}