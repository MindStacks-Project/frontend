import { db } from "@/lib/firebase.client";
import type { Puzzle, PuzzleDifficulty, PuzzleType } from "@/lib/types";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";

export type RecentlyPlayedEntry = {
  puzzleId: string;
  puzzleType: PuzzleType;
  difficulty: PuzzleDifficulty;
  source?: string;
  title?: string;
  lastPlayed?: Timestamp;
};

const recentlyPlayedCollection = (userId: string) =>
  collection(db, "users", userId, "recentlyPlayed");

export async function recordRecentlyPlayed(
  userId: string,
  puzzle: Puzzle,
  title?: string
) {
  const ref = doc(recentlyPlayedCollection(userId), puzzle.id);
  await setDoc(
    ref,
    {
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      difficulty: puzzle.difficulty,
      source: puzzle.source,
      title,
      lastPlayed: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function fetchRecentlyPlayed(
  userId: string,
  take = 6
): Promise<RecentlyPlayedEntry[]> {
  const q = query(
    recentlyPlayedCollection(userId),
    orderBy("lastPlayed", "desc"),
    limit(take)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      puzzleId: data.puzzleId as string,
      puzzleType: data.puzzleType as PuzzleType,
      difficulty: data.difficulty as PuzzleDifficulty,
      source: data.source as string | undefined,
      title: data.title as string | undefined,
      lastPlayed: data.lastPlayed as Timestamp | undefined,
    };
  });
}
