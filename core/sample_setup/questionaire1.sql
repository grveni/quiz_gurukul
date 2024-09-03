DO $$ 
DECLARE 
    quizz_id INT;
    ques_id INT;

BEGIN
-- Assuming a dummy quiz with ID 1
INSERT INTO quizzes (title, description, is_active) VALUES ('Dummy Quiz', 'This is a dummy quiz for testing.', true) RETURNING id INTO quizz_id;

-- Inserting questions and their respective options

-- Question 1
INSERT INTO questions (quiz_id, question_text, question_type, deleted) VALUES (quizz_id, 'Who first advised Ram to stay at Chitrakoot during Vanvas?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Valmiki', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Atri', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Bharadwaj', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Agastya', false);

-- Question 2
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Which river did Shree Ram cross taking help of Shree Kevat?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'River Ganga', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'River Yamuna', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'River Saryu', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'River Kaveri', false);

-- Question 3
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'During childhood, who was the Guru of Shree Ram and his brothers?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Vasisth', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Vishwamitra', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Vishrava', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Rishi Pulastya', false);

-- Question 4
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'After Yudishtra lost the game of dice to Shakuni, how many years were the Pandavas forced to live in exile, which included one year in anonymity?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '11', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '12', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '13', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '14', false);

-- Question 5
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'During exile, the four Pandav brothers, ignoring Yaksha''s warning, lost their life near a pond. However, after Yudishtra correctly answered all of Yaksha''s questions, Yaksha granted a boon to Yudishtra bringing back to life one of the dead brothers. Name the brother whom Yudishtra asked to be brought back to life?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Arjuna', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Nakula', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Bheem', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Sahdev', false);

-- Question 6
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Guru Granth Sahib is the holy book of which religion?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Jain', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Sikh', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Bodh', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Sanatan', false);

-- Question 7
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Who is called Saint Shiromani among the saints?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Saint Kabir', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Saint Ravidass', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Sant Surdass', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Sant Rahim', false);

-- Question 8
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Panna dai sacrificed her son name Chandan to save life of which prince of Udaipur?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Rana Kumbha', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Maharana Pratap', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Rana Uday Singh', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Rana Sanga', false);

-- Question 9
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Name of elder son of Chatrpati Shiva Ji', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Shree Rajaram Bhonsle', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Raje Sambhaji', true);

-- Question 10
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'The Jallianwala Bagh massacre took place on 13 April in 1919 in Punjab. Who avenged the massacre by killing the General Michael O''Dwyer, Governor General of Punjab?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Madan Lal Dhingra', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Sardar Udham Singh', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Sardar Bhagat Singh', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Rajguru', false);

-- Question 11
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'From which city did the Royal Indian Navy freedom fight (Mutiny) begin on 18 February 1946?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Bombay', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Agra', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Madras', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id, 'Nagpur', false);

-- Question 12
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'In which year did the Lahore session of the Indian National Congress, presided by Pandit Jawaharlal Nehru, adopted the resolution of Complete Independence or ''Purna Swaraj''?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '1925', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '1929', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '1931', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  '1935', false);

-- Question 13
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Who among the following led the Chittagong Armoury Raid?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Sardar Vallabhbhai Patel', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Vinayak Damodar Savarkar', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Surya Sen', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Gurudev Rabidranath Tagore', false);

-- Question 14
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Who was the First astronaut in the world who entered space on April 12, 1961?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Yuri Alekseyevich Gagarin', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Neil Armstrong', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Shree Rakesh Sharma', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Edmund Hillary', false);

-- Question 15
INSERT INTO questions (quiz_id, question_text, question_type, deleted)  VALUES (quizz_id, 'Name the biggest dam in India during Pandit Jawaharlal Nehru’s tenure as Prime Minister?', 'multiple-choice', false) RETURNING id INTO ques_id;
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Bhakra-Nangal Dam Satluj River', true);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Khasi Hills Dam Shillong Plateau in the Meghalaya', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Sardar Sarovar Dam built on the Narmada River', false);
INSERT INTO options (question_id, option_text, is_correct) VALUES (ques_id,  'Hirakud dam on the Mahanadi of Orissa', false);

END $$;