export interface LocationValue {
  name: string;
  lat: number;
  lon: number;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}
