-- 1. Enable RLS on the products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy for the 'products' table
-- This policy allows users to SELECT products only if they are associated with the same client
-- via the 'client_products' junction table and their own entry in the 'profiles' table.

CREATE POLICY "Users can only view products assigned to their client"
ON products
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT product_id
    FROM client_products cp
    JOIN profiles p ON p.client_id = cp.client_id
    WHERE p.id = auth.uid()
  )
);

-- Note: Ensure that RLS is also enabled on 'profiles' and 'client_products' 
-- if you want to be fully secure, but this policy specifically secures the 'products' table.
