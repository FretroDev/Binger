import { NextResponse } from "next/server";
import type { TMDBSearchResult, TMDBDetails } from "@/types";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchTMDB(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<any> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not configured");
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const query = searchParams.get("query");
  const id = searchParams.get("id");
  const type = searchParams.get("type") as "movie" | "tv";

  try {
    let data: TMDBSearchResult[] | TMDBDetails;

    if (action === "search" && query) {
      const result = await fetchTMDB("/search/multi", {
        query,
        include_adult: "false",
      });
      data = result.results as TMDBSearchResult[];
    } else if (action === "details" && id && type) {
      data = (await fetchTMDB(`/${type}/${id}`)) as TMDBDetails;
    } else {
      throw new Error("Invalid action or missing parameters");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in TMDB API route:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching data from TMDB" },
      { status: 500 },
    );
  }
}
