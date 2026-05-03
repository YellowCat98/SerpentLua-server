ALTER TABLE plugins 
ADD COLUMN status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) 
DEFAULT 'pending'; -- there are no plugins so i can just make it default to pending because it only runs once