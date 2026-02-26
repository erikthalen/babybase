export interface PicobaseConfig {
  database: string
  basePath?: string      // mount prefix for generating hrefs, default "/"
  migrationsDir?: string // default "./migrations"
  backupsDir?: string    // default "./backups"
}
