-- Add department_id to designations table
ALTER TABLE designations 
ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_designations_department_id ON designations(department_id);

-- RLS Policy is already covered by "Isolate designations by organization" as long as department belongs to same org.
