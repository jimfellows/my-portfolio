-- Database Initialization
-- Run these commands as a superuser (e.g., 'postgres') before running the app scripts.

-- 1. Create the Database
CREATE DATABASE my_portfolio_db;

-- 2. Create the App User
-- IMPORTANT: Set a strong password for this user!
-- CREATE USER my_portfolio_app_user WITH LOGIN PASSWORD 'your_secure_password';
CREATE USER my_portfolio_app_user WITH LOGIN;

-- 3. Connect to the Database
-- \c my_portfolio_db

-- 4. Create the Schema
CREATE SCHEMA my_portfolio;

-- 5. Grant Permissions
-- Grant usage on schema
GRANT USAGE ON SCHEMA my_portfolio TO my_portfolio_app_user;
-- Make the app user the owner of the schema
ALTER SCHEMA my_portfolio OWNER TO my_portfolio_app_user;

-- 6. Enable Vector Extension (Needs Superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- 7. Grant connect to database (if not implicit)
GRANT CONNECT ON DATABASE my_portfolio_db TO my_portfolio_app_user;

-- NOTE: Ensure your .env.local POSTGRES_URL matches these credentials:
-- POSTGRES_URL=postgresql://my_portfolio_app_user:your_secure_password@localhost:5432/my_portfolio_db?schema=my_portfolio
