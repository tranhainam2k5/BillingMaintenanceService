-- SQL Script to seed default technicians in PostgreSQL

-- Insert default technicians if they do not exist
INSERT INTO "Technicians" ("Name")
SELECT 'Nguyễn Văn Hùng' WHERE NOT EXISTS (SELECT 1 FROM "Technicians" WHERE "Name" = 'Nguyễn Văn Hùng');

INSERT INTO "Technicians" ("Name")
SELECT 'Trần Minh Tuấn' WHERE NOT EXISTS (SELECT 1 FROM "Technicians" WHERE "Name" = 'Trần Minh Tuấn');

INSERT INTO "Technicians" ("Name")
SELECT 'Lê Quốc Bảo' WHERE NOT EXISTS (SELECT 1 FROM "Technicians" WHERE "Name" = 'Lê Quốc Bảo');

INSERT INTO "Technicians" ("Name")
SELECT 'Phạm Văn Nam' WHERE NOT EXISTS (SELECT 1 FROM "Technicians" WHERE "Name" = 'Phạm Văn Nam');
