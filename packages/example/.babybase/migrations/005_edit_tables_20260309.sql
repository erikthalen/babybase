BEGIN;
CREATE TABLE "_new_customers" ("CustomerId" INTEGER PRIMARY KEY, "FirstName" TEXT NOT NULL, "LastName" TEXT NOT NULL, "Company" TEXT, "Address" TEXT, "City" TEXT, "State" TEXT, "Country" TEXT, "PostalCode" TEXT, "Phone" TEXT, "FaxName" TEXT, "Email" TEXT NOT NULL, "SupportRepId" INTEGER REFERENCES "employees" ("EmployeeId"));
INSERT INTO "_new_customers" ("CustomerId", "FirstName", "LastName", "Company", "Address", "City", "State", "Country", "PostalCode", "Phone", "FaxName", "Email", "SupportRepId") SELECT "CustomerId", "FirstName", "LastName", "Company", "Address", "City", "State", "Country", "PostalCode", "Phone", "Fax", "Email", "SupportRepId" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "_new_customers" RENAME TO "customers";
COMMIT;