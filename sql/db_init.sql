-- db_init.sql
-- Creates the basic tables and initial content for dojo-sandbox
-- Run the db_create.sql script first to create the database and user.
-- *** WARNING *** this will obliterate your database!

-- To check indexes: SHOW INDEX FROM <tblname>

-- use sandbox; -- make sure we're operating on the correct database.

-- users stores information about each user known to the system
DROP TABLE IF EXISTS user;
CREATE TABLE user (
  id int NOT NULL AUTO_INCREMENT,
  username VARCHAR(20) NOT NULL,         -- unique username
  password VARCHAR(20) NOT NULL,         -- hashed password
  token VARCHAR(100) NULL,               -- security token, known when logged in
  token_last_modified DATETIME NOT NULL, -- modified timestamp for token
  role VARCHAR(10) NOT NULL,             -- e.g. 'user', 'admin'
  first_name TINYTEXT NOT NULL,
  last_name TINYTEXT NOT NULL,
  email TINYTEXT NOT NULL,
  created DATETIME NOT NULL,
  last_modified DATETIME NOT NULL,
  primary key (id),
  INDEX (username)
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

ALTER TABLE user ADD COLUMN token VARCHAR(100) NULL;
ALTER TABLE user ADD COLUMN token_last_modified DATETIME NOT NULL;

-- bucket is the master identity table for each bucket
DROP TABLE IF EXISTS bucket;
CREATE TABLE bucket (
  namespace VARCHAR(20) NOT NULL, -- fk to users.username
  id VARCHAR(10) NOT NULL,        -- unique id of this bucket, in its namespace
  name TINYTEXT NOT NULL,         -- free text name of bucket
  description TEXT NOT NULL,      -- free text longer description of bucket
  latest_version int NOT NULL,    -- refers to bucket_version.version
  created DATETIME NOT NULL,
  last_modified DATETIME NOT NULL,
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
  layers TEXT NOT NULL,                  -- '##' separated layer names
  created DATETIME NOT NULL,
  last_modified DATETIME NOT NULL,
  primary key (bucket_namespace, bucket_id, version)
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

-- alter table bucket_version add column layers TEXT not null;

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
  created DATETIME NOT NULL,
  last_modified DATETIME NOT NULL,
  primary key (id)
) ENGINE= MyISAM DEFAULT CHARSET = UTF8;

-- INITIAL DATA

INSERT INTO user (username, password, created, last_modified, role, first_name, last_name, email) VALUES
('public', 'password', NOW(), NOW(), 'user', 'Public', 'User', '');

INSERT INTO bucket (namespace, id, name, description, created, last_modified, latest_version)
VALUES
('public', '1234', 'Test bucket', 'This is a test', NOW(), NOW(), 0);

INSERT INTO bucket_version (created, last_modified, bucket_namespace, bucket_id, version, dojo_version, content_html, content_js, content_css, dj_config, layers)
VALUES
(NOW(), NOW(), 'public', '1234', '0', '1.5.0-nooptimize',
'<div dojoType="dijit.form.TextBox" id="tb"></div>',
'dojo.require("dijit.form.TextBox"); dojo.ready(function() {   dijit.byId("tb").set("value", "dynamically set"); });',
'', 'parseOnLoad: true', 'dijit-all');

-- Update 26 Jun 2011
ALTER TABLE bucket_resource ADD COLUMN created DATETIME NOT NULL;
ALTER TABLE bucket_resource ADD COLUMN last_modified DATETIME NOT NULL;
update bucket_resource set created = now();
update bucket_resource set last_modified = now();
