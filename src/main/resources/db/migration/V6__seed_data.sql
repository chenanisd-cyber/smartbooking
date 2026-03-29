-- ============================================================
-- V6 — Jeu de données complet (INSERT IGNORE = idempotent)
-- ============================================================

-- Roles
INSERT IGNORE INTO roles (id, name) VALUES
  (1,'admin'),(2,'member'),(3,'producer'),(4,'affiliate'),(5,'press');

-- Types artistes
INSERT IGNORE INTO artist_types (id, name) VALUES
  (1,'Chanteur/Chanteuse'),(2,'Groupe de musique'),(3,'Comédien/Comédienne'),
  (4,'Danseur/Danseuse'),(5,'Humoriste'),(6,'Orchestre'),(7,'DJ');

-- Users (pass membres/producteurs = pass123, admin = admin123)
INSERT IGNORE INTO users (id, login, password, email, first_name, last_name, is_active, is_approved, created_at) VALUES
  (1, 'admin',    '$2b$10$nA47tzg92Mz0CgjNm2HrNuSj1oW1UK6EO.PF2zvGAYm5iAvJ57jde', 'admin@smartbooking.be',  'Admin',  'System',   1, 1, NOW()),
  (2, 'alice',    '$2b$10$PT0hwNyI43G36FD3MQpbsOmel07GwJbWB8jdVZWk1HPy.G5BSX/ma',  'alice@example.com',      'Alice',  'Dupont',   1, 1, NOW()),
  (3, 'bob',      '$2b$10$PT0hwNyI43G36FD3MQpbsOmel07GwJbWB8jdVZWk1HPy.G5BSX/ma',  'bob@example.com',        'Bob',    'Martin',   1, 1, NOW()),
  (4, 'claire',   '$2b$10$PT0hwNyI43G36FD3MQpbsOmel07GwJbWB8jdVZWk1HPy.G5BSX/ma',  'claire@example.com',     'Claire', 'Lecomte',  1, 1, NOW()),
  (5, 'david',    '$2b$10$PT0hwNyI43G36FD3MQpbsOmel07GwJbWB8jdVZWk1HPy.G5BSX/ma',  'david@example.com',      'David',  'Bernard',  1, 1, NOW()),
  (6, 'emma',     '$2b$10$PT0hwNyI43G36FD3MQpbsOmel07GwJbWB8jdVZWk1HPy.G5BSX/ma',  'emma@example.com',       'Emma',   'Renard',   1, 1, NOW()),
  (7, 'producer1','$2b$10$PT0hwNyI43G36FD3MQpbsOmel07GwJbWB8jdVZWk1HPy.G5BSX/ma',  'prod1@example.com',      'Pierre', 'Produkt',  1, 1, NOW()),
  (8, 'producer2','$2b$10$PT0hwNyI43G36FD3MQpbsOmel07GwJbWB8jdVZWk1HPy.G5BSX/ma',  'prod2@example.com',      'Sophie', 'Créatif',  0, 0, NOW());

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
  (1,1),(2,2),(3,2),(4,2),(5,2),(6,2),(7,3),(8,3);

-- Artistes
INSERT IGNORE INTO artists (id, name, biography, image_path) VALUES
  (1,'Stromae',            'Paul Van Haver, alias Stromae, est un chanteur, auteur-compositeur-interprète belge. Connu pour son style électro-pop mêlant influences africaines et électroniques.', NULL),
  (2,'Angèle',             'Angèle Van Laeken est une chanteuse et auteure-compositrice belge. Son style pop moderne et ses textes engagés lui ont valu un succès international.',                   NULL),
  (3,'Comédie Royale',     'Troupe de théâtre belge réputée pour ses adaptations contemporaines des grands classiques de Molière, Shakespeare et Racine.',                                          NULL),
  (4,'Ballet National',    'Compagnie de danse classique et contemporaine reconnue en Europe, fondée à Bruxelles.',                                                                                 NULL),
  (5,'Opéra de Bruxelles', 'Ensemble lyrique de renommée internationale, spécialisé dans les grands opéras italiens et français du XIXe siècle.',                                                 NULL),
  (6,'Gad Elmaleh',        'Humoriste et acteur franco-marocain, Gad Elmaleh est l''un des comiques francophones les plus populaires avec plus de 20 ans de carrière sur scène.',                  NULL),
  (7,'Jazz Collective',    'Quintette de jazz belge alliant standards traditionnels et compositions originales. Fondé en 2010.',                                                                    NULL),
  (8,'Lost Frequencies',   'Félix De Laet, alias Lost Frequencies, est un DJ et producteur électronique belge, auteur de nombreux hits internationaux.',                                           NULL);

