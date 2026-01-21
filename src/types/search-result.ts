import type {Show} from "@/types/show.ts";

export interface SearchResult {
  score: number;
  show: Show;
}
