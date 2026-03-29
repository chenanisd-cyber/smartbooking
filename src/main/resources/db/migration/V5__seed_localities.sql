-- Supprime les doublons existants et repart sur une base propre
DELETE FROM localities;
ALTER TABLE localities AUTO_INCREMENT = 1;

-- Villes de Belgique
INSERT INTO localities (name, postal_code) VALUES
  ('Bruxelles',   '1000'),
  ('Anvers',      '2000'),
  ('Gand',        '9000'),
  ('Liège',       '4000'),
  ('Bruges',      '8000'),
  ('Namur',       '5000'),
  ('Mons',        '7000'),
  ('Louvain',     '3000'),
  ('Charleroi',   '6000'),
  ('Hasselt',     '3500'),
  ('Arlon',       '6700'),
  ('Tournai',     '7500'),
  ('La Louvière', '7100'),
  ('Verviers',    '4800'),
  ('Ostende',     '8400'),
-- Villes européennes célèbres
  ('Paris',       '75000'),
  ('Amsterdam',   '1000'),
  ('Londres',     'EC1A'),
  ('Berlin',      '10115'),
  ('Madrid',      '28001'),
  ('Rome',        '00100'),
  ('Lisbonne',    '1100'),
  ('Vienne',      '1010'),
  ('Prague',      '11000'),
  ('Barcelone',   '08001');
