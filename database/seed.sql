-- Seed Data for School Book Inventory

-- Boards
INSERT INTO boards (name) VALUES
('CBSE'),
('ICSE'),
('State Board');

-- Mediums
INSERT INTO mediums (name) VALUES
('English'),
('Hindi'),
('Gujarati');

-- Classes
INSERT INTO classes (name) VALUES
('Class 1'),
('Class 2'),
('Class 3');

-- Academic Years
INSERT INTO academic_years (year_label) VALUES
('2024-2025'),
('2025-2026');

-- Books
INSERT INTO books (book_name, subject, publisher) VALUES
('Mathematics Textbook', 'Mathematics', 'NCERT'),
('English Reader', 'English', 'NCERT'),
('Science Explorer', 'Science', 'Oxford'),
('Gujarati Vyakaran', 'Gujarati', 'GSEB');

-- Sample Book Set
INSERT INTO book_sets (
  board_id,
  medium_id,
  class_id,
  academic_year_id,
  set_name
) VALUES (
  1, -- CBSE
  1, -- English
  3, -- Class 3
  1, -- 2024-2025
  'Class 3 CBSE English Set'
);

-- Book Set Items (books inside the set)
INSERT INTO book_set_items (book_set_id, book_id, quantity) VALUES
(1, 1, 1), -- Mathematics Textbook
(1, 2, 1), -- English Reader
(1, 3, 1); -- Science Explorer
