alter table user add column password varchar(100) NOT NULL;
alter table user add column token varchar(100) NULL;
alter table user add column token_last_modified DATETIME NOT NULL;
