export interface UserProfile {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  preferred_username?: string;

  municipio_id?: string;

  realm_access?: {
    roles: string[];
  };

  [key: string]: unknown;
}
