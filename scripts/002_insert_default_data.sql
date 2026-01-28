-- Insert default categories
INSERT INTO categories (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Biquíni'),
  ('22222222-2222-2222-2222-222222222222', 'Maiô'),
  ('33333333-3333-3333-3333-333333333333', 'Saída de Praia')
ON CONFLICT DO NOTHING;

-- Insert default sizes
INSERT INTO sizes (id, name, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'P', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'M', 2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'G', 3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'GG', 4),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Tamanho Único', 5)
ON CONFLICT DO NOTHING;
