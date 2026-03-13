CREATE TABLE "_new_artists" ("ArtistId" INTEGER PRIMARY KEY, "Name" TEXT, "toggle" BOOLEAN);
INSERT INTO "_new_artists" ("ArtistId", "Name") SELECT "ArtistId", "Name" FROM "artists";
DROP TABLE "artists";
ALTER TABLE "_new_artists" RENAME TO "artists";