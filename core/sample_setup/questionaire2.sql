DO $$ 
DECLARE 
    quiz_id INT;
    question_id INT;
    option_id INT;

BEGIN
-- Assuming a new quiz with the title "Question 09_06_2024"
INSERT INTO quizzes (title, description, is_active) 
VALUES ('Question 09_06_2024', 'This is a quiz with multiple-choice and multiple-choice grid questions.', true) 
RETURNING id INTO quiz_id;

-- Inserting questions and their respective options
-- Question 1 (Multiple-choice grid example)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Arrange by age - eldest to youngest', 'multiple-choice-grid', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Ram', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 1);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Satrughan', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 4);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Laxman', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 3);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Bharat', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 2);

-- Question 2 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'With which Rishi did Ram and Lakshman go to Kill Tardka?', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Guru Vasisth', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Guru Balkmiki', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Guru Vishwamitra', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rishi Agastya', false);

-- Question 3 (Multiple-choice grid example)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Name the Pandav\"s - eldest to youngest', 'multiple-choice-grid', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Arjun', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 3);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Bhim', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 2);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Yudhistar', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 1);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Nukul', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 4);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Sahdev', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 5);

-- Question 4 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Hero of Mahabharat was', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Bhism', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Dhristduman', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Arjun', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sh Yudhistar', false);

-- Question 5 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Who founded the Sikh Dharam?', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Guru Nanak', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Guru Govind Singh', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sant Kabir', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Guru Samarth Ramdass', false);

-- Question 6 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Who wrote Hanuman Chalisa?', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sant Ravidas', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sant Raskhan', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Goswami Tulsidass', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Sant Mirabai', false);

-- Question 7 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Who fought Haldighati war?', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rana Kumbha', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Raja Jai Singh', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Maharana Pratap', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rana Sanga', false);

-- Question 8 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Name Bhagwan Parsuram''s father', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rishi Jamadgni', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rishi Pulastya', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rishi Shunak', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rishi Asthavrk', false);

-- Question 9 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Name of Great Warrior whose mother was Mata Jija Bai', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Chatarpati Shivaji', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Raja Mansingh', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rana Uday Singh', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rani Ahilya Bai Holkar', false);

-- Question 10 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Name the place where the memorial of Guru Tegbahadur Rai is situated.', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Gurdwara Bangla Sahib', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Gurudwara Sis Ganj Sahib', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Gurudwara Rakab Ganj Sahib', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Gurudwara Majnu Ka Tilla', false);

-- Question 11 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Name of Famous Three Freedom fighter popularly known as Lal Bal Pal', 'text', false) 
RETURNING id INTO question_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Lala Lajpat Rai, Bal Gangadhar Tilak, Vipin Chander Pal', true);

-- Question 12 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'In which city is Jalianwalabagh situated?', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Amritsar', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Jalandhar', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Ludhiana', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Bathinda', false);

-- Question 13 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Who was the founder of INA Indian National Army?', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Netaji Subash Chander Bose', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Mahatma Mohan Das Karam Chand Gandhi', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Madan Mohan Malaviya', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Rani Laxmi Bai', false);

-- Question 14 (Multiple-choice grid example)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Name first four Prime Ministers of India after 1947 including acting Prime Minister', 'multiple-choice-grid', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'PM Pandit Jawhar Lal Nehru', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 1);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'PM Smt Indra Gandhi', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 3);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'PM Shree Lal Bahadur Shastri', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 2);

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'PM Shree Gulzarilal Nanda', true) RETURNING id INTO option_id;
INSERT INTO options_correct_rank (question_id, option_id, correct_order) VALUES (question_id, option_id, 4);

-- Question 15 (Multiple-choice)
INSERT INTO questions (quiz_id, question_text, question_type, deleted) 
VALUES (quiz_id, 'Name the first Indian Astronaut to fly to space', 'multiple-choice', false) 
RETURNING id INTO question_id;

INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Shree Rakesh Sharma', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Ms Sunita Williams', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Shree Prashanth Balakrishnan Nair', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (question_id, 'Shree Angad Pratap', false);

END $$;
