-- Boards
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Mediums
CREATE TABLE mediums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Classes
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- Academic Years
CREATE TABLE academic_years (
  id SERIAL PRIMARY KEY,
  year_label VARCHAR(20) NOT NULL UNIQUE
);

-- Books
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  book_name VARCHAR(100) NOT NULL,
  subject VARCHAR(50),
  publisher VARCHAR(100)
);

-- Book Sets
CREATE TABLE book_sets (
  id SERIAL PRIMARY KEY,
  board_id INT NOT NULL,
  medium_id INT NOT NULL,
  class_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  set_name VARCHAR(100) NOT NULL,

  CONSTRAINT fk_book_set_board
    FOREIGN KEY (board_id)
    REFERENCES boards(id),

  CONSTRAINT fk_book_set_medium
    FOREIGN KEY (medium_id)
    REFERENCES mediums(id),

  CONSTRAINT fk_book_set_class
    FOREIGN KEY (class_id)
    REFERENCES classes(id),

  CONSTRAINT fk_book_set_year
    FOREIGN KEY (academic_year_id)
    REFERENCES academic_years(id)
);

-- Book Set Items
CREATE TABLE book_set_items (
  id SERIAL PRIMARY KEY,
  book_set_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),

  CONSTRAINT fk_item_book_set
    FOREIGN KEY (book_set_id)
    REFERENCES book_sets(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_item_book
    FOREIGN KEY (book_id)
    REFERENCES books(id)
);
