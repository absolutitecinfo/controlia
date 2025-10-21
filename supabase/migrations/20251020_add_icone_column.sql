-- Adds new column 'icone' to store predefined icon identifier
ALTER TABLE agentes_ia
ADD COLUMN IF NOT EXISTS icone TEXT;

-- Optional: backfill from existing icone_url values if any (safe if column exists)
UPDATE agentes_ia
SET icone = icone_url
WHERE icone IS NULL AND icone_url IS NOT NULL;


