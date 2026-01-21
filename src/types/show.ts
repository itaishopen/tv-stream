import type {Rating} from "@/types/rating.ts";
import type {Image} from "@/types/image.ts";
import type {Episode} from "@/types/episode.ts";

export interface Show {
  id: number;
  name: string;
  genres: string[];
  rating: Rating;
  image: Image | null;
  summary: string;
  _embedded?: {
    episodes: Episode[];
  };
}
