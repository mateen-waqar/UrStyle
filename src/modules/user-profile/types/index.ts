export interface UserProfileDetails {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  genderPreference: string | null;
  aesthetic: string | null;
  bodyShape: string | null;
  skinTone: string | null;
  heightCm: number | null;
  weightKg: number | null;
  preferredFit: string | null;
  city: string | null;
  country: string | null;
}
