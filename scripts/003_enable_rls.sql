-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (single-user system)
-- Categories policies
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to categories" ON categories FOR DELETE USING (true);

-- Sizes policies
CREATE POLICY "Allow public read access to sizes" ON sizes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to sizes" ON sizes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to sizes" ON sizes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to sizes" ON sizes FOR DELETE USING (true);

-- Products policies
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to products" ON products FOR DELETE USING (true);

-- Product variants policies
CREATE POLICY "Allow public read access to product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to product_variants" ON product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to product_variants" ON product_variants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to product_variants" ON product_variants FOR DELETE USING (true);

-- Sales policies
CREATE POLICY "Allow public read access to sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to sales" ON sales FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to sales" ON sales FOR DELETE USING (true);

-- Fixed costs policies
CREATE POLICY "Allow public read access to fixed_costs" ON fixed_costs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to fixed_costs" ON fixed_costs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to fixed_costs" ON fixed_costs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to fixed_costs" ON fixed_costs FOR DELETE USING (true);

-- Variable costs policies
CREATE POLICY "Allow public read access to variable_costs" ON variable_costs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to variable_costs" ON variable_costs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to variable_costs" ON variable_costs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to variable_costs" ON variable_costs FOR DELETE USING (true);
