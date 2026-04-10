-- ============================================================
-- ALTFOOD — IMPORTAÇÃO DE ALIMENTOS (177 itens, 8 categorias)
-- Execute no SQL Editor APÓS rodar 01_schema_completo.sql
-- Passo 2 de 3
-- ============================================================

-- Limpa dados anteriores (seguro de rodar múltiplas vezes)
DELETE FROM public.foods;
DELETE FROM public.food_categories;

-- ============================================================
-- CATEGORIAS
-- ============================================================
INSERT INTO public.food_categories (id, name, icon, color, sort_order) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Proteínas Animais',    '🥩', '#DC2626', 1),
  ('11111111-0000-0000-0000-000000000002', 'Carboidratos',         '🍚', '#D97706', 2),
  ('11111111-0000-0000-0000-000000000003', 'Frutas',               '🍌', '#F59E0B', 3),
  ('11111111-0000-0000-0000-000000000004', 'Gorduras',             '🥑', '#10B981', 4),
  ('11111111-0000-0000-0000-000000000005', 'Doces e Sobremesas',   '🍫', '#8B5CF6', 5),
  ('11111111-0000-0000-0000-000000000006', 'Laticínios e Derivados','🥛', '#3B82F6', 6),
  ('11111111-0000-0000-0000-000000000007', 'Vegetais e Legumes',   '🥦', '#22C55E', 7),
  ('11111111-0000-0000-0000-000000000008', 'Proteínas Vegetais',   '🌱', '#84CC16', 8);

