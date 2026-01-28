-- Enable Row Level Security (RLS) is applied per table below

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sizes table
CREATE TABLE IF NOT EXISTS sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size_id)
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
  size_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL, -- Renamed from 'value' to match application code
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fixed_costs table
CREATE TABLE IF NOT EXISTS fixed_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  monthly_value DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create variable_costs table
CREATE TABLE IF NOT EXISTS variable_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fixed_costs_updated_at ON fixed_costs;
CREATE TRIGGER update_fixed_costs_updated_at BEFORE UPDATE ON fixed_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_variable_costs_updated_at ON variable_costs;
CREATE TRIGGER update_variable_costs_updated_at BEFORE UPDATE ON variable_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (single-user system)
-- Note: In a real multi-user system, these would be restricted.
-- Since the user asked for a simple setup, we allow public access for now as per original scripts.

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

-- Users policies
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to users" ON users FOR DELETE USING (true);

-- Insert default user: kelyson / 123456
-- Password hash for "123456" using bcrypt
INSERT INTO users (username, password_hash) 
VALUES ('kelyson', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (username) DO NOTHING;