INSERT IGNORE INTO artist_artist_types (artist_id, artist_type_id) VALUES
  (1,1),(1,2),(2,1),(3,3),(4,4),(5,6),(6,5),(7,2),(7,6),(8,7);

-- Localités (reprises de V5 avec INSERT IGNORE)
INSERT IGNORE INTO localities (id, name, postal_code) VALUES
  (1,'Bruxelles','1000'),(2,'Anvers','2000'),(3,'Gand','9000'),
  (4,'Liège','4000'),(5,'Bruges','8000'),(6,'Namur','5000'),
  (7,'Mons','7000'),(8,'Louvain','3000'),(9,'Charleroi','6000'),
  (10,'Hasselt','3500'),(11,'Ostende','8400'),
  (12,'Paris','75000'),(13,'Amsterdam','1000'),(14,'Londres','EC1A'),(15,'Berlin','10115');

-- Lieux
INSERT IGNORE INTO locations (id, name, address, capacity, locality_id) VALUES
  (1,'Palais des Beaux-Arts (BOZAR)', 'Rue Ravenstein 23',       2200,  1),
  (2,'Forest National',               'Avenue du Globe 36',       8000,  1),
  (3,'Ancienne Belgique',             'Boulevard Anspach 110',    2000,  1),
  (4,'Opéra Royal de Wallonie',       'Place de la République 1', 1000,  4),
  (5,'Sportpaleis',                   'Schijnpoortweg 119',      23000,  2),
  (6,'Théâtre de la Place',           'Place du Théâtre',          800,  4),
  (7,'Muziekcentrum De Bijloke',      'Jozef Kluyskensstraat 2',  1000,  3),
  (8,'Cirque Royal',                  'Rue de l''Enseignement 81',2100,  1),
  (9,'Palais 12',                     'Avenue de Marathon',      12000,  1),
  (10,'Grand Théâtre de Mons',        'Rue des Capucins',          900,  7);

-- Spectacles
INSERT IGNORE INTO shows (id, title, description, slug, image_path, is_confirmed, artist_id, created_at) VALUES
  (1,'Stromae — Multitude Tour',         'Le retour tant attendu de Stromae sur scène ! Après des années d''absence, il revient avec son album Multitude pour un show époustouflant mêlant électro, chanson française et performances visuelles uniques.',                                                               'stromae-multitude-tour',          'concert_rock.jpg', 1, 1, NOW()),
  (2,'Angèle — Nonante-Cinq Tour',       'Angèle vous invite dans son univers pop coloré et engagé. Un concert haut en couleur avec des chorégraphies, des décors somptueux et tous ses tubes dont "Balance ton quoi" et "Nombreux".',                                                                                 'angele-nonante-cinq-tour',        'concert_pop.jpg',  1, 2, NOW()),
  (3,'Le Misanthrope — Molière revisité','La Comédie Royale propose une version contemporaine du Misanthrope de Molière. Alceste se retrouve confronté à l''hypocrisie du monde moderne dans une mise en scène audacieuse.',                                                                                           'le-misanthrope-moliere-revisite', 'theatre_classique.jpg', 1, 3, NOW()),
  (4,'Lac des Cygnes — Ballet National', 'Le chef-d''œuvre de Tchaïkovski interprété par le Ballet National dans une production somptueuse. Une féerie visuelle inoubliable.',                                                                                                                                        'lac-des-cygnes-ballet-national',  'ballet.jpg',       1, 4, NOW()),
  (5,'La Traviata — Verdi',              'L''Opéra de Bruxelles présente La Traviata de Verdi. Violetta vit une passion déchirante avec Alfredo dans une mise en scène moderne et émouvante.',                                                                                                                         'la-traviata-verdi',               'opera.jpg',        1, 5, NOW()),
  (6,'Gad Elmaleh — D''ailleurs',        'Gad Elmaleh revient avec un nouveau spectacle où il explore avec humour et tendresse ses racines, ses voyages et ses observations sur la vie contemporaine.',                                                                                                                 'gad-elmaleh-dailleurs',           'comedie.jpg',      1, 6, NOW()),
  (7,'Jazz Collective — Nuit de Jazz',   'Une nuit magique avec le Jazz Collective pour un voyage musical entre standards de jazz, bossa nova et compositions originales.',                                                                                                                                             'jazz-collective-nuit-de-jazz',    'jazz.jpg',         1, 7, NOW()),
  (8,'Lost Frequencies — Open Air',      'Lost Frequencies envahit le Palais 12 pour une soirée électronique inoubliable. Attendez-vous à une explosion de son et de lumières avec ses hits "Are You With Me" et "Reality".',                                                                                         'lost-frequencies-open-air-festival','festival.jpg',   1, 8, NOW());

-- Représentations (passées + futures 2025 + été 2026)
INSERT IGNORE INTO representations (id, show_id, location_id, date_time, available_seats) VALUES
  (1,1,2,'2024-11-15 20:00:00',0),(2,1,2,'2025-06-14 20:00:00',120),(3,1,9,'2025-09-20 20:30:00',500),
  (4,2,3,'2024-12-05 20:00:00',0),(5,2,3,'2025-05-22 20:00:00',85),(6,2,5,'2025-07-12 20:00:00',1200),
  (7,3,1,'2024-10-18 19:30:00',0),(8,3,1,'2025-04-10 19:30:00',200),(9,3,10,'2025-05-03 19:30:00',150),
  (10,4,8,'2024-12-20 20:00:00',0),(11,4,8,'2025-03-28 20:00:00',45),(12,4,8,'2025-04-05 20:00:00',180),
  (13,5,4,'2024-11-30 19:00:00',0),(14,5,4,'2025-06-07 19:00:00',60),(15,5,4,'2025-10-11 19:00:00',300),
  (16,6,1,'2025-02-14 20:30:00',0),(17,6,1,'2025-05-09 20:30:00',350),(18,6,8,'2025-08-22 20:30:00',800),
  (19,7,7,'2024-09-28 21:00:00',0),(20,7,7,'2025-04-25 21:00:00',220),(21,7,7,'2025-11-08 21:00:00',400),
  (22,8,9,'2024-08-10 22:00:00',0),(23,8,9,'2025-07-05 22:00:00',3000),(24,8,9,'2025-12-31 23:00:00',5000),
  -- Été 2026
  (29,1,2,'2026-06-12 20:00:00',800),(30,1,9,'2026-07-18 20:30:00',1200),
  (31,2,3,'2026-06-20 20:00:00',350),(32,2,5,'2026-08-08 20:00:00',2000),
  (33,3,1,'2026-07-04 19:30:00',250),(34,3,10,'2026-08-15 19:30:00',180),
  (35,4,8,'2026-06-27 20:00:00',300),(36,4,8,'2026-07-25 20:00:00',300),
  (37,5,4,'2026-06-06 19:00:00',200),(38,5,4,'2026-08-22 19:00:00',250),
  (39,6,1,'2026-07-11 20:30:00',500),(40,6,8,'2026-08-29 20:30:00',600),
  (41,7,7,'2026-06-19 21:00:00',350),(42,7,7,'2026-08-07 21:00:00',400),
  (43,8,9,'2026-07-04 22:00:00',4000),(44,8,9,'2026-08-14 22:00:00',5000);