-- ============================================================
-- PROTEÍNAS ANIMAIS (35 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Frango grelhado (peito sem pele)',       'Frango grelhado',      '11111111-0000-0000-0000-000000000001', 159, 32.0, 0.0,  3.2, 0.0, 'grelhado'),
  ('Frango cozido (peito sem pele)',         'Frango cozido',        '11111111-0000-0000-0000-000000000001', 163, 31.5, 0.0,  3.6, 0.0, 'cozido'),
  ('Frango assado (coxa sem pele)',          'Frango assado',        '11111111-0000-0000-0000-000000000001', 176, 24.5, 0.0,  8.1, 0.0, 'assado'),
  ('Patinho bovino grelhado',                'Patinho grelhado',     '11111111-0000-0000-0000-000000000001', 219, 28.0, 0.0, 11.2, 0.0, 'grelhado'),
  ('Alcatra bovina grelhada',                'Alcatra grelhada',     '11111111-0000-0000-0000-000000000001', 214, 29.0, 0.0, 10.2, 0.0, 'grelhada'),
  ('Músculo bovino cozido',                  'Músculo cozido',       '11111111-0000-0000-0000-000000000001', 218, 30.6, 0.0,  9.8, 0.0, 'cozido'),
  ('Carne moída (patinho) grelhada',         'Carne moída',          '11111111-0000-0000-0000-000000000001', 215, 27.5, 0.0, 11.0, 0.0, 'grelhada'),
  ('Contrafilé bovino grelhado',             'Contrafilé grelhado',  '11111111-0000-0000-0000-000000000001', 223, 27.8, 0.0, 12.0, 0.0, 'grelhado'),
  ('Filé mignon bovino grelhado',            'Filé mignon',          '11111111-0000-0000-0000-000000000001', 211, 29.3, 0.0,  9.8, 0.0, 'grelhado'),
  ('Tilápia grelhada',                       'Tilápia grelhada',     '11111111-0000-0000-0000-000000000001', 128, 26.0, 0.0,  2.7, 0.0, 'grelhada'),
  ('Salmão grelhado',                        'Salmão grelhado',      '11111111-0000-0000-0000-000000000001', 208, 25.4, 0.0, 11.5, 0.0, 'grelhado'),
  ('Atum em água (enlatado)',                'Atum em água',         '11111111-0000-0000-0000-000000000001', 132, 29.0, 0.0,  1.0, 0.0, 'enlatado'),
  ('Sardinha assada',                        'Sardinha assada',      '11111111-0000-0000-0000-000000000001', 215, 27.0, 0.0, 11.5, 0.0, 'assada'),
  ('Camarão cozido',                         'Camarão cozido',       '11111111-0000-0000-0000-000000000001', 90,  19.4, 0.0,  1.1, 0.0, 'cozido'),
  ('Ovo inteiro cozido',                     'Ovo cozido',           '11111111-0000-0000-0000-000000000001', 146, 13.3, 0.6, 10.0, 0.0, 'cozido'),
  ('Ovo inteiro mexido',                     'Ovo mexido',           '11111111-0000-0000-0000-000000000001', 155, 12.8, 0.8, 11.2, 0.0, 'mexido'),
  ('Clara de ovo cozida',                    'Clara cozida',         '11111111-0000-0000-0000-000000000001', 52,  11.1, 0.7,  0.2, 0.0, 'cozida'),
  ('Peru (peito) grelhado',                  'Peru grelhado',        '11111111-0000-0000-0000-000000000001', 159, 29.9, 0.0,  3.7, 0.0, 'grelhado'),
  ('Porco (lombo) grelhado',                 'Lombo suíno',          '11111111-0000-0000-0000-000000000001', 200, 26.0, 0.0,  9.7, 0.0, 'grelhado'),
  ('Moela de frango cozida',                 'Moela cozida',         '11111111-0000-0000-0000-000000000001', 130, 25.6, 0.0,  2.7, 0.0, 'cozida'),
  ('Fígado de galinha cozido',               'Fígado galinha',       '11111111-0000-0000-0000-000000000001', 136, 24.4, 1.0,  3.9, 0.0, 'cozido'),
  ('Fígado de boi cozido',                   'Fígado bovino',        '11111111-0000-0000-0000-000000000001', 155, 26.5, 4.0,  3.8, 0.0, 'cozido'),
  ('Coração de frango cozido',               'Coração frango',       '11111111-0000-0000-0000-000000000001', 185, 28.6, 0.1,  7.5, 0.0, 'cozido'),
  ('Bacalhau dessalgado cozido',             'Bacalhau cozido',      '11111111-0000-0000-0000-000000000001', 136, 29.2, 0.0,  1.7, 0.0, 'cozido'),
  ('Frango (sobrecoxa sem pele) cozida',     'Sobrecoxa cozida',     '11111111-0000-0000-0000-000000000001', 185, 26.0, 0.0,  8.7, 0.0, 'cozida'),
  ('Carne suína (costela) assada',           'Costela suína',        '11111111-0000-0000-0000-000000000001', 282, 23.0, 0.0, 20.5, 0.0, 'assada'),
  ('Linguiça de frango grelhada',            'Linguiça frango',      '11111111-0000-0000-0000-000000000001', 220, 18.0, 2.0, 15.5, 0.0, 'grelhada'),
  ('Cação grelhado',                         'Cação grelhado',       '11111111-0000-0000-0000-000000000001', 120, 25.0, 0.0,  1.8, 0.0, 'grelhado'),
  ('Merluza grelhada',                       'Merluza grelhada',     '11111111-0000-0000-0000-000000000001', 110, 23.0, 0.0,  1.5, 0.0, 'grelhada'),
  ('Frango (asa) assada sem pele',           'Asa de frango',        '11111111-0000-0000-0000-000000000001', 210, 26.5, 0.0, 11.0, 0.0, 'assada'),
  ('Patinho bovino cozido',                  'Patinho cozido',       '11111111-0000-0000-0000-000000000001', 199, 30.0, 0.0,  8.2, 0.0, 'cozido'),
  ('Frango (peito) à milanesa assado',       'Frango milanesa',      '11111111-0000-0000-0000-000000000001', 195, 25.0, 8.0,  6.5, 0.4, 'assado'),
  ('Robalo grelhado',                        'Robalo grelhado',      '11111111-0000-0000-0000-000000000001', 140, 28.0, 0.0,  2.8, 0.0, 'grelhado'),
  ('Lagostim cozido',                        'Lagostim cozido',      '11111111-0000-0000-0000-000000000001', 90,  19.0, 0.0,  1.3, 0.0, 'cozido'),
  ('Peixe (espada) grelhado',                'Peixe espada',         '11111111-0000-0000-0000-000000000001', 118, 24.5, 0.0,  2.1, 0.0, 'grelhado');

-- ============================================================
-- CARBOIDRATOS (29 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Arroz branco cozido',                    'Arroz branco',         '11111111-0000-0000-0000-000000000002', 128, 2.5, 28.1,  0.2, 0.2, 'cozido'),
  ('Arroz integral cozido',                  'Arroz integral',       '11111111-0000-0000-0000-000000000002', 124, 2.6, 25.8,  1.0, 1.8, 'cozido'),
  ('Batata doce cozida',                     'Batata doce',          '11111111-0000-0000-0000-000000000002', 77,  1.4, 18.4,  0.1, 2.2, 'cozida'),
  ('Batata inglesa cozida',                  'Batata inglesa',       '11111111-0000-0000-0000-000000000002', 52,  1.2, 11.9,  0.1, 1.2, 'cozida'),
  ('Macarrão cozido (espaguete integral)',   'Macarrão integral',    '11111111-0000-0000-0000-000000000002', 124, 5.3, 23.2,  1.1, 3.5, 'cozido'),
  ('Macarrão cozido (espaguete branco)',     'Macarrão branco',      '11111111-0000-0000-0000-000000000002', 131, 4.7, 26.2,  0.7, 1.8, 'cozido'),
  ('Mandioca cozida',                        'Mandioca cozida',      '11111111-0000-0000-0000-000000000002', 125, 0.9, 29.8,  0.3, 1.4, 'cozida'),
  ('Inhame cozido',                          'Inhame cozido',        '11111111-0000-0000-0000-000000000002', 103, 1.5, 24.6,  0.2, 3.5, 'cozido'),
  ('Cará cozido',                            'Cará cozido',          '11111111-0000-0000-0000-000000000002', 98,  1.6, 23.2,  0.2, 3.3, 'cozido'),
  ('Tapioca (hidratada)',                    'Tapioca',              '11111111-0000-0000-0000-000000000002', 130, 0.2, 32.0,  0.1, 0.0, 'hidratada'),
  ('Cuscuz milho cozido',                    'Cuscuz',               '11111111-0000-0000-0000-000000000002', 94,  2.0, 21.0,  0.5, 1.2, 'cozido'),
  ('Milho verde cozido',                     'Milho verde',          '11111111-0000-0000-0000-000000000002', 87,  2.7, 18.7,  1.3, 2.0, 'cozido'),
  ('Aveia em flocos',                        'Aveia flocos',         '11111111-0000-0000-0000-000000000002', 394, 13.9, 66.6,  8.5, 9.1, 'crua'),
  ('Quinoa cozida',                          'Quinoa cozida',        '11111111-0000-0000-0000-000000000002', 120, 4.4, 21.3,  1.9, 2.8, 'cozida'),
  ('Pão francês',                            'Pão francês',          '11111111-0000-0000-0000-000000000002', 300, 8.0, 58.5,  3.1, 2.3, 'assado'),
  ('Pão integral',                           'Pão integral',         '11111111-0000-0000-0000-000000000002', 253, 8.0, 47.0,  3.5, 6.9, 'assado'),
  ('Batata baroa (mandioquinha) cozida',     'Mandioquinha',         '11111111-0000-0000-0000-000000000002', 87,  1.7, 20.5,  0.2, 2.2, 'cozida'),
  ('Macarrão arroz cozido',                  'Macarrão arroz',       '11111111-0000-0000-0000-000000000002', 119, 1.8, 27.0,  0.2, 0.4, 'cozido'),
  ('Granola tradicional',                    'Granola',              '11111111-0000-0000-0000-000000000002', 408, 9.6, 64.3, 13.4, 6.5, 'pronto'),
  ('Biscoito de arroz integral',             'Biscoito arroz',       '11111111-0000-0000-0000-000000000002', 377, 7.0, 82.1,  2.0, 2.0, 'pronto'),
  ('Farinha de mandioca torrada',            'Farinha mandioca',     '11111111-0000-0000-0000-000000000002', 361, 1.6, 87.3,  0.3, 6.4, 'torrada'),
  ('Canjica branca cozida',                  'Canjica cozida',       '11111111-0000-0000-0000-000000000002', 185, 4.3, 42.5,  0.8, 2.0, 'cozida'),
  ('Pipoca sem sal (estourada)',             'Pipoca',               '11111111-0000-0000-0000-000000000002', 375, 9.0, 74.0,  4.6, 9.9, 'estourada'),
  ('Polenta cozida',                         'Polenta cozida',       '11111111-0000-0000-0000-000000000002', 70,  1.6, 14.9,  0.4, 1.0, 'cozida'),
  ('Macarrão lentilha cozido',               'Macarrão lentilha',    '11111111-0000-0000-0000-000000000002', 128, 8.0, 22.0,  1.0, 3.0, 'cozido'),
  ('Angu (fubá cozido)',                     'Angu',                 '11111111-0000-0000-0000-000000000002', 71,  1.8, 15.6,  0.5, 1.0, 'cozido'),
  ('Banana da terra cozida',                 'Banana da terra',      '11111111-0000-0000-0000-000000000002', 116, 1.1, 30.0,  0.2, 2.3, 'cozida'),
  ('Abóbora moranga cozida',                 'Abóbora moranga',      '11111111-0000-0000-0000-000000000002', 26,  1.1,  6.0,  0.1, 0.5, 'cozida'),
  ('Batata-doce roxa cozida',                'Batata roxa',          '11111111-0000-0000-0000-000000000002', 80,  1.5, 19.5,  0.1, 2.5, 'cozida');

-- ============================================================
-- FRUTAS (27 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Banana nanica',                          'Banana nanica',        '11111111-0000-0000-0000-000000000003', 92,  1.4, 23.8,  0.1, 2.0, 'crua'),
  ('Maçã (com casca)',                       'Maçã',                 '11111111-0000-0000-0000-000000000003', 56,  0.3, 15.2,  0.1, 1.3, 'crua'),
  ('Laranja pera',                           'Laranja',              '11111111-0000-0000-0000-000000000003', 37,  0.9,  8.9,  0.1, 0.8, 'crua'),
  ('Mamão papaia',                           'Mamão',                '11111111-0000-0000-0000-000000000003', 40,  0.5, 10.4,  0.1, 1.8, 'cru'),
  ('Manga palmer',                           'Manga',                '11111111-0000-0000-0000-000000000003', 64,  0.9, 17.0,  0.3, 1.6, 'crua'),
  ('Abacaxi',                                'Abacaxi',              '11111111-0000-0000-0000-000000000003', 48,  0.9, 12.3,  0.1, 1.0, 'cru'),
  ('Morango',                                'Morango',              '11111111-0000-0000-0000-000000000003', 30,  0.8,  7.1,  0.3, 1.4, 'cru'),
  ('Melancia',                               'Melancia',             '11111111-0000-0000-0000-000000000003', 32,  0.6,  7.9,  0.2, 0.3, 'crua'),
  ('Melão',                                  'Melão',                '11111111-0000-0000-0000-000000000003', 29,  0.7,  7.5,  0.1, 0.3, 'cru'),
  ('Uva comum',                              'Uva',                  '11111111-0000-0000-0000-000000000003', 69,  0.7, 17.9,  0.5, 0.9, 'crua'),
  ('Pêra',                                   'Pêra',                 '11111111-0000-0000-0000-000000000003', 55,  0.4, 14.8,  0.1, 2.2, 'crua'),
  ('Pêssego',                                'Pêssego',              '11111111-0000-0000-0000-000000000003', 43,  0.9, 10.2,  0.1, 1.2, 'cru'),
  ('Kiwi',                                   'Kiwi',                 '11111111-0000-0000-0000-000000000003', 61,  1.0, 14.0,  0.6, 2.7, 'cru'),
  ('Mirtilo (blueberry)',                    'Mirtilo',              '11111111-0000-0000-0000-000000000003', 57,  0.7, 14.5,  0.3, 2.4, 'cru'),
  ('Framboesa',                              'Framboesa',            '11111111-0000-0000-0000-000000000003', 52,  1.2, 11.9,  0.7, 6.5, 'crua'),
  ('Amora',                                  'Amora',                '11111111-0000-0000-0000-000000000003', 43,  1.4,  9.6,  0.5, 5.3, 'crua'),
  ('Maracujá (polpa)',                       'Maracujá',             '11111111-0000-0000-0000-000000000003', 68,  2.4, 13.4,  1.9, 1.0, 'cru'),
  ('Caju',                                   'Caju',                 '11111111-0000-0000-0000-000000000003', 43,  1.0, 10.0,  0.3, 1.7, 'cru'),
  ('Goiaba vermelha',                        'Goiaba',               '11111111-0000-0000-0000-000000000003', 54,  2.6, 10.5,  0.9, 6.2, 'crua'),
  ('Limão (suco)',                           'Limão',                '11111111-0000-0000-0000-000000000003', 30,  1.0,  7.9,  0.3, 0.3, 'cru'),
  ('Acerola',                                'Acerola',              '11111111-0000-0000-0000-000000000003', 33,  0.8,  7.7,  0.3, 1.5, 'crua'),
  ('Banana prata',                           'Banana prata',         '11111111-0000-0000-0000-000000000003', 98,  1.4, 26.0,  0.1, 2.0, 'crua'),
  ('Abacate',                                'Abacate',              '11111111-0000-0000-0000-000000000003', 160, 1.9,  8.5, 14.3, 6.7, 'cru'),
  ('Coco ralado (seco sem açúcar)',          'Coco ralado',          '11111111-0000-0000-0000-000000000003', 592, 5.6, 23.7, 57.2, 13.7,'seco'),
  ('Tâmara',                                 'Tâmara',               '11111111-0000-0000-0000-000000000003', 282, 2.5, 75.0,  0.4, 8.0, 'seca'),
  ('Ameixa fresca',                          'Ameixa',               '11111111-0000-0000-0000-000000000003', 46,  0.7, 11.4,  0.3, 1.4, 'fresca'),
  ('Pitanga',                                'Pitanga',              '11111111-0000-0000-0000-000000000003', 33,  0.8,  7.5,  0.4, 0.5, 'crua');

-- ============================================================
-- GORDURAS (16 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Azeite de oliva extravirgem',            'Azeite',               '11111111-0000-0000-0000-000000000004', 884, 0.0,  0.0, 100.0, 0.0, 'cru'),
  ('Óleo de coco',                           'Óleo de coco',         '11111111-0000-0000-0000-000000000004', 862, 0.0,  0.0,  99.1, 0.0, 'cru'),
  ('Abacate (fruto)',                        'Abacate',              '11111111-0000-0000-0000-000000000004', 160, 1.9,  8.5,  14.3, 6.7, 'cru'),
  ('Manteiga sem sal',                       'Manteiga',             '11111111-0000-0000-0000-000000000004', 726, 0.6,  0.1,  80.5, 0.0, 'crua'),
  ('Amendoim torrado sem sal',               'Amendoim',             '11111111-0000-0000-0000-000000000004', 579, 24.4, 21.5, 44.0, 8.5, 'torrado'),
  ('Amêndoa torrada sem sal',                'Amêndoa',              '11111111-0000-0000-0000-000000000004', 575, 21.3, 19.7, 47.4, 11.8,'torrada'),
  ('Castanha de caju torrada sem sal',       'Castanha caju',        '11111111-0000-0000-0000-000000000004', 574, 18.5, 32.7, 43.9, 3.0, 'torrada'),
  ('Castanha-do-Pará',                       'Castanha-do-Pará',     '11111111-0000-0000-0000-000000000004', 656, 14.3, 15.1, 63.5, 7.5, 'crua'),
  ('Nozes',                                  'Nozes',                '11111111-0000-0000-0000-000000000004', 620, 14.3, 13.7, 58.9, 4.6, 'cruas'),
  ('Pasta de amendoim integral',             'Pasta amendoim',       '11111111-0000-0000-0000-000000000004', 588, 25.8, 20.3, 46.8, 8.8, 'crua'),
  ('Chia (semente)',                         'Chia',                 '11111111-0000-0000-0000-000000000004', 489, 16.5, 42.1, 30.7, 34.4,'crua'),
  ('Linhaça dourada',                        'Linhaça',              '11111111-0000-0000-0000-000000000004', 495, 19.5, 28.9, 37.1, 27.3,'crua'),
  ('Gergelim torrado',                       'Gergelim',             '11111111-0000-0000-0000-000000000004', 573, 17.7, 23.4, 49.7, 11.6,'torrado'),
  ('Óleo de girassol',                       'Óleo girassol',        '11111111-0000-0000-0000-000000000004', 884, 0.0,  0.0, 100.0, 0.0, 'cru'),
  ('Pistache torrado sem sal',               'Pistache',             '11111111-0000-0000-0000-000000000004', 560, 20.6, 27.5, 45.4, 10.3,'torrado'),
  ('Tahine (pasta de gergelim)',             'Tahine',               '11111111-0000-0000-0000-000000000004', 595, 17.0, 21.2, 53.8, 9.3, 'cru');

-- ============================================================
-- DOCES E SOBREMESAS (10 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Chocolate ao leite (30% cacau)',         'Chocolate ao leite',   '11111111-0000-0000-0000-000000000005', 535, 7.3, 59.4, 30.4, 0.7, 'pronto'),
  ('Chocolate meio amargo (50% cacau)',      'Choc. 50% cacau',      '11111111-0000-0000-0000-000000000005', 536, 7.5, 53.3, 33.0, 3.2, 'pronto'),
  ('Chocolate amargo (70% cacau)',           'Choc. 70% cacau',      '11111111-0000-0000-0000-000000000005', 598, 7.8, 45.9, 42.6, 8.0, 'pronto'),
  ('Chocolate branco',                       'Chocolate branco',     '11111111-0000-0000-0000-000000000005', 539, 6.9, 57.1, 32.1, 0.2, 'pronto'),
  ('Mel de abelha',                          'Mel',                  '11111111-0000-0000-0000-000000000005', 309, 0.3, 84.0,  0.0, 0.2, 'cru'),
  ('Brigadeiro (tradicional)',               'Brigadeiro',           '11111111-0000-0000-0000-000000000005', 430, 5.0, 66.0, 17.0, 0.2, 'pronto'),
  ('Sorvete de creme (baunilha)',            'Sorvete baunilha',     '11111111-0000-0000-0000-000000000005', 201, 3.5, 23.6, 10.6, 0.0, 'gelado'),
  ('Goiabada (pasta)',                       'Goiabada',             '11111111-0000-0000-0000-000000000005', 264, 0.5, 68.6,  0.1, 1.6, 'pronta'),
  ('Pudim de leite condensado',              'Pudim',                '11111111-0000-0000-0000-000000000005', 231, 6.0, 36.0,  7.5, 0.0, 'pronto'),
  ('Achocolatado em pó (Nescau)',            'Achocolatado',         '11111111-0000-0000-0000-000000000005', 380, 5.2, 78.6,  5.2, 3.5, 'em pó');

-- ============================================================
-- LATICÍNIOS E DERIVADOS (19 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Leite integral',                         'Leite integral',       '11111111-0000-0000-0000-000000000006', 61,  3.2,  4.5,  3.3, 0.0, 'líquido'),
  ('Leite desnatado',                        'Leite desnatado',      '11111111-0000-0000-0000-000000000006', 35,  3.4,  4.9,  0.1, 0.0, 'líquido'),
  ('Iogurte natural integral',               'Iogurte natural',      '11111111-0000-0000-0000-000000000006', 61,  3.5,  4.7,  3.0, 0.0, 'pronto'),
  ('Iogurte grego integral',                 'Iogurte grego',        '11111111-0000-0000-0000-000000000006', 97,  9.0,  3.6,  5.0, 0.0, 'pronto'),
  ('Iogurte desnatado natural',              'Iogurte desnatado',    '11111111-0000-0000-0000-000000000006', 37,  4.0,  5.0,  0.1, 0.0, 'pronto'),
  ('Queijo minas frescal',                   'Queijo minas',         '11111111-0000-0000-0000-000000000006', 264, 17.4,  3.4, 20.2, 0.0, 'fresco'),
  ('Queijo cottage',                         'Queijo cottage',       '11111111-0000-0000-0000-000000000006', 98,  11.1,  3.4,  4.3, 0.0, 'fresco'),
  ('Queijo parmesão ralado',                 'Parmesão',             '11111111-0000-0000-0000-000000000006', 393, 35.8,  3.2, 26.0, 0.0, 'ralado'),
  ('Queijo mussarela',                       'Mussarela',            '11111111-0000-0000-0000-000000000006', 335, 24.3,  2.4, 25.6, 0.0, 'pronto'),
  ('Queijo ricota',                          'Ricota',               '11111111-0000-0000-0000-000000000006', 174, 11.0,  3.8, 13.0, 0.0, 'fresca'),
  ('Requeijão cremoso',                      'Requeijão',            '11111111-0000-0000-0000-000000000006', 245, 7.3,  3.3, 23.0, 0.0, 'pronto'),
  ('Leite de vaca evaporado',                'Leite evaporado',      '11111111-0000-0000-0000-000000000006', 135, 6.8, 10.0,  7.6, 0.0, 'líquido'),
  ('Leite condensado',                       'Leite condensado',     '11111111-0000-0000-0000-000000000006', 321, 7.4, 54.7,  8.2, 0.0, 'líquido'),
  ('Creme de leite',                         'Creme de leite',       '11111111-0000-0000-0000-000000000006', 213, 2.7,  3.4, 22.0, 0.0, 'líquido'),
  ('Queijo coalho grelhado',                 'Queijo coalho',        '11111111-0000-0000-0000-000000000006', 329, 23.0,  1.8, 25.5, 0.0, 'grelhado'),
  ('Whey protein (concentrado)',             'Whey protein',         '11111111-0000-0000-0000-000000000006', 373, 76.8, 10.0,  4.4, 0.0, 'em pó'),
  ('Kefir integral',                         'Kefir',                '11111111-0000-0000-0000-000000000006', 65,  3.3,  4.8,  3.5, 0.0, 'líquido'),
  ('Leite de cabra',                         'Leite de cabra',       '11111111-0000-0000-0000-000000000006', 69,  3.6,  4.5,  4.1, 0.0, 'líquido'),
  ('Queijo brie',                            'Queijo brie',          '11111111-0000-0000-0000-000000000006', 334, 20.7,  0.5, 27.7, 0.0, 'fresco');

-- ============================================================
-- VEGETAIS E LEGUMES (23 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Brócolis cozido',                        'Brócolis',             '11111111-0000-0000-0000-000000000007', 25,  2.9,  3.5,  0.3, 2.2, 'cozido'),
  ('Espinafre cozido',                       'Espinafre',            '11111111-0000-0000-0000-000000000007', 23,  2.9,  3.5,  0.3, 2.4, 'cozido'),
  ('Couve-flor cozida',                      'Couve-flor',           '11111111-0000-0000-0000-000000000007', 21,  2.0,  3.5,  0.2, 2.0, 'cozida'),
  ('Cenoura cozida',                         'Cenoura',              '11111111-0000-0000-0000-000000000007', 41,  0.9,  9.5,  0.2, 3.0, 'cozida'),
  ('Abobrinha cozida',                       'Abobrinha',            '11111111-0000-0000-0000-000000000007', 18,  1.1,  3.5,  0.3, 1.0, 'cozida'),
  ('Chuchu cozido',                          'Chuchu',               '11111111-0000-0000-0000-000000000007', 22,  0.9,  5.1,  0.1, 1.3, 'cozido'),
  ('Berinjela cozida',                       'Berinjela',            '11111111-0000-0000-0000-000000000007', 24,  0.8,  5.7,  0.2, 2.5, 'cozida'),
  ('Vagem cozida',                           'Vagem',                '11111111-0000-0000-0000-000000000007', 28,  1.8,  5.8,  0.2, 2.7, 'cozida'),
  ('Tomate cru',                             'Tomate',               '11111111-0000-0000-0000-000000000007', 15,  0.9,  3.1,  0.2, 1.2, 'cru'),
  ('Alface americana crua',                  'Alface',               '11111111-0000-0000-0000-000000000007', 12,  1.2,  2.1,  0.2, 1.3, 'crua'),
  ('Pepino cru',                             'Pepino',               '11111111-0000-0000-0000-000000000007', 13,  0.7,  2.7,  0.1, 0.5, 'cru'),
  ('Couve-manteiga cozida',                  'Couve-manteiga',       '11111111-0000-0000-0000-000000000007', 27,  2.9,  4.0,  0.5, 2.0, 'cozida'),
  ('Beterraba cozida',                       'Beterraba',            '11111111-0000-0000-0000-000000000007', 43,  1.7,  9.6,  0.1, 2.0, 'cozida'),
  ('Pimentão verde cru',                     'Pimentão verde',       '11111111-0000-0000-0000-000000000007', 20,  0.9,  4.6,  0.2, 1.5, 'cru'),
  ('Pimentão vermelho cru',                  'Pimentão vermelho',    '11111111-0000-0000-0000-000000000007', 27,  1.0,  6.3,  0.3, 2.1, 'cru'),
  ('Repolho cozido',                         'Repolho',              '11111111-0000-0000-0000-000000000007', 20,  1.3,  4.3,  0.1, 2.3, 'cozido'),
  ('Pepino japonês cru',                     'Pepino japonês',       '11111111-0000-0000-0000-000000000007', 14,  0.7,  2.9,  0.1, 0.6, 'cru'),
  ('Rúcula crua',                            'Rúcula',               '11111111-0000-0000-0000-000000000007', 25,  2.6,  3.7,  0.7, 1.6, 'crua'),
  ('Ervilha cozida',                         'Ervilha',              '11111111-0000-0000-0000-000000000007', 68,  4.8, 12.5,  0.4, 4.5, 'cozida'),
  ('Quiabo cozido',                          'Quiabo',               '11111111-0000-0000-0000-000000000007', 28,  1.8,  6.0,  0.1, 3.2, 'cozido'),
  ('Cebola crua',                            'Cebola',               '11111111-0000-0000-0000-000000000007', 40,  1.2,  9.4,  0.1, 1.7, 'crua'),
  ('Alho cru',                               'Alho',                 '11111111-0000-0000-0000-000000000007', 149, 6.4, 33.1,  0.5, 2.1, 'cru'),
  ('Aspargo cozido',                         'Aspargo',              '11111111-0000-0000-0000-000000000007', 22,  2.4,  3.9,  0.2, 2.1, 'cozido');

-- ============================================================
-- PROTEÍNAS VEGETAIS (18 itens)
-- ============================================================
INSERT INTO public.foods (name, name_short, category_id, calories, protein, carbohydrates, fat, fiber, preparation) VALUES
  ('Feijão preto cozido',                    'Feijão preto',         '11111111-0000-0000-0000-000000000008', 77,  4.5, 14.0,  0.5, 8.4, 'cozido'),
  ('Feijão carioca cozido',                  'Feijão carioca',       '11111111-0000-0000-0000-000000000008', 76,  4.8, 13.6,  0.5, 8.5, 'cozido'),
  ('Lentilha cozida',                        'Lentilha cozida',      '11111111-0000-0000-0000-000000000008', 116, 9.0, 20.1,  0.4, 7.9, 'cozida'),
  ('Grão-de-bico cozido',                    'Grão-de-bico',         '11111111-0000-0000-0000-000000000008', 164, 8.9, 27.4,  2.6, 7.6, 'cozido'),
  ('Tofu firme cru',                         'Tofu',                 '11111111-0000-0000-0000-000000000008', 76,  8.1,  1.9,  4.2, 0.3, 'cru'),
  ('Edamame cozido',                         'Edamame',              '11111111-0000-0000-0000-000000000008', 122, 11.9, 8.9,  5.2, 5.2, 'cozido'),
  ('Soja (grão) cozida',                     'Soja cozida',          '11111111-0000-0000-0000-000000000008', 173, 16.6,  9.9,  9.0, 6.0, 'cozida'),
  ('Proteína texturizada de soja (PTS) hidratada', 'PTS hidratada',  '11111111-0000-0000-0000-000000000008', 55,  8.5,  4.2,  0.5, 3.5, 'hidratada'),
  ('Feijão fradinho cozido',                 'Feijão fradinho',      '11111111-0000-0000-0000-000000000008', 108, 7.7, 19.2,  0.6, 6.8, 'cozido'),
  ('Ervilha seca cozida',                    'Ervilha seca',         '11111111-0000-0000-0000-000000000008', 84,  5.4, 15.1,  0.4, 5.5, 'cozida'),
  ('Feijão verde cozido',                    'Feijão verde',         '11111111-0000-0000-0000-000000000008', 49,  3.1,  9.2,  0.2, 3.4, 'cozido'),
  ('Seitan (glúten de trigo)',               'Seitan',               '11111111-0000-0000-0000-000000000008', 120, 25.0,  2.0,  1.9, 0.6, 'cozido'),
  ('Tempeh cozido',                          'Tempeh',               '11111111-0000-0000-0000-000000000008', 192, 20.3,  9.4, 10.8, 0.0, 'cozido'),
  ('Leite de soja (sem açúcar)',             'Leite de soja',        '11111111-0000-0000-0000-000000000008', 43,  3.5,  3.0,  1.8, 0.6, 'líquido'),
  ('Feijão branco cozido',                   'Feijão branco',        '11111111-0000-0000-0000-000000000008', 139, 9.7, 25.1,  0.4, 6.3, 'cozido'),
  ('Amendoim torrado (sem sal)',             'Amendoim',             '11111111-0000-0000-0000-000000000008', 579, 24.4, 21.5, 44.0, 8.5, 'torrado'),
  ('Caju (castanha crua)',                   'Castanha de caju',     '11111111-0000-0000-0000-000000000008', 553, 18.2, 30.2, 43.9, 3.0, 'crua'),
  ('Quinoa cozida',                          'Quinoa',               '11111111-0000-0000-0000-000000000008', 120, 4.4, 21.3,  1.9, 2.8, 'cozida');

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT
  fc.name AS categoria,
  COUNT(f.id) AS total_alimentos
FROM public.food_categories fc
LEFT JOIN public.foods f ON f.category_id = fc.id
GROUP BY fc.name, fc.sort_order
ORDER BY fc.sort_order;
