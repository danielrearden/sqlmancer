SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE TABLE actor (
  actor_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (actor_id),
  KEY idx_actor_last_name (last_name)
);

CREATE TABLE address (
  address_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  address VARCHAR(50) NOT NULL,
  address2 VARCHAR(50) DEFAULT NULL,
  district VARCHAR(20) NOT NULL,
  city_id SMALLINT UNSIGNED NOT NULL,
  postal_code VARCHAR(10) DEFAULT NULL,
  phone VARCHAR(20) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (address_id),
  KEY idx_fk_city_id (city_id),
  CONSTRAINT `fk_address_city` FOREIGN KEY (city_id) REFERENCES city (city_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE category (
  category_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(25) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (category_id)
);

CREATE TABLE city (
  city_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  city VARCHAR(50) NOT NULL,
  country_id SMALLINT UNSIGNED NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (city_id),
  KEY idx_fk_country_id (country_id),
  CONSTRAINT `fk_city_country` FOREIGN KEY (country_id) REFERENCES country (country_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE country (
  country_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  country VARCHAR(50) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (country_id)
);

CREATE TABLE customer (
  customer_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  store_id TINYINT UNSIGNED,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  email VARCHAR(50) DEFAULT NULL,
  address_id SMALLINT UNSIGNED,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (customer_id),
  KEY idx_fk_store_id (store_id),
  KEY idx_fk_address_id (address_id),
  KEY idx_last_name (last_name),
  CONSTRAINT fk_customer_address FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_customer_store FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE film (
  film_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  release_year YEAR DEFAULT NULL,
  language_id TINYINT UNSIGNED NOT NULL,
  original_language_id TINYINT UNSIGNED DEFAULT NULL,
  rental_duration TINYINT UNSIGNED NOT NULL DEFAULT 3,
  rental_rate DECIMAL(4,2) NOT NULL DEFAULT 4.99,
  length SMALLINT UNSIGNED DEFAULT NULL,
  replacement_cost DECIMAL(5,2) NOT NULL DEFAULT 19.99,
  rating ENUM('G','PG','PG-13','R','NC-17') DEFAULT 'G',
  special_features SET('Trailers','Commentaries','Deleted Scenes','Behind the Scenes') DEFAULT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  extra_data JSON NULL,
  sequel_id SMALLINT UNSIGNED NULL,
  PRIMARY KEY  (film_id),
  KEY idx_title (title),
  KEY idx_fk_language_id (language_id),
  KEY idx_fk_original_language_id (original_language_id),
  CONSTRAINT fk_film_language FOREIGN KEY (language_id) REFERENCES language (language_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_film_language_original FOREIGN KEY (original_language_id) REFERENCES language (language_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE film_actor (
  actor_id SMALLINT UNSIGNED NOT NULL,
  film_id SMALLINT UNSIGNED NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (actor_id,film_id),
  KEY idx_fk_film_id (`film_id`),
  CONSTRAINT fk_film_actor_actor FOREIGN KEY (actor_id) REFERENCES actor (actor_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_film_actor_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE film_category (
  film_id SMALLINT UNSIGNED NOT NULL,
  category_id TINYINT UNSIGNED NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (film_id, category_id),
  CONSTRAINT fk_film_category_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_film_category_category FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE inventory (
  inventory_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  film_id SMALLINT UNSIGNED NOT NULL,
  store_id TINYINT UNSIGNED NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (inventory_id),
  KEY idx_fk_film_id (film_id),
  KEY idx_store_id_film_id (store_id,film_id),
  CONSTRAINT fk_inventory_store FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE language (
  language_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name CHAR(20) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (language_id)
);

CREATE TABLE rental (
  rental_id INT NOT NULL AUTO_INCREMENT,
  rental_date DATETIME NOT NULL,
  inventory_id MEDIUMINT UNSIGNED NOT NULL,
  customer_id SMALLINT UNSIGNED NOT NULL,
  return_date DATETIME DEFAULT NULL,
  staff_id TINYINT UNSIGNED NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (rental_id),
  UNIQUE KEY  (rental_date,inventory_id,customer_id),
  KEY idx_fk_inventory_id (inventory_id),
  KEY idx_fk_customer_id (customer_id),
  KEY idx_fk_staff_id (staff_id),
  CONSTRAINT fk_rental_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rental_inventory FOREIGN KEY (inventory_id) REFERENCES inventory (inventory_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE staff (
  staff_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  address_id SMALLINT UNSIGNED NOT NULL,
  picture MEDIUMBLOB DEFAULT NULL,
  email VARCHAR(50) DEFAULT NULL,
  store_id TINYINT UNSIGNED NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  username VARCHAR(16) NOT NULL,
  password VARCHAR(40) BINARY DEFAULT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (staff_id),
  KEY idx_fk_store_id (store_id),
  KEY idx_fk_address_id (address_id),
  CONSTRAINT fk_staff_store FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_staff_address FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE store (
  store_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  manager_staff_id TINYINT UNSIGNED NOT NULL,
  address_id SMALLINT UNSIGNED NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (store_id),
  UNIQUE KEY idx_unique_manager (manager_staff_id),
  KEY idx_fk_address_id (address_id),
  CONSTRAINT fk_store_staff FOREIGN KEY (manager_staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_store_address FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE VIEW person AS
    SELECT concat('actor', actor.actor_id) AS id,
        actor.actor_id as actor_id,
        actor.actor_id as customer_id,
        actor.actor_id as staff_id,
        actor.first_name,
        actor.last_name,
        actor.last_update,
        NULL AS active,
        NULL AS store_id,
        NULL AS email,
        NULL AS address_id,
        NULL AS username,
        NULL AS password,
        NULL AS picture
      FROM actor
    UNION
    SELECT concat('customer', customer.customer_id) AS id,
        customer.customer_id as actor_id,
        customer.customer_id as customer_id,
        customer.customer_id as staff_id,
        customer.first_name,
        customer.last_name,
        customer.last_update,
        customer.active,
        customer.store_id,
        customer.email,
        customer.address_id,
        NULL AS username,
        NULL AS password,
        NULL AS picture
      FROM customer
    UNION
    SELECT concat('staff', staff.staff_id) AS id,
        staff.staff_id as actor_id,
        staff.staff_id as customer_id,
        staff.staff_id as staff_id,
        staff.first_name,
        staff.last_name,
        staff.last_update,
        staff.active,
        staff.store_id AS store_id,
        staff.email,
        staff.address_id,
        staff.username,
        staff.password,
        staff.picture
      FROM staff;

CREATE VIEW active_staff AS
      SELECT * FROM staff
      WHERE staff.active = true;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
