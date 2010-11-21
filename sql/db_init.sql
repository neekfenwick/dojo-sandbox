-- db_init.sql
-- Creates the basic tables and initial content for dojo-sandbox
-- Run the db_create.sql script first to create the database and user.
-- *** WARNING *** this will obliterate your database!

-- To check indexes: SHOW INDEX FROM <tblname>

--use sandbox; -- make sure we're operating on the correct database.

-- users stores information about each user known to the system
DROP TABLE IF EXISTS user;
CREATE TABLE user (
  id int NOT NULL AUTO_INCREMENT,
  username VARCHAR(20) NOT NULL,   -- unique username
  role VARCHAR(10) NOT NULL,       -- e.g. 'user', 'admin'
  first_name TINYTEXT NOT NULL,
  last_name TINYTEXT NOT NULL,
  email TINYTEXT NOT NULL,
  primary key (id),
  INDEX (username)
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

-- bucket is the master identity table for each bucket
DROP TABLE IF EXISTS bucket;
CREATE TABLE bucket (
  namespace VARCHAR(20) NOT NULL, -- fk to users.username
  id VARCHAR(10) NOT NULL,        -- unique id of this bucket, in its namespace
  name TINYTEXT NOT NULL,         -- free text name of bucket
  description TEXT NOT NULL,      -- free text longer description of bucket
  latest_version int NOT NULL,    -- refers to bucket_version.version
  primary key (namespace, id)
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

-- bucket_version stores the main content of each version of each bucket
DROP TABLE IF EXISTS bucket_version;
CREATE TABLE bucket_version (
  bucket_namespace VARCHAR(20) NOT NULL, -- fk to users.username
  bucket_id VARCHAR(10) NOT NULL,        -- unique id of this bucket, in its namespace
  version int NOT NULL,
  dojo_version TINYTEXT NOT NULL,
--  resources TEXT NOT NULL,               -- '##' separated resources
  content_html TEXT NOT NULL,
  content_js TEXT NOT NULL,
  content_css TEXT NOT NULL,
  dj_config TEXT NOT NULL,
  primary key (bucket_namespace, bucket_id)
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

-- bucket_file refers to file resources stored on our server and made available
-- to each bucket by a url like http://dojo-sandbox.net/public/1234/1/JSON/test.json
DROP TABLE IF EXISTS bucket_file;
CREATE TABLE bucket_file (
  id int NOT NULL AUTO_INCREMENT,
  bucket_namespace VARCHAR(20) NOT NULL, -- fk to users.username
  bucket_id VARCHAR(10) NOT NULL, -- unique id of this bucket, in its namespace
  bucket_version int NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'html', 'json'.. used for Content-Type?
  name VARCHAR(100) NOT NULL, -- e.g. 'JSON/test.json',
  content TEXT NOT NULL,  -- the content of this resource
  primary key (id),
  INDEX (type, name) -- should this be separate indexes for type and name?
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

-- bucket_resource collects all extra resources required for a bucket to run
-- for example external css resources to be sourced.
-- They must normally exist relative to the dojo_version by the bucket version
-- e.g. 1.5.0cdn.
DROP TABLE IF EXISTS bucket_resource;
CREATE TABLE bucket_resource (
  id int NOT NULL AUTO_INCREMENT,
  bucket_namespace VARCHAR(255) NOT NULL, -- fk to users.username
  bucket_id VARCHAR(255) NOT NULL, -- unique id of this bucket, in its namespace
  bucket_version int NOT NULL,
  type TINYTEXT NOT NULL, -- 'css'
  href TINYTEXT NOT NULL, -- e.g. 'dojo/resources/dojo.css',
  primary key (id)
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

-- INITIAL DATA

INSERT INTO user (username, role, first_name, last_name, email) VALUES
('public', 'user', 'Public', 'User', '');