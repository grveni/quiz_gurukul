-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO :db_user;

-- Grant privileges to create objects in the schema
GRANT CREATE ON SCHEMA public TO :db_user;

-- Grant all privileges on all tables in the schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO :db_user;

-- Grant all privileges on all sequences in the schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO :db_user;

-- Grant all privileges on all functions in the schema
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO :db_user;
