CREATE TRIGGER IF NOT EXISTS prevent_id_update
BEFORE UPDATE OF id ON plugins
BEGIN
	SELECT RAISE(ABORT, 'id is constant.');
END;