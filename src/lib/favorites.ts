import { db } from "@/lib/firebase.client";
import type { Puzzle, PuzzleDifficulty, PuzzleType } from "@/lib/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";

export type FavoriteEntry = {
  puzzleId: string;
  puzzleType: PuzzleType;
  difficulty: PuzzleDifficulty;
  source?: string;
  title?: string;
  savedAt?: Timestamp;
};

const favoritesCollection = (userId: string) =>
  collection(db, "users", userId, "favorites");

export async function fetchFavorites(userId: string): Promise<FavoriteEntry[]> {
  const snapshot = await getDocs(favoritesCollection(userId));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      puzzleId: data.puzzleId as string,
      puzzleType: data.puzzleType as PuzzleType,
      difficulty: data.difficulty as PuzzleDifficulty,
      source: data.source as string | undefined,
      title: data.title as string | undefined,
      savedAt: data.savedAt as Timestamp | undefined,
    };
  });
}

export async function addFavorite(
  userId: string,
  puzzle: Puzzle,
  title?: string
): Promise<FavoriteEntry> {
  const ref = doc(favoritesCollection(userId), puzzle.id);
  await setDoc(ref, {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    source: puzzle.source,
    title,
    savedAt: serverTimestamp(),
  });
  return {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
    source: puzzle.source,
    title,
    savedAt: undefined,
  };
}

export async function removeFavorite(userId: string, puzzleId: string) {
  const ref = doc(favoritesCollection(userId), puzzleId);
  await deleteDoc(ref);
}
