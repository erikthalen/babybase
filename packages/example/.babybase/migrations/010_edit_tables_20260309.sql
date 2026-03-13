CREATE TABLE "_new_artists" ("ArtistId" INTEGER PRIMARY KEY, "Name" TEXT, "toggle" NUMERIC, "some_data" JSON);
INSERT INTO "_new_artists" ("ArtistId", "Name", "toggle") SELECT "ArtistId", "Name", "toggle" FROM "artists";
DROP TABLE "artists";
ALTER TABLE "_new_artists" RENAME TO "artists";