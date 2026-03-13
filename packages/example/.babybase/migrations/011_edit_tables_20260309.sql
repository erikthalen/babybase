CREATE TABLE "_new_artists" ("ArtistId" INTEGER PRIMARY KEY, "Name" TEXT, "toggle" NUMERIC, "some_data" NUMERIC, "a_blob" BLOB);
INSERT INTO "_new_artists" ("ArtistId", "Name", "toggle", "some_data") SELECT "ArtistId", "Name", "toggle", "some_data" FROM "artists";
DROP TABLE "artists";
ALTER TABLE "_new_artists" RENAME TO "artists";