-- db_create.sql
-- Mostly borrowed from phpMyAdmin output

CREATE DATABASE sandbox;

CREATE USER 'sandbox'@'localhost' IDENTIFIED BY '***';

GRANT USAGE ON * . * TO 'sandbox'@'localhost' IDENTIFIED BY '***' WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0 ;

GRANT ALL PRIVILEGES ON `sandbox` . * TO 'sandbox'@'localhost';