-- Prix
INSERT IGNORE INTO prices (representation_id, type, amount) VALUES
  (1,'STANDARD',45.00),(1,'VIP',90.00),
  (2,'STANDARD',45.00),(2,'VIP',90.00),(2,'PREMIUM',150.00),
  (3,'STANDARD',42.00),(3,'VIP',85.00),(3,'PREMIUM',140.00),
  (4,'STANDARD',35.00),(4,'VIP',70.00),
  (5,'STANDARD',35.00),(5,'VIP',70.00),(5,'REDUIT',25.00),
  (6,'STANDARD',38.00),(6,'VIP',75.00),(6,'REDUIT',28.00),
  (7,'STANDARD',25.00),(7,'REDUIT',15.00),
  (8,'STANDARD',25.00),(8,'VIP',45.00),(8,'REDUIT',15.00),
  (9,'STANDARD',22.00),(9,'REDUIT',12.00),
  (10,'STANDARD',40.00),(10,'VIP',80.00),
  (11,'STANDARD',40.00),(11,'VIP',80.00),(11,'REDUIT',28.00),
  (12,'STANDARD',38.00),(12,'VIP',75.00),(12,'REDUIT',26.00),
  (13,'STANDARD',55.00),(13,'VIP',110.00),
  (14,'STANDARD',55.00),(14,'VIP',110.00),(14,'PREMIUM',180.00),
  (15,'STANDARD',50.00),(15,'VIP',100.00),(15,'REDUIT',35.00),
  (16,'STANDARD',30.00),(16,'VIP',60.00),
  (17,'STANDARD',30.00),(17,'VIP',60.00),(17,'REDUIT',20.00),
  (18,'STANDARD',28.00),(18,'VIP',55.00),(18,'REDUIT',18.00),
  (19,'STANDARD',18.00),(19,'REDUIT',12.00),
  (20,'STANDARD',18.00),(20,'VIP',35.00),(20,'REDUIT',12.00),
  (21,'STANDARD',20.00),(21,'REDUIT',13.00),
  (22,'STANDARD',25.00),(22,'VIP',55.00),
  (23,'STANDARD',25.00),(23,'VIP',55.00),(23,'PREMIUM',95.00),
  (24,'STANDARD',30.00),(24,'VIP',65.00),(24,'PREMIUM',110.00),
  (29,'STANDARD',45.00),(29,'VIP',90.00),(29,'PREMIUM',150.00),
  (30,'STANDARD',42.00),(30,'VIP',85.00),(30,'PREMIUM',140.00),
  (31,'STANDARD',35.00),(31,'VIP',70.00),(31,'REDUIT',25.00),
  (32,'STANDARD',38.00),(32,'VIP',75.00),(32,'REDUIT',28.00),
  (33,'STANDARD',25.00),(33,'VIP',45.00),(33,'REDUIT',15.00),
  (34,'STANDARD',22.00),(34,'VIP',42.00),(34,'REDUIT',13.00),
  (35,'STANDARD',40.00),(35,'VIP',80.00),(35,'REDUIT',28.00),
  (36,'STANDARD',40.00),(36,'VIP',80.00),(36,'REDUIT',28.00),
  (37,'STANDARD',55.00),(37,'VIP',110.00),(37,'PREMIUM',180.00),
  (38,'STANDARD',50.00),(38,'VIP',100.00),(38,'REDUIT',35.00),
  (39,'STANDARD',30.00),(39,'VIP',60.00),(39,'REDUIT',20.00),
  (40,'STANDARD',28.00),(40,'VIP',55.00),(40,'REDUIT',18.00),
  (41,'STANDARD',18.00),(41,'VIP',35.00),(41,'REDUIT',12.00),
  (42,'STANDARD',20.00),(42,'VIP',38.00),(42,'REDUIT',13.00),
  (43,'STANDARD',25.00),(43,'VIP',55.00),(43,'PREMIUM',95.00),
  (44,'STANDARD',30.00),(44,'VIP',65.00),(44,'PREMIUM',110.00);

-- Réservations
INSERT IGNORE INTO reservations (id, user_id, representation_id, price_type, quantity, total_amount, status, created_at) VALUES
  (1,2,1,'STANDARD',2,90.00,'CONFIRMED','2024-11-10 10:00:00'),
  (2,2,4,'VIP',1,70.00,'CONFIRMED','2024-11-30 14:00:00'),
  (3,2,10,'STANDARD',2,80.00,'CONFIRMED','2024-12-15 09:00:00'),
  (4,3,7,'STANDARD',2,50.00,'CONFIRMED','2024-10-01 11:00:00'),
  (5,3,13,'VIP',2,220.00,'CONFIRMED','2024-11-20 16:00:00'),
  (6,3,16,'STANDARD',1,30.00,'CONFIRMED','2025-02-01 12:00:00'),
  (7,4,19,'STANDARD',2,36.00,'CONFIRMED','2024-09-20 15:00:00'),
  (8,4,22,'VIP',2,110.00,'CONFIRMED','2024-08-05 10:00:00'),
  (9,4,1,'VIP',1,90.00,'CONFIRMED','2024-11-12 18:00:00'),
  (10,5,4,'STANDARD',3,105.00,'CONFIRMED','2024-11-28 20:00:00'),
  (11,5,7,'REDUIT',2,30.00,'CONFIRMED','2024-10-10 09:00:00'),
  (12,5,13,'STANDARD',1,55.00,'CONFIRMED','2024-11-25 14:00:00'),
  (13,6,10,'VIP',2,160.00,'CONFIRMED','2024-12-18 11:00:00'),
  (14,6,16,'VIP',1,60.00,'CONFIRMED','2025-02-10 13:00:00'),
  (15,6,19,'REDUIT',3,36.00,'CONFIRMED','2024-09-22 17:00:00');

-- Avis
INSERT IGNORE INTO reviews (id, user_id, show_id, comment, stars, validated, created_at) VALUES
  (1,2,1,'Un concert absolument époustouflant ! La mise en scène est grandiose, Stromae est habité sur scène. Un moment inoubliable.',5,1,'2024-11-16 10:00:00'),
  (2,4,1,'Spectacle magnifique, mais la salle était bondée et la visibilité depuis notre place était limitée.',4,1,'2024-11-17 09:00:00'),
  (3,2,2,'Angèle est une vraie perle ! Son énergie sur scène est communicative, les arrangements musicaux sont superbes.',5,1,'2024-12-06 11:00:00'),
  (4,5,2,'Très bon concert, les fans sont adorables et l''ambiance était festive. Seul bémol : le son un peu saturé par moments.',4,1,'2024-12-07 14:00:00'),
  (5,3,3,'Une mise en scène brillante qui donne un souffle nouveau à Molière. Les comédiens sont excellents.',5,1,'2024-10-19 15:00:00'),
  (6,5,3,'Intéressant mais parfois un peu long. La transposition moderne fonctionne bien pour certaines scènes.',3,1,'2024-10-20 10:00:00'),
  (7,2,4,'Un ballet d''une beauté renversante. Les danseurs sont d''une grâce absolue et la scénographie est somptueuse.',5,1,'2024-12-21 09:00:00'),
  (8,6,4,'Magnifique production ! La danseuse principale est extraordinaire. Le Cirque Royal est la salle parfaite.',5,1,'2024-12-22 11:00:00'),
  (9,3,5,'Une Traviata émouvante du début à la fin. Les voix sont sublimes, l''orchestre impeccable.',5,1,'2024-12-01 20:00:00'),
  (10,5,5,'Très belle soirée. La soprano était exceptionnelle mais le ténor un peu en deçà lors de la première partie.',4,1,'2024-12-02 10:00:00'),
  (11,3,6,'Gad Elmaleh nous a fait pleurer de rire du début à la fin ! Son nouveau spectacle est très personnel.',5,0,'2025-02-15 09:00:00'),
  (12,6,6,'Quelques passages vraiment hilarants mais d''autres un peu longuets. Dans l''ensemble une belle soirée.',3,0,'2025-02-16 14:00:00'),
  (13,4,7,'Une nuit de jazz parfaite dans un cadre intime et chaleureux. Le quintette est talentueux.',5,1,'2024-09-29 11:00:00'),
  (14,6,7,'Excellente découverte ! L''ambiance du De Bijloke est unique pour ce type de concert.',4,1,'2024-09-30 09:00:00'),
  (15,4,8,'Une soirée électronique de folie ! Lost Frequencies sait comment enflammer une salle. Le light show était hallucinant.',5,1,'2024-08-11 12:00:00'),
  (16,2,8,'Super set, bonne ambiance. Quelques transitions un peu brusques entre les morceaux.',4,0,'2024-08-12 10:00:00');
