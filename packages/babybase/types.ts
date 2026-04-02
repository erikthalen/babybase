export interface S3Config {
  endpoint: string; // e.g. "https://garage.example.com"
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string; // default "garage"
  keyPrefix?: string; // optional path prefix for uploaded objects
}

export interface BabybaseConfig {
  database?: string;
  basePath?: string; // mount prefix for generating hrefs, default "/"
  migrationsDir?: string; // default "./migrations"
  migrations?: string[]; // SQL strings to run automatically on startup, in order
  storage?: string | S3Config; // local path string, or S3Config for remote storage
  readonly?: boolean; // default false — hides schema editing and migrations
  autoBackup?: "daily" | "weekly";
}
