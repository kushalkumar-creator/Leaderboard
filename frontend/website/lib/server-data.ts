import { cacheLife } from "next/cache";
import { fetchLeaderboardData } from "./api";
import type { LeaderboardData } from "./types";

/**
 * Leaderboard snapshot baked into the page HTML and refreshed in the
 * background about once a minute, so visitors see the board immediately
 * instead of waiting on the API. The client re-fetches after hydration.
 *
 * Returns null when the API is unreachable (or NEXT_PUBLIC_API_URL is not set
 * at build time); the client then loads the data itself. The error has to be
 * caught inside the "use cache" scope: an error thrown out of it fails the
 * prerender, and with it the whole build, even if the caller catches it.
 */
export async function getInitialLeaderboard(): Promise<LeaderboardData | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await fetchLeaderboardData({ signal: AbortSignal.timeout(15_000) });
  } catch (cause) {
    console.error("Leaderboard prefetch failed; falling back to client fetch.", cause);
    return null;
  }
}
