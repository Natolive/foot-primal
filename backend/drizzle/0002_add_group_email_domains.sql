-- Domaines des autres sociétés du groupe, relevés dans l'annuaire pro.
INSERT INTO "email_domains" ("domain") VALUES
	('solem-irrigation.com'),
	('solem.us'),
	('dsi.solem.fr'),
	('attentive-telecare.com'),
	('indygo-pool.com'),
	('netx-buildings.com'),
	('primal.tech')
ON CONFLICT ("domain") DO NOTHING;
