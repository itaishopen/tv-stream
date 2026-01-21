import type {Image} from "@/types/image.ts";
import type {Rating} from "@/types/rating.ts";

export interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
  summary: string;
  image: Image | null;
  rating: Rating;
}
