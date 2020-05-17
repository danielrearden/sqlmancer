CREATE TABLE actor (
  actor_id INTEGER PRIMARY KEY,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  last_update TIMESTAMP
);

CREATE  INDEX idx_actor_last_name ON actor(last_name);

CREATE TRIGGER actor_trigger_ai AFTER INSERT ON actor
 BEGIN
  UPDATE actor SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER actor_trigger_au AFTER UPDATE ON actor
 BEGIN
  UPDATE actor SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE country (
  country_id INTEGER PRIMARY KEY,
  country VARCHAR(50) NOT NULL,
  last_update TIMESTAMP
);

CREATE TRIGGER country_trigger_ai AFTER INSERT ON country
 BEGIN
  UPDATE country SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER country_trigger_au AFTER UPDATE ON country
 BEGIN
  UPDATE country SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE city (
  city_id INTEGER PRIMARY KEY,
  city VARCHAR(50) NOT NULL,
  country_id SMALLINT NOT NULL,
  last_update TIMESTAMP,
  CONSTRAINT fk_city_country FOREIGN KEY (country_id) REFERENCES country (country_id) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE  INDEX idx_fk_country_id ON city(country_id);

CREATE TRIGGER city_trigger_ai AFTER INSERT ON city
 BEGIN
  UPDATE city SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER city_trigger_au AFTER UPDATE ON city
 BEGIN
  UPDATE city SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE address (
  address_id INTEGER PRIMARY KEY,
  address VARCHAR(50) NOT NULL,
  address2 VARCHAR(50) DEFAULT NULL,
  district VARCHAR(20) NOT NULL,
  city_id INT  NOT NULL,
  postal_code VARCHAR(10) DEFAULT NULL,
  phone VARCHAR(20) NOT NULL,
  last_update TIMESTAMP,
  CONSTRAINT fk_address_city FOREIGN KEY (city_id) REFERENCES city (city_id) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE  INDEX idx_fk_city_id ON address(city_id);

CREATE TRIGGER address_trigger_ai AFTER INSERT ON address
 BEGIN
  UPDATE address SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER address_trigger_au AFTER UPDATE ON address
 BEGIN
  UPDATE address SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE language (
  language_id INTEGER PRIMARY KEY,
  name CHAR(20) NOT NULL,
  last_update TIMESTAMP
);

CREATE TRIGGER language_trigger_ai AFTER INSERT ON language
 BEGIN
  UPDATE language SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER language_trigger_au AFTER UPDATE ON language
 BEGIN
  UPDATE language SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE category (
  category_id INTEGER PRIMARY KEY,
  name VARCHAR(25) NOT NULL,
  last_update TIMESTAMP
);

CREATE TRIGGER category_trigger_ai AFTER INSERT ON category
 BEGIN
  UPDATE category SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER category_trigger_au AFTER UPDATE ON category
 BEGIN
  UPDATE category SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE customer (
  customer_id INTEGER PRIMARY KEY,
  store_id INT,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  email VARCHAR(50) DEFAULT NULL,
  address_id INT,
  active SMALLINT DEFAULT 1,
  create_date TIMESTAMP,
  last_update TIMESTAMP,
  CONSTRAINT fk_customer_store FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT fk_customer_address FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE  INDEX idx_customer_fk_store_id ON customer(store_id);

CREATE  INDEX idx_customer_fk_address_id ON customer(address_id);

CREATE  INDEX idx_customer_last_name ON customer(last_name);

CREATE TRIGGER customer_trigger_ai AFTER INSERT ON customer
 BEGIN
  UPDATE customer SET last_update = DATETIME('NOW'), create_date = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER customer_trigger_au AFTER UPDATE ON customer
 BEGIN
  UPDATE customer SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE film (
  film_id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description BLOB SUB_TYPE TEXT DEFAULT NULL,
  release_year VARCHAR(4) DEFAULT NULL,
  language_id SMALLINT NOT NULL,
  original_language_id SMALLINT DEFAULT NULL,
  rental_duration SMALLINT  DEFAULT 3 NOT NULL,
  rental_rate DECIMAL(4,2) DEFAULT 4.99 NOT NULL,
  length SMALLINT DEFAULT NULL,
  replacement_cost DECIMAL(5,2) DEFAULT 19.99 NOT NULL,
  rating VARCHAR(10) DEFAULT 'G',
  special_features VARCHAR(100) DEFAULT NULL,
  last_update TIMESTAMP,
  sequel_id INTEGER DEFAULT NULL,
  CONSTRAINT CHECK_special_features CHECK(special_features is null or
                                                           special_features like '%Trailers%' or
                                                           special_features like '%Commentaries%' or
                                                           special_features like '%Deleted Scenes%' or
                                                           special_features like '%Behind the Scenes%'),
  CONSTRAINT CHECK_special_rating CHECK(rating in ('G','PG','PG-13','R','NC-17')),
  CONSTRAINT fk_film_language FOREIGN KEY (language_id) REFERENCES language (language_id) ,
  CONSTRAINT fk_film_language_original FOREIGN KEY (original_language_id) REFERENCES language (language_id)
);

CREATE  INDEX idx_fk_language_id ON film(language_id);

CREATE  INDEX idx_fk_original_language_id ON film(original_language_id);

CREATE TRIGGER film_trigger_ai AFTER INSERT ON film
 BEGIN
  UPDATE film SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER film_trigger_au AFTER UPDATE ON film
 BEGIN
  UPDATE film SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE film_actor (
  actor_id INT NOT NULL,
  film_id  INT NOT NULL,
  last_update TIMESTAMP,
  PRIMARY KEY  (actor_id,film_id),
  CONSTRAINT fk_film_actor_actor FOREIGN KEY (actor_id) REFERENCES actor (actor_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT fk_film_actor_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE  INDEX idx_fk_film_actor_film ON film_actor(film_id);

CREATE  INDEX idx_fk_film_actor_actor ON film_actor(actor_id) ;

CREATE TRIGGER film_actor_trigger_ai AFTER INSERT ON film_actor
 BEGIN
  UPDATE film_actor SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER film_actor_trigger_au AFTER UPDATE ON film_actor
 BEGIN
  UPDATE film_actor SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE film_category (
  film_id INT NOT NULL,
  category_id SMALLINT  NOT NULL,
  last_update TIMESTAMP,
  PRIMARY KEY (film_id, category_id),
  CONSTRAINT fk_film_category_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT fk_film_category_category FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE  INDEX idx_fk_film_category_film ON film_category(film_id);

CREATE  INDEX idx_fk_film_category_category ON film_category(category_id);

CREATE TRIGGER film_category_trigger_ai AFTER INSERT ON film_category
 BEGIN
  UPDATE film_category SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER film_category_trigger_au AFTER UPDATE ON film_category
 BEGIN
  UPDATE film_category SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE inventory (
  inventory_id INTEGER PRIMARY KEY,
  film_id INT NOT NULL,
  store_id INT NOT NULL,
  last_update TIMESTAMP,
  CONSTRAINT fk_inventory_store FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_film FOREIGN KEY (film_id) REFERENCES film (film_id) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE  INDEX idx_fk_film_id ON inventory(film_id);

CREATE  INDEX idx_fk_film_id_store_id ON inventory(store_id,film_id);

CREATE TRIGGER inventory_trigger_ai AFTER INSERT ON inventory
 BEGIN
  UPDATE inventory SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER inventory_trigger_au AFTER UPDATE ON inventory
 BEGIN
  UPDATE inventory SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE staff (
  staff_id INTEGER PRIMARY KEY,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  address_id INT NOT NULL,
  picture BLOB DEFAULT NULL,
  email VARCHAR(50) DEFAULT NULL,
  store_id INT NOT NULL,
  active SMALLINT DEFAULT 1 NOT NULL,
  username VARCHAR(16) NOT NULL,
  password VARCHAR(40) DEFAULT NULL,
  last_update TIMESTAMP,
  CONSTRAINT fk_staff_store FOREIGN KEY (store_id) REFERENCES store (store_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT fk_staff_address FOREIGN KEY (address_id) REFERENCES address (address_id) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE  INDEX idx_fk_staff_store_id ON staff(store_id);

CREATE  INDEX idx_fk_staff_address_id ON staff(address_id);

CREATE TRIGGER staff_trigger_ai AFTER INSERT ON staff
 BEGIN
  UPDATE staff SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER staff_trigger_au AFTER UPDATE ON staff
 BEGIN
  UPDATE staff SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE store (
  store_id INTEGER PRIMARY KEY,
  manager_staff_id SMALLINT NOT NULL,
  address_id INT NOT NULL,
  last_update TIMESTAMP,
  CONSTRAINT fk_store_staff FOREIGN KEY (manager_staff_id) REFERENCES staff (staff_id) ,
  CONSTRAINT fk_store_address FOREIGN KEY (address_id) REFERENCES address (address_id)
);

CREATE  INDEX idx_store_fk_manager_staff_id ON store(manager_staff_id);

CREATE  INDEX idx_fk_store_address ON store(address_id);

CREATE TRIGGER store_trigger_ai AFTER INSERT ON store
 BEGIN
  UPDATE store SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER store_trigger_au AFTER UPDATE ON store
 BEGIN
  UPDATE store SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TABLE rental (
  rental_id INTEGER PRIMARY KEY,
  rental_date TIMESTAMP NOT NULL,
  inventory_id INT  NOT NULL,
  customer_id INT  NOT NULL,
  return_date TIMESTAMP DEFAULT NULL,
  staff_id SMALLINT  NOT NULL,
  last_update TIMESTAMP,
  CONSTRAINT fk_rental_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ,
  CONSTRAINT fk_rental_inventory FOREIGN KEY (inventory_id) REFERENCES inventory (inventory_id) ,
  CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id)
);

CREATE INDEX idx_rental_fk_inventory_id ON rental(inventory_id);

CREATE INDEX idx_rental_fk_customer_id ON rental(customer_id);

CREATE INDEX idx_rental_fk_staff_id ON rental(staff_id);

CREATE UNIQUE INDEX   idx_rental_uq  ON rental (rental_date,inventory_id,customer_id);

CREATE TRIGGER rental_trigger_ai AFTER INSERT ON rental
 BEGIN
  UPDATE rental SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE TRIGGER rental_trigger_au AFTER UPDATE ON rental
 BEGIN
  UPDATE rental SET last_update = DATETIME('NOW')  WHERE rowid = new.rowid;
 END;

CREATE VIEW person AS
    SELECT ('actor' || actor.actor_id) AS id,
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
    SELECT ('customer' || customer.customer_id) AS id,
        customer.customer_id as actor_id,
        customer.customer_id as customer_id,
        customer.customer_id as staff_id,
        customer.first_name,
        customer.last_name,
        customer.last_update,
        NULL AS active,
        customer.store_id,
        customer.email,
        customer.address_id,
        NULL AS username,
        NULL AS password,
        NULL AS picture
      FROM customer
    UNION
    SELECT ('staff' || staff.staff_id) AS id,
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