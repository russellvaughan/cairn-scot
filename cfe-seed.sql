-- =============================================================================
-- CAIRN — Curriculum for Excellence Experiences & Outcomes Seed File
-- =============================================================================
-- Source: Education Scotland, Curriculum for Excellence framework
-- https://education.gov.scot/curriculum-for-excellence
--
-- IMPORTANT: This seed file is based on the published CfE framework.
-- Before deploying to a live school environment, verify reference codes
-- and outcome text against the current Education Scotland documentation,
-- as the framework is occasionally updated.
--
-- Run this file ONCE during initial database setup, after creating the schema.
-- It is safe to re-run — the ON CONFLICT clause will skip existing records.
-- =============================================================================

-- Clean slate for re-runs
TRUNCATE cfe_outcomes RESTART IDENTITY CASCADE;

-- =============================================================================
-- LITERACY AND ENGLISH
-- Abbreviation: LIT (cross-curricular literacy), ENG (English specific)
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL — Listening and Talking
('LIT 0-01a', 'literacy_english', 'early',
 'I enjoy exploring and playing with the patterns and sounds of language, and can use what I learn.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['listening', 'talking', 'language', 'sounds', 'patterns', 'play']),

('LIT 0-02a', 'literacy_english', 'early',
 'As I listen and talk in different situations, I am learning to take turns and am developing my awareness of when to talk and when to listen.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['listening', 'talking', 'turn taking', 'conversation', 'discussion']),

('LIT 0-04a', 'literacy_english', 'early',
 'I listen or watch for useful or interesting information and I use this to make choices or learn new things.',
 ARRAY['successful_learner'],
 ARRAY['listening', 'information', 'attention', 'watching']),

('LIT 0-07a', 'literacy_english', 'early',
 'I use gestures, expression and choice of words to show my feelings and communicate my meaning in different situations.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['expression', 'feelings', 'communication', 'gesture', 'words']),

('LIT 0-09a', 'literacy_english', 'early',
 'I enjoy exploring events and characters in stories and other texts, sharing my thoughts in different ways.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['stories', 'characters', 'texts', 'sharing', 'thoughts']),

('LIT 0-10a', 'literacy_english', 'early',
 'Within real and imaginary situations, I share experiences and feelings, ideas and information in a way that communicates my message.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['communication', 'sharing', 'ideas', 'feelings', 'experiences']),

-- EARLY LEVEL — Reading
('LIT 0-11a', 'literacy_english', 'early',
 'I enjoy exploring and choosing stories and other texts to watch, read or listen to, and can share my likes and dislikes.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['reading', 'stories', 'books', 'choosing', 'likes', 'dislikes']),

('LIT 0-13a', 'literacy_english', 'early',
 'I can use what I learn from watching and listening to help me understand texts.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'understanding', 'comprehension', 'watching', 'listening']),

('LIT 0-16a', 'literacy_english', 'early',
 'I explore sounds, letters and words, discovering how they work together, and I can use what I learn to help me as I read or write.',
 ARRAY['successful_learner'],
 ARRAY['phonics', 'sounds', 'letters', 'words', 'reading', 'writing']),

-- EARLY LEVEL — Writing
('LIT 0-20a', 'literacy_english', 'early',
 'I enjoy exploring events and characters in stories and other texts and I use what I learn to invent my own, sharing these with others in imaginative ways.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['writing', 'stories', 'imagination', 'creative', 'inventing']),

('LIT 0-21b', 'literacy_english', 'early',
 'I can convey information, describe events, explain processes or combine ideas in different ways.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['writing', 'information', 'description', 'explaining', 'ideas']),

-- FIRST LEVEL — Listening and Talking
('LIT 1-01a', 'literacy_english', 'first',
 'I enjoy exploring and playing with the patterns and sounds of language, and can use what I learn.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['listening', 'talking', 'language', 'patterns', 'sounds']),

('LIT 1-02a', 'literacy_english', 'first',
 'As I listen and talk in different situations, I am learning to take turns and am developing my awareness of when to talk and when to listen.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['listening', 'talking', 'turn taking', 'discussion', 'conversation']),

('LIT 1-04a', 'literacy_english', 'first',
 'As I listen or watch, I can identify and consider the purpose and main ideas of the text and use this information for different tasks.',
 ARRAY['successful_learner'],
 ARRAY['listening', 'purpose', 'main ideas', 'information', 'watching']),

('LIT 1-07a', 'literacy_english', 'first',
 'I can use my notes and other types of writing to help me understand information and ideas, exploring the techniques used by writers to influence my thinking.',
 ARRAY['successful_learner'],
 ARRAY['notes', 'writing', 'understanding', 'information', 'ideas']),

('LIT 1-09a', 'literacy_english', 'first',
 'As I listen and talk in different situations, I am learning to take turns and am developing my awareness of when to talk and when to listen.',
 ARRAY['effective_contributor', 'confident_individual'],
 ARRAY['listening', 'talking', 'discussion', 'group work', 'turn taking']),

('LIT 1-10a', 'literacy_english', 'first',
 'I can communicate clearly in a range of contexts, organising and presenting information in an appropriate way.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['communication', 'presenting', 'organising', 'information', 'context']),

-- FIRST LEVEL — Reading
('LIT 1-11a', 'literacy_english', 'first',
 'I enjoy exploring and choosing stories and other texts to watch, read or listen to, and can share my likes and dislikes.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['reading', 'stories', 'books', 'choosing', 'enjoyment']),

('LIT 1-13a', 'literacy_english', 'first',
 'I can use my knowledge of context clues, punctuation, grammar and layout to read with understanding and expression.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'comprehension', 'context', 'punctuation', 'grammar', 'understanding']),

('LIT 1-14a', 'literacy_english', 'first',
 'I can select and sort information from a variety of sources and use this for different purposes.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'information', 'research', 'selecting', 'sorting']),

('LIT 1-16a', 'literacy_english', 'first',
 'I can use different types of texts to find information to support my learning in different areas.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'research', 'information', 'non-fiction', 'learning']),

-- FIRST LEVEL — Writing
('LIT 1-20a', 'literacy_english', 'first',
 'I enjoy creating texts of my choice and I am developing a sense of an audience with my writing.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['writing', 'creative', 'audience', 'choice', 'texts']),

('LIT 1-21b', 'literacy_english', 'first',
 'I can convey information, describe events, explain processes or combine ideas in different ways.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['writing', 'information', 'description', 'explanation', 'ideas']),

('LIT 1-23a', 'literacy_english', 'first',
 'I can write independently, using appropriate punctuation and order sentences to make sense, which can be read by myself and others.',
 ARRAY['successful_learner'],
 ARRAY['writing', 'punctuation', 'sentences', 'independent', 'spelling']),

('LIT 1-24a', 'literacy_english', 'first',
 'Throughout the writing process, I can check that my writing makes sense.',
 ARRAY['successful_learner'],
 ARRAY['writing', 'editing', 'proofreading', 'checking', 'sense']),

-- SECOND LEVEL — Listening and Talking
('LIT 2-01a', 'literacy_english', 'second',
 'I can use different strategies to help me understand texts and make connections with my prior knowledge.',
 ARRAY['successful_learner'],
 ARRAY['listening', 'strategies', 'understanding', 'connections', 'prior knowledge']),

('LIT 2-02a', 'literacy_english', 'second',
 'When I engage with others, I can respond in ways that show my understanding, using relevant responses and asking questions when I need to clarify.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['discussion', 'understanding', 'questions', 'responding', 'clarifying']),

('LIT 2-04a', 'literacy_english', 'second',
 'As I listen or watch, I can identify and consider the purpose and main ideas of the text and use this information for different tasks.',
 ARRAY['successful_learner'],
 ARRAY['listening', 'purpose', 'main ideas', 'information', 'tasks']),

('LIT 2-07a', 'literacy_english', 'second',
 'I can show my understanding of what I listen to or watch by responding to and creating different kinds of questions.',
 ARRAY['successful_learner'],
 ARRAY['listening', 'understanding', 'questions', 'responding', 'watching']),

('LIT 2-09a', 'literacy_english', 'second',
 'I am developing confidence when engaging with others within and beyond my place of learning. I can communicate in a clear, expressive way and I am learning to select and organise information, choosing resources and presentation appropriately.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['confidence', 'communication', 'presenting', 'organising', 'resources']),

('LIT 2-10a', 'literacy_english', 'second',
 'I can communicate clearly and independently in a range of situations, organising and presenting information in an appropriate way for the audience.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['communication', 'presenting', 'organising', 'audience', 'independent', 'clarity']),

-- SECOND LEVEL — Reading
('LIT 2-11a', 'literacy_english', 'second',
 'Through developing my knowledge of context clues, punctuation, grammar and layout, I can read unfamiliar texts with increasing fluency, understanding and expression.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'fluency', 'comprehension', 'expression', 'understanding', 'grammar']),

('LIT 2-14a', 'literacy_english', 'second',
 'By selecting and using a range of strategies and resources before, during and after reading, I can make meaning from texts and begin to evaluate quality and worth.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'strategies', 'meaning', 'evaluating', 'comprehension']),

('LIT 2-16a', 'literacy_english', 'second',
 'Using what I know about the features of different types of texts, I can find, select and sort information from a variety of sources and use this for different purposes.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'research', 'information', 'selecting', 'sources', 'non-fiction']),

('LIT 2-18a', 'literacy_english', 'second',
 'I can use techniques I have learned about to organise and convey information effectively, for a specific audience and purpose.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['reading', 'information', 'audience', 'purpose', 'organising']),

-- SECOND LEVEL — Writing
('LIT 2-20a', 'literacy_english', 'second',
 'I enjoy creating texts of my choice and I regularly select subject, form, audience and purpose. My writing reflects my growing awareness of the world.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['writing', 'creative', 'choice', 'audience', 'purpose', 'form']),

('LIT 2-21b', 'literacy_english', 'second',
 'I can convey information, describe events, explain processes or combine ideas in different ways.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['writing', 'information', 'description', 'explanation', 'ideas', 'processes']),

('LIT 2-22a', 'literacy_english', 'second',
 'I can write neatly, legibly and with increasing speed.',
 ARRAY['successful_learner'],
 ARRAY['writing', 'handwriting', 'neatness', 'legibility', 'speed']),

('LIT 2-23a', 'literacy_english', 'second',
 'Throughout the writing process, I can check that my writing makes sense and meets its purpose, making changes and corrections as needed.',
 ARRAY['successful_learner'],
 ARRAY['writing', 'editing', 'proofreading', 'revising', 'purpose']),

('LIT 2-24a', 'literacy_english', 'second',
 'I can use spelling rules and strategies to spell words correctly.',
 ARRAY['successful_learner'],
 ARRAY['writing', 'spelling', 'rules', 'strategies']),

('LIT 2-25a', 'literacy_english', 'second',
 'I can use appropriate punctuation, varying my sentence structures and maintaining tense to make my writing clearer and more effective.',
 ARRAY['successful_learner'],
 ARRAY['writing', 'punctuation', 'sentences', 'tense', 'grammar']),

-- THIRD/FOURTH LEVEL — Literacy
('LIT 3-02a', 'literacy_english', 'third_fourth',
 'When I engage with others, I can make a relevant contribution, express my own view clearly and help to clarify points by asking well-structured questions.',
 ARRAY['effective_contributor', 'confident_individual'],
 ARRAY['discussion', 'contribution', 'view', 'questions', 'debate', 'clarifying']),

('LIT 3-09a', 'literacy_english', 'third_fourth',
 'I can communicate with a wide audience through different media and can communicate complex ideas clearly.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['communication', 'audience', 'media', 'complex', 'presenting', 'clarity']),

('LIT 3-10a', 'literacy_english', 'third_fourth',
 'I am developing confidence when engaging with others within and beyond my place of learning. I can communicate in a clear, expressive way and I am learning to select and organise complex information and choosing presentation and resources appropriately.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['communication', 'presenting', 'organising', 'complex information', 'confidence']),

('LIT 3-14a', 'literacy_english', 'third_fourth',
 'By using a reading strategy appropriate to my purpose, I can find and use information, integrating my existing knowledge.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'strategy', 'research', 'information', 'knowledge']),

('LIT 3-16a', 'literacy_english', 'third_fourth',
 'Using what I know about the features of different types of texts, I can find, select, sort, summarise and link information from a variety of sources.',
 ARRAY['successful_learner'],
 ARRAY['reading', 'research', 'summarising', 'linking', 'sources', 'information']),

('LIT 3-20a', 'literacy_english', 'third_fourth',
 'I can engage with a wide range of texts and am developing my own style. I am gaining confidence and skill in creating different kinds of texts to meet a range of purposes and audiences.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['writing', 'style', 'confidence', 'purpose', 'audience', 'creative']),

('LIT 3-23a', 'literacy_english', 'third_fourth',
 'Throughout the writing process, I can review and edit my writing to ensure that it meets its purpose and communicates meaning clearly.',
 ARRAY['successful_learner'],
 ARRAY['writing', 'editing', 'reviewing', 'purpose', 'clarity']),

-- SENIOR PHASE
('LIT 4-10a', 'literacy_english', 'senior',
 'I can present complex ideas and information clearly and persuasively, adapting my communication style and use of resources to engage my audience effectively.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['presenting', 'complex ideas', 'persuasion', 'communication', 'audience']),

('LIT 4-14a', 'literacy_english', 'senior',
 'I can critically evaluate the reliability and relevance of information from a wide range of sources to support my research and learning.',
 ARRAY['successful_learner'],
 ARRAY['research', 'evaluation', 'reliability', 'sources', 'critical thinking']),

('LIT 4-20a', 'literacy_english', 'senior',
 'I can create a wide range of texts in a skilled and assured way, for varied purposes and audiences, demonstrating my own distinctive style.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['writing', 'style', 'purpose', 'audience', 'skilled', 'assured']);


-- =============================================================================
-- NUMERACY AND MATHEMATICS
-- Abbreviation: MNU (Numeracy), MTH (Mathematics)
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL — Number, Money and Measure
('MNU 0-01a', 'numeracy_maths', 'early',
 'I am aware of how routines and events in my world link with numbers and number patterns and I can carry out relevant activities.',
 ARRAY['successful_learner'],
 ARRAY['numbers', 'patterns', 'routines', 'counting', 'number recognition']),

('MNU 0-02a', 'numeracy_maths', 'early',
 'I have explored numbers, understanding that they represent quantities, and I can use them to count, create sequences and describe order.',
 ARRAY['successful_learner'],
 ARRAY['numbers', 'counting', 'sequences', 'order', 'quantities']),

('MNU 0-03a', 'numeracy_maths', 'early',
 'I can use practical materials and can count on and back to help me understand addition and subtraction, recording my ideas and solutions in different ways.',
 ARRAY['successful_learner'],
 ARRAY['addition', 'subtraction', 'counting', 'practical', 'number']),

('MNU 0-07a', 'numeracy_maths', 'early',
 'I can share out a group of items by making smaller groups and can split a whole object into smaller parts.',
 ARRAY['successful_learner'],
 ARRAY['sharing', 'fractions', 'groups', 'dividing', 'halves']),

('MNU 0-09a', 'numeracy_maths', 'early',
 'I am aware of how money is used and can recognise and use a range of coins.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['money', 'coins', 'counting', 'shopping', 'value']),

('MNU 0-11a', 'numeracy_maths', 'early',
 'In movement, games and daily life, I can use simple mathematical vocabulary to describe position and direction.',
 ARRAY['successful_learner'],
 ARRAY['position', 'direction', 'movement', 'vocabulary', 'spatial']),

('MNU 0-20a', 'numeracy_maths', 'early',
 'I have experimented with everyday items as units of measure to investigate and compare sizes and amounts in my environment.',
 ARRAY['successful_learner'],
 ARRAY['measuring', 'comparing', 'size', 'length', 'weight', 'capacity']),

-- FIRST LEVEL — Number, Money and Measure
('MNU 1-01a', 'numeracy_maths', 'first',
 'I can use addition, subtraction, multiplication and division when solving problems, making best use of the mental strategies and written skills I have developed.',
 ARRAY['successful_learner'],
 ARRAY['addition', 'subtraction', 'multiplication', 'division', 'mental maths', 'problem solving']),

('MNU 1-02a', 'numeracy_maths', 'first',
 'I have investigated how whole numbers are constructed, can understand the importance of zero within the system and can use my knowledge to explain the link between a digit, its place and its value.',
 ARRAY['successful_learner'],
 ARRAY['place value', 'whole numbers', 'digits', 'zero', 'hundreds', 'tens', 'units']),

('MNU 1-03a', 'numeracy_maths', 'first',
 'I can use my knowledge of numbers to recall and use addition and subtraction number facts and can use these for mental calculations.',
 ARRAY['successful_learner'],
 ARRAY['number facts', 'mental maths', 'addition', 'subtraction', 'recall']),

('MNU 1-07a', 'numeracy_maths', 'first',
 'Having explored fractions by taking part in practical activities, I can show my understanding of how a whole object can be divided into equal parts and begin to use appropriate vocabulary.',
 ARRAY['successful_learner'],
 ARRAY['fractions', 'halves', 'quarters', 'equal parts', 'dividing']),

('MNU 1-09a', 'numeracy_maths', 'first',
 'I can use money to pay for items and can work out how much change I should receive.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['money', 'change', 'paying', 'coins', 'notes', 'shopping']),

('MNU 1-10a', 'numeracy_maths', 'first',
 'I can tell the time using 12 hour clocks, realising there is a link with 24 hour notation, explain how it impacts on my daily routine and ensure that I am organised and ready for events throughout my day.',
 ARRAY['successful_learner'],
 ARRAY['time', 'clock', '12 hour', '24 hour', 'daily routine', 'telling the time']),

('MNU 1-11a', 'numeracy_maths', 'first',
 'I can use a calendar to plan and be organised for key events in my life and can identify the months of the year in sequence.',
 ARRAY['successful_learner'],
 ARRAY['calendar', 'months', 'planning', 'dates', 'organising']),

('MNU 1-20a', 'numeracy_maths', 'first',
 'I can estimate the area of a shape by counting squares or other methods.',
 ARRAY['successful_learner'],
 ARRAY['area', 'shapes', 'estimating', 'counting squares', 'measure']),

-- SECOND LEVEL — Number, Money and Measure
('MNU 2-01a', 'numeracy_maths', 'second',
 'I can use addition, subtraction, multiplication and division, exploring their use in solving problems.',
 ARRAY['successful_learner'],
 ARRAY['addition', 'subtraction', 'multiplication', 'division', 'problem solving', 'calculations']),

('MNU 2-02a', 'numeracy_maths', 'second',
 'I have extended the range of whole numbers I can work with and having explored how decimal fractions are constructed, can explain the link between a digit, its place and its value.',
 ARRAY['successful_learner'],
 ARRAY['decimals', 'place value', 'whole numbers', 'digits', 'tenths', 'hundredths']),

('MNU 2-03a', 'numeracy_maths', 'second',
 'Having determined which calculations are needed, I can solve problems involving whole numbers using a range of methods, sharing my approaches and solutions with others.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['problem solving', 'calculations', 'methods', 'whole numbers', 'sharing', 'solutions']),

('MNU 2-07a', 'numeracy_maths', 'second',
 'I have investigated the everyday contexts in which simple fractions, percentages or decimals are used and can carry out the necessary calculations to solve related problems.',
 ARRAY['successful_learner'],
 ARRAY['fractions', 'percentages', 'decimals', 'calculations', 'problem solving', 'everyday']),

('MNU 2-09a', 'numeracy_maths', 'second',
 'I can manage money, understanding the different costs and the importance of keeping track of what is owed.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['money', 'budgeting', 'costs', 'managing', 'financial']),

('MNU 2-10a', 'numeracy_maths', 'second',
 'Using simple time periods, I can give a good estimate of how long a journey will take, based on my knowledge of the link between time, speed and distance.',
 ARRAY['successful_learner'],
 ARRAY['time', 'distance', 'speed', 'estimating', 'journey']),

('MNU 2-11a', 'numeracy_maths', 'second',
 'I can use and interpret maps and plans, using simple co-ordinates and scale.',
 ARRAY['successful_learner'],
 ARRAY['maps', 'coordinates', 'scale', 'plans', 'grid references']),

('MNU 2-20a', 'numeracy_maths', 'second',
 'I can use my knowledge of the sizes of familiar objects or places to assist me when making an estimate of a measure.',
 ARRAY['successful_learner'],
 ARRAY['estimating', 'measuring', 'size', 'length', 'weight', 'capacity']),

('MNU 2-20b', 'numeracy_maths', 'second',
 'I can use the common units of measure, convert between related units of the metric system and carry out calculations when solving problems.',
 ARRAY['successful_learner'],
 ARRAY['measurement', 'metric', 'converting', 'units', 'calculations', 'kg', 'cm', 'litres']),

-- SECOND LEVEL — Shape, Position and Movement
('MTH 2-16a', 'numeracy_maths', 'second',
 'I can name and classify a range of 2D shapes and can use appropriate mathematical vocabulary to describe their properties.',
 ARRAY['successful_learner'],
 ARRAY['shapes', '2D', 'properties', 'classification', 'geometry', 'vocabulary']),

('MTH 2-16b', 'numeracy_maths', 'second',
 'Having explored a range of 3D objects and 2D shapes, I can use mathematical language to describe their properties and can identify and name examples in the environment.',
 ARRAY['successful_learner'],
 ARRAY['3D', '2D', 'shapes', 'properties', 'environment', 'geometry']),

('MTH 2-17a', 'numeracy_maths', 'second',
 'I can describe, follow and record routes and journeys using appropriate mathematical vocabulary.',
 ARRAY['successful_learner'],
 ARRAY['routes', 'directions', 'position', 'movement', 'vocabulary', 'maps']),

('MTH 2-18a', 'numeracy_maths', 'second',
 'I can identify and describe the symmetry of a 2D shape in different orientations.',
 ARRAY['successful_learner'],
 ARRAY['symmetry', 'shapes', '2D', 'lines of symmetry', 'geometry']),

-- SECOND LEVEL — Information Handling
('MNU 2-20c', 'numeracy_maths', 'second',
 'Having discussed the variety of ways and range of media used to present data, I can interpret and draw conclusions from information displayed in a variety of ways.',
 ARRAY['successful_learner'],
 ARRAY['data', 'graphs', 'charts', 'interpreting', 'conclusions', 'information']),

('MTH 2-21a', 'numeracy_maths', 'second',
 'I can collect data, display data clearly and extract and interpret the key information from the results to answer questions or solve problems.',
 ARRAY['successful_learner'],
 ARRAY['data', 'collecting', 'displaying', 'graphs', 'charts', 'interpreting']),

-- THIRD/FOURTH LEVEL
('MNU 3-01a', 'numeracy_maths', 'third_fourth',
 'I can use a range of strategies and can apply mental arithmetic skills to carry out calculations efficiently and effectively.',
 ARRAY['successful_learner'],
 ARRAY['mental arithmetic', 'strategies', 'calculations', 'efficiency', 'number']),

('MNU 3-07a', 'numeracy_maths', 'third_fourth',
 'I can solve problems by carrying out calculations with a wide range of fractions, decimal fractions and percentages, using my answers to make comparisons and informed choices for real-life situations.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['fractions', 'decimals', 'percentages', 'problem solving', 'real life', 'comparisons']),

('MNU 3-09a', 'numeracy_maths', 'third_fourth',
 'When considering how to spend my money, I can source, compare and contrast different contracts and services, discuss their advantages and disadvantages, and explain which offer best value for money.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['money', 'financial', 'comparing', 'value', 'budgeting', 'contracts']),

('MTH 3-22a', 'numeracy_maths', 'third_fourth',
 'I can work with others to generate ideas and use these to construct and solve equations.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['algebra', 'equations', 'solving', 'generating', 'group work']),

-- SENIOR PHASE
('MNU 4-01a', 'numeracy_maths', 'senior',
 'Having recognised similarities between new problems and problems I have solved before, I can carry out the necessary calculations to solve problems set in unfamiliar contexts.',
 ARRAY['successful_learner'],
 ARRAY['problem solving', 'calculations', 'unfamiliar', 'applying', 'mathematical thinking']),

('MNU 4-09a', 'numeracy_maths', 'senior',
 'I can budget effectively, considering the various costs involved, and can evaluate the use of different means of managing money.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['budgeting', 'money', 'financial planning', 'evaluating', 'managing']);


-- =============================================================================
-- HEALTH AND WELLBEING
-- Abbreviation: HWB
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL
('HWB 0-01a', 'health_wellbeing', 'early',
 'I am aware of and able to express my feelings and am developing the ability to talk about them.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['feelings', 'emotions', 'expressing', 'talking', 'wellbeing']),

('HWB 0-02a', 'health_wellbeing', 'early',
 'I know that we all have similarities and differences but are all unique.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['similarities', 'differences', 'unique', 'identity', 'respect']),

('HWB 0-04a', 'health_wellbeing', 'early',
 'I understand that there are people in our lives who care for and look after us.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['relationships', 'caring', 'family', 'trust', 'safety']),

('HWB 0-11a', 'health_wellbeing', 'early',
 'I am aware of my own strengths and motivated to extend and develop these.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['strengths', 'motivation', 'confidence', 'self-awareness', 'development']),

('HWB 0-17a', 'health_wellbeing', 'early',
 'I am developing my understanding of the human body and can use correct vocabulary to explain how different parts of the body work.',
 ARRAY['successful_learner'],
 ARRAY['body', 'health', 'vocabulary', 'understanding', 'human body']),

('HWB 0-20a', 'health_wellbeing', 'early',
 'Together we explore different foods and can identify and explain some key features of a healthy diet.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['food', 'healthy eating', 'diet', 'nutrition', 'exploring']),

('HWB 0-22a', 'health_wellbeing', 'early',
 'I am developing my understanding of the need to look after my teeth and I can identify features of good oral hygiene.',
 ARRAY['successful_learner'],
 ARRAY['teeth', 'hygiene', 'health', 'oral health', 'looking after']),

('HWB 0-25a', 'health_wellbeing', 'early',
 'I can explain why it is important to be active and why different kinds of regular physical activity is important for a healthy life.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['physical activity', 'exercise', 'healthy lifestyle', 'active', 'importance']),

-- FIRST LEVEL
('HWB 1-01a', 'health_wellbeing', 'first',
 'I am aware of and able to express my feelings and am developing the ability to talk about them.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['feelings', 'emotions', 'expressing', 'talking', 'wellbeing', 'mental health']),

('HWB 1-02a', 'health_wellbeing', 'first',
 'I know that we all have similarities and differences but are all unique.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['similarities', 'differences', 'unique', 'identity', 'diversity', 'respect']),

('HWB 1-04a', 'health_wellbeing', 'first',
 'I understand that there are people in our lives who care for and look after us and I can explain how they do this.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['relationships', 'caring', 'trust', 'family', 'community']),

('HWB 1-06a', 'health_wellbeing', 'first',
 'I understand the importance of friendship, caring for others and being caring, and I recognise the qualities that make a good friend.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['friendship', 'caring', 'qualities', 'relationships', 'kindness']),

('HWB 1-07a', 'health_wellbeing', 'first',
 'I am aware of the need to respect personal space and boundaries and can recognise and respond appropriately to verbal and non-verbal communication.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['boundaries', 'personal space', 'communication', 'non-verbal', 'respect']),

('HWB 1-11a', 'health_wellbeing', 'first',
 'I am developing my understanding of my own strengths and I am motivated to extend and develop these.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['strengths', 'motivation', 'self-awareness', 'confidence', 'development']),

('HWB 1-19a', 'health_wellbeing', 'first',
 'I understand the importance of sleep and I can explain how it helps my body and mind.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['sleep', 'health', 'rest', 'wellbeing', 'body', 'mind']),

('HWB 1-20a', 'health_wellbeing', 'first',
 'I understand how a healthy diet supports my body and mind and I know what a healthy diet looks like.',
 ARRAY['successful_learner'],
 ARRAY['healthy eating', 'diet', 'nutrition', 'food groups', 'health']),

('HWB 1-25a', 'health_wellbeing', 'first',
 'I can explain why it is important to be regularly physically active and I can describe the consequences of a sedentary lifestyle.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['physical activity', 'exercise', 'healthy lifestyle', 'sedentary', 'active']),

('HWB 1-29a', 'health_wellbeing', 'first',
 'I can demonstrate and apply skills when working in a team.',
 ARRAY['effective_contributor', 'responsible_citizen'],
 ARRAY['teamwork', 'cooperation', 'leadership', 'communication', 'group work']),

-- SECOND LEVEL
('HWB 2-01a', 'health_wellbeing', 'second',
 'I am aware of and able to express my feelings and am developing the ability to talk about them.',
 ARRAY['confident_individual'],
 ARRAY['feelings', 'emotions', 'mental health', 'wellbeing', 'expressing', 'talking']),

('HWB 2-02a', 'health_wellbeing', 'second',
 'I know that we all have similarities and differences but are all unique. I can identify the characteristics and abilities I have and those I can see in others.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['identity', 'unique', 'similarities', 'differences', 'abilities', 'self-awareness']),

('HWB 2-04a', 'health_wellbeing', 'second',
 'I understand that there are people in our lives who care for and look after us and I know the different roles they have.',
 ARRAY['responsible_citizen', 'confident_individual'],
 ARRAY['relationships', 'roles', 'caring', 'family', 'community', 'professionals']),

('HWB 2-06a', 'health_wellbeing', 'second',
 'I understand the importance of friendship, caring for others and being caring, and I recognise when a friendship is unhealthy.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['friendship', 'relationships', 'unhealthy', 'caring', 'peer pressure']),

('HWB 2-09a', 'health_wellbeing', 'second',
 'I can identify and understand the feelings and emotions of others, can empathise and can demonstrate my understanding.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['empathy', 'emotions', 'feelings', 'others', 'understanding', 'compassion']),

('HWB 2-11a', 'health_wellbeing', 'second',
 'I understand that my feelings and reactions can change depending on what is happening within and around me. This helps me to understand my own behaviour and the way others behave.',
 ARRAY['confident_individual'],
 ARRAY['feelings', 'reactions', 'behaviour', 'self-regulation', 'understanding']),

('HWB 2-12a', 'health_wellbeing', 'second',
 'In everyday situations and tasks, I can recognise my strengths, face challenges and feel positive about my achievements.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['strengths', 'challenges', 'achievements', 'resilience', 'positive', 'growth mindset']),

('HWB 2-16a', 'health_wellbeing', 'second',
 'I can describe and discuss the range of processes, tasks and skills required to participate in a range of physical activities.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['physical activity', 'sport', 'skills', 'participation', 'activities']),

('HWB 2-20a', 'health_wellbeing', 'second',
 'By applying my knowledge and understanding of nutrition, I can help to make healthy food choices.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['nutrition', 'healthy eating', 'food choices', 'diet', 'health']),

('HWB 2-22a', 'health_wellbeing', 'second',
 'By investigating food labelling systems, I can begin to understand how to use this information to make healthy food choices.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['food labels', 'nutrition', 'healthy choices', 'information', 'investigating']),

('HWB 2-25a', 'health_wellbeing', 'second',
 'I can explain the benefits of being physically active and the need to maintain a balance of physical activity, rest and sleep to help me remain healthy.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['physical activity', 'exercise', 'sleep', 'rest', 'balance', 'health', 'wellbeing']),

('HWB 2-29a', 'health_wellbeing', 'second',
 'I can demonstrate skills in a variety of physical activities and can apply these in new and challenging situations.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['physical skills', 'sport', 'activity', 'challenge', 'applying', 'new situations']),

('HWB 2-35a', 'health_wellbeing', 'second',
 'Demonstrating a sense of fair play, I can cooperate with others in a team setting to share experiences, solve problems, and make decisions.',
 ARRAY['effective_contributor', 'responsible_citizen'],
 ARRAY['teamwork', 'fair play', 'cooperation', 'problem solving', 'decisions', 'group work']),

('HWB 2-36a', 'health_wellbeing', 'second',
 'I can show consideration for others and explore the importance of keeping myself and others safe.',
 ARRAY['responsible_citizen', 'confident_individual'],
 ARRAY['safety', 'consideration', 'others', 'responsibility', 'care']),

-- THIRD/FOURTH LEVEL
('HWB 3-01a', 'health_wellbeing', 'third_fourth',
 'I am developing resilience and the ability to overcome challenges and change, and am learning skills to manage risk and uncertainty.',
 ARRAY['confident_individual'],
 ARRAY['resilience', 'challenges', 'change', 'risk', 'uncertainty', 'managing']),

('HWB 3-04a', 'health_wellbeing', 'third_fourth',
 'I can describe and reflect on the nature of relationships, understanding their importance to my life and the lives of others.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['relationships', 'reflecting', 'importance', 'others', 'nature']),

('HWB 3-11a', 'health_wellbeing', 'third_fourth',
 'I am developing confidence, a positive sense of my own identity and the ability to manage my own wellbeing.',
 ARRAY['confident_individual'],
 ARRAY['confidence', 'identity', 'wellbeing', 'self-management', 'positive']),

('HWB 3-20a', 'health_wellbeing', 'third_fourth',
 'Using my knowledge of nutrition and the Scottish Dietary Goals, I can evaluate my own diet and that of others to guide choice.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['nutrition', 'diet', 'evaluating', 'healthy eating', 'Scottish dietary goals', 'food choices']),

('HWB 3-25a', 'health_wellbeing', 'third_fourth',
 'I can explain the importance of physical activity, making links between it and aspects of physical, mental and social health and wellbeing.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['physical activity', 'mental health', 'social health', 'wellbeing', 'links', 'importance']),

('HWB 3-29a', 'health_wellbeing', 'third_fourth',
 'I can demonstrate a range of physical competencies and skills, including leading and supporting others.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['physical skills', 'leadership', 'supporting others', 'competencies', 'sport']),

('HWB 3-35a', 'health_wellbeing', 'third_fourth',
 'I can demonstrate an understanding of the value of teamwork and can show leadership skills in a range of contexts.',
 ARRAY['effective_contributor', 'confident_individual'],
 ARRAY['teamwork', 'leadership', 'cooperation', 'contexts', 'group work']),

-- SENIOR PHASE
('HWB 4-01a', 'health_wellbeing', 'senior',
 'I can identify the strengths and qualities that I bring to different situations and explain how these help me to succeed.',
 ARRAY['confident_individual'],
 ARRAY['strengths', 'qualities', 'self-awareness', 'success', 'reflection']),

('HWB 4-25a', 'health_wellbeing', 'senior',
 'I can analyse the range of factors influencing my current health and use this analysis to make decisions to improve my lifestyle.',
 ARRAY['responsible_citizen', 'confident_individual'],
 ARRAY['health analysis', 'factors', 'lifestyle', 'decisions', 'improving']);


-- =============================================================================
-- SCIENCES
-- Abbreviation: SCN
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL
('SCN 0-01a', 'sciences', 'early',
 'I have observed living things in the environment over time and am becoming aware of how they depend on each other.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['living things', 'environment', 'observation', 'dependence', 'nature']),

('SCN 0-04a', 'sciences', 'early',
 'I can sort living things into groups and explain my decisions.',
 ARRAY['successful_learner'],
 ARRAY['sorting', 'classifying', 'living things', 'groups', 'explaining']),

('SCN 0-12a', 'sciences', 'early',
 'I have helped to design and carry out investigations to explore the properties of materials.',
 ARRAY['successful_learner'],
 ARRAY['investigation', 'materials', 'properties', 'exploring', 'designing']),

('SCN 0-20a', 'sciences', 'early',
 'By observing and exploring the environment, I can identify and discuss the different types of weather experienced in Scotland.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['weather', 'observing', 'Scotland', 'environment', 'exploring']),

-- FIRST LEVEL
('SCN 1-01a', 'sciences', 'first',
 'I can distinguish between living and non-living things. I can sort living things into groups and explain the similarities and differences between these groups.',
 ARRAY['successful_learner'],
 ARRAY['living things', 'non-living', 'sorting', 'similarities', 'differences', 'classifying']),

('SCN 1-13a', 'sciences', 'first',
 'I have explored how light travels and how this can be used to explain why we can see things and how shadows are formed.',
 ARRAY['successful_learner'],
 ARRAY['light', 'shadows', 'travelling', 'seeing', 'exploring']),

('SCN 1-14a', 'sciences', 'first',
 'I can describe how sounds are made, how they travel through different materials and how we can change the pitch and loudness of sound.',
 ARRAY['successful_learner'],
 ARRAY['sound', 'pitch', 'loudness', 'travel', 'vibration', 'materials']),

('SCN 1-15a', 'sciences', 'first',
 'By investigating forces on toys and other objects, I can predict the effect on the shape or movement of an object.',
 ARRAY['successful_learner'],
 ARRAY['forces', 'movement', 'shape', 'predicting', 'investigating', 'objects']),

('SCN 1-20a', 'sciences', 'first',
 'I can identify and describe what different types of plants and animals look like. I can explain how the basic needs of plants and animals are met.',
 ARRAY['successful_learner'],
 ARRAY['plants', 'animals', 'basic needs', 'describing', 'identifying']),

-- SECOND LEVEL
('SCN 2-01a', 'sciences', 'second',
 'I can identify and classify examples of living things, past and present, to help me appreciate their diversity.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['living things', 'classifying', 'diversity', 'past and present', 'biodiversity']),

('SCN 2-04a', 'sciences', 'second',
 'I can describe and explain how the body uses food and can describe the process and some functions of the digestive system.',
 ARRAY['successful_learner'],
 ARRAY['digestion', 'body', 'food', 'digestive system', 'health', 'nutrition']),

('SCN 2-05a', 'sciences', 'second',
 'I can describe the main organs of the body and can explain their functions.',
 ARRAY['successful_learner'],
 ARRAY['organs', 'body systems', 'functions', 'heart', 'lungs', 'biology']),

('SCN 2-12a', 'sciences', 'second',
 'By investigating the properties of different materials, I can explain how these properties enable them to be used for different purposes.',
 ARRAY['successful_learner'],
 ARRAY['materials', 'properties', 'investigating', 'purposes', 'uses', 'comparison']),

('SCN 2-13a', 'sciences', 'second',
 'By exploring physical and chemical changes, I can explain what happens and identify where these processes occur in the world around me.',
 ARRAY['successful_learner'],
 ARRAY['physical change', 'chemical change', 'exploring', 'world around us', 'identifying']),

('SCN 2-15a', 'sciences', 'second',
 'I have explored the structure and function of sensory organs to develop my understanding of how they work.',
 ARRAY['successful_learner'],
 ARRAY['senses', 'organs', 'structure', 'function', 'exploring', 'how things work']),

('SCN 2-20a', 'sciences', 'second',
 'By exploring the carbon cycle, I can describe the processes involved and discuss the importance of maintaining a balance.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['carbon cycle', 'processes', 'balance', 'environment', 'climate']),

('SCN 2-20b', 'sciences', 'second',
 'I can describe how energy from the sun is used by plants to produce food and I can identify the products of this process.',
 ARRAY['successful_learner'],
 ARRAY['photosynthesis', 'plants', 'energy', 'sun', 'food production', 'oxygen']),

('SCN 2-20c', 'sciences', 'second',
 'I can describe sources of renewable and non-renewable energy and discuss their uses and implications for the environment.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['renewable energy', 'non-renewable', 'environment', 'sources', 'implications', 'sustainability']),

('SCN 2-26a', 'sciences', 'second',
 'I can describe the position of the sun and planets in the solar system and can explain how gravity affects planet movement.',
 ARRAY['successful_learner'],
 ARRAY['solar system', 'planets', 'sun', 'gravity', 'space', 'movement']),

('SCN 2-27a', 'sciences', 'second',
 'I can explain the impact of the sun on Earth and can explain day and night, seasonal change and weather patterns.',
 ARRAY['successful_learner'],
 ARRAY['sun', 'day and night', 'seasons', 'weather', 'earth', 'impact']),

-- THIRD/FOURTH LEVEL
('SCN 3-01a', 'sciences', 'third_fourth',
 'I can explain how living things are dependent on their environment and on each other and how changes in the environment can affect biodiversity.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['biodiversity', 'environment', 'dependence', 'change', 'ecosystems']),

('SCN 3-13a', 'sciences', 'third_fourth',
 'By investigating different types of chemical reactions, I can demonstrate understanding and can use this knowledge to predict what will happen and evaluate the results.',
 ARRAY['successful_learner'],
 ARRAY['chemical reactions', 'predicting', 'evaluating', 'investigating', 'chemistry']),

('SCN 3-20a', 'sciences', 'third_fourth',
 'I can explain the importance of the role of the atom and understand how changes in atomic structure can lead to new elements.',
 ARRAY['successful_learner'],
 ARRAY['atoms', 'elements', 'atomic structure', 'chemistry', 'periodic table']),

('SCN 3-26a', 'sciences', 'third_fourth',
 'I can explain how heat energy and electrical energy are interchangeable and can be used to produce light, sound and movement.',
 ARRAY['successful_learner'],
 ARRAY['energy', 'heat', 'electricity', 'light', 'sound', 'movement', 'conversion']),

-- SENIOR PHASE
('SCN 4-01a', 'sciences', 'senior',
 'I can evaluate the impact of human activity and natural processes on biodiversity and can discuss the importance of conservation.',
 ARRAY['responsible_citizen', 'successful_learner'],
 ARRAY['biodiversity', 'conservation', 'human impact', 'natural processes', 'environment']);


-- =============================================================================
-- SOCIAL STUDIES
-- Abbreviation: SOC
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL
('SOC 0-01a', 'social_studies', 'early',
 'I am aware that different types of evidence can help me find out about the world around me.',
 ARRAY['successful_learner'],
 ARRAY['evidence', 'enquiry', 'world', 'finding out', 'sources']),

('SOC 0-07a', 'social_studies', 'early',
 'I can describe my local area and the places and people in it, and am able to explain why I like places in my community.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['local area', 'community', 'places', 'people', 'describing']),

-- FIRST LEVEL
('SOC 1-01a', 'social_studies', 'first',
 'I can use evidence selectively to research a historical topic I have chosen, presenting my findings in an appropriate way.',
 ARRAY['successful_learner'],
 ARRAY['history', 'research', 'evidence', 'presenting', 'findings', 'topic']),

('SOC 1-06a', 'social_studies', 'first',
 'I can talk about the different features and characteristics of my environment and can explain how the environment has been shaped.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['environment', 'features', 'characteristics', 'shaped', 'geography', 'landscape']),

('SOC 1-07a', 'social_studies', 'first',
 'I can describe Scotland''s landscape, explaining the main features and how they were formed, using correct vocabulary.',
 ARRAY['successful_learner'],
 ARRAY['Scotland', 'landscape', 'geography', 'features', 'vocabulary', 'formation']),

('SOC 1-14a', 'social_studies', 'first',
 'I can identify the various types of rights and responsibilities and can discuss how these affect the lives of people in my community.',
 ARRAY['responsible_citizen'],
 ARRAY['rights', 'responsibilities', 'community', 'people', 'discussion']),

-- SECOND LEVEL
('SOC 2-01a', 'social_studies', 'second',
 'I can use primary and secondary sources selectively to research events in the past.',
 ARRAY['successful_learner'],
 ARRAY['history', 'research', 'primary sources', 'secondary sources', 'past events']),

('SOC 2-02a', 'social_studies', 'second',
 'I can interpret historical evidence from a range of periods to help me understand events and to explain why things happened.',
 ARRAY['successful_learner'],
 ARRAY['history', 'evidence', 'interpreting', 'events', 'explaining', 'causes']),

('SOC 2-06a', 'social_studies', 'second',
 'I can describe the major characteristic features of Scotland and the UK and explain how these emerged and have influenced the development of both.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['Scotland', 'UK', 'characteristics', 'history', 'development', 'geography']),

('SOC 2-07a', 'social_studies', 'second',
 'I can explain how the physical and human features of a place impact on the way of life of the people who live there.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['physical features', 'human features', 'place', 'way of life', 'impact', 'geography']),

('SOC 2-14a', 'social_studies', 'second',
 'I can explain the nature of democracy and the role of citizens in bringing about changes in society.',
 ARRAY['responsible_citizen'],
 ARRAY['democracy', 'citizenship', 'society', 'voting', 'rights', 'changes']),

('SOC 2-15a', 'social_studies', 'second',
 'I can discuss the similarities and differences in the treatment of people in different societies throughout history.',
 ARRAY['responsible_citizen', 'successful_learner'],
 ARRAY['equality', 'history', 'treatment', 'societies', 'similarities', 'differences']),

('SOC 2-20a', 'social_studies', 'second',
 'I can describe the major themes of globalisation and can explain how it affects Scotland and the wider world.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['globalisation', 'Scotland', 'world', 'trade', 'economy', 'interconnection']),

-- THIRD/FOURTH LEVEL
('SOC 3-01a', 'social_studies', 'third_fourth',
 'I can evaluate a range of sources of evidence to explain events from the past, presenting my conclusions in an appropriate format.',
 ARRAY['successful_learner'],
 ARRAY['history', 'evidence', 'evaluating', 'conclusions', 'presenting', 'past events']),

('SOC 3-14a', 'social_studies', 'third_fourth',
 'I can investigate and evaluate the impact of events on the rights, freedoms and welfare of individuals and groups in society.',
 ARRAY['responsible_citizen', 'successful_learner'],
 ARRAY['rights', 'freedoms', 'welfare', 'events', 'society', 'impact', 'investigating']),

-- SENIOR PHASE
('SOC 4-01a', 'social_studies', 'senior',
 'I can critically evaluate evidence from a range of sources to investigate complex historical issues and present my arguments clearly.',
 ARRAY['successful_learner'],
 ARRAY['history', 'evidence', 'critical evaluation', 'complex issues', 'arguments']);


-- =============================================================================
-- TECHNOLOGIES
-- Abbreviation: TCH
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL
('TCH 0-01a', 'technologies', 'early',
 'I can explore and discover how everyday items and technologies work and can describe what I find.',
 ARRAY['successful_learner'],
 ARRAY['technology', 'exploring', 'everyday items', 'how things work', 'describing']),

('TCH 0-09a', 'technologies', 'early',
 'I am developing the use of different materials and can manage and use them safely.',
 ARRAY['successful_learner'],
 ARRAY['materials', 'safety', 'managing', 'using', 'design']),

-- FIRST LEVEL
('TCH 1-01a', 'technologies', 'first',
 'I can explore and discover how the technologies I use work, and can explain what I find.',
 ARRAY['successful_learner'],
 ARRAY['technology', 'exploring', 'how things work', 'explaining', 'discovering']),

('TCH 1-04a', 'technologies', 'first',
 'I can use the Internet to find and use information for a task.',
 ARRAY['successful_learner'],
 ARRAY['internet', 'research', 'information', 'digital', 'finding information']),

('TCH 1-09a', 'technologies', 'first',
 'I enjoy exploring and working with materials, understanding that I can combine and change them.',
 ARRAY['successful_learner'],
 ARRAY['materials', 'combining', 'changing', 'exploring', 'design', 'making']),

-- SECOND LEVEL
('TCH 2-01a', 'technologies', 'second',
 'I can discuss the applications and implications of technologies in different contexts. I can explore the impact of technologies in different contexts.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['technology', 'applications', 'implications', 'impact', 'context', 'digital']),

('TCH 2-03a', 'technologies', 'second',
 'I can use digital technologies to present my ideas and findings in different ways.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['digital', 'presenting', 'ideas', 'technology', 'communication']),

('TCH 2-04a', 'technologies', 'second',
 'I can use and evaluate a range of digital technologies to help me learn.',
 ARRAY['successful_learner'],
 ARRAY['digital tools', 'evaluating', 'learning', 'technology', 'skills']),

('TCH 2-09a', 'technologies', 'second',
 'I can extend and enhance my design skills to solve problems and create new and original solutions.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['design', 'problem solving', 'creative', 'solutions', 'original', 'making']),

('TCH 2-14a', 'technologies', 'second',
 'I can explore how reprogrammable devices work, and use my findings to produce a working solution.',
 ARRAY['successful_learner'],
 ARRAY['coding', 'programming', 'devices', 'computing', 'digital', 'solution']),

('TCH 2-15a', 'technologies', 'second',
 'I can create and present my own work using a range of digital technologies and can evaluate what I have done.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['digital', 'creating', 'presenting', 'evaluating', 'technology']),

-- THIRD/FOURTH LEVEL
('TCH 3-03a', 'technologies', 'third_fourth',
 'I can use digital technologies to investigate, create and communicate, and I can evaluate and suggest improvements to my work.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['digital', 'investigating', 'creating', 'communicating', 'evaluating', 'improving']),

('TCH 3-14a', 'technologies', 'third_fourth',
 'I understand how a range of different programming constructs can be used to solve problems and I can use them in my work.',
 ARRAY['successful_learner'],
 ARRAY['programming', 'coding', 'problem solving', 'constructs', 'computing', 'logic']),

-- SENIOR PHASE
('TCH 4-03a', 'technologies', 'senior',
 'I can take the initiative to set and refine my own challenges, carry out complex digital projects and evaluate their success.',
 ARRAY['successful_learner', 'effective_contributor'],
 ARRAY['digital projects', 'initiative', 'evaluating', 'complex', 'technology', 'independent']);


-- =============================================================================
-- EXPRESSIVE ARTS
-- Abbreviation: EXA
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL
('EXA 0-01a', 'expressive_arts', 'early',
 'I have experienced the energy and excitement of taking part in creative and performance activities, and am developing my skills in this area.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['performing', 'creative', 'energy', 'excitement', 'skills', 'participation']),

('EXA 0-02a', 'expressive_arts', 'early',
 'I can use my voice, musical instruments and music technology to experiment with sounds, pitch, melody, rhythm, timbre and dynamics.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['music', 'singing', 'instruments', 'sounds', 'rhythm', 'pitch', 'melody']),

('EXA 0-04a', 'expressive_arts', 'early',
 'I have the freedom to explore and discover through movement, dance, drama and music.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['movement', 'dance', 'drama', 'music', 'exploring', 'creativity']),

-- FIRST LEVEL
('EXA 1-01a', 'expressive_arts', 'first',
 'I have experienced the energy and excitement of taking part in creative activities and performances and have developed skills in my chosen area(s).',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['performing', 'creative', 'activities', 'skills', 'confidence', 'arts']),

('EXA 1-02a', 'expressive_arts', 'first',
 'I can use my voice, musical instruments and music technology to experiment with sounds and can use what I learn to create and perform simple music.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['music', 'singing', 'instruments', 'creating', 'performing', 'sounds']),

('EXA 1-04a', 'expressive_arts', 'first',
 'I can respond to the work of artists and performers by discussing my thoughts and feelings. I can give and accept constructive comment on my own and others'' work.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['art', 'performance', 'responding', 'discussing', 'feedback', 'constructive comment']),

('EXA 1-11a', 'expressive_arts', 'first',
 'I can use various media to create images and objects, sharing my creative process.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['art', 'media', 'creating', 'images', 'objects', 'visual arts']),

('EXA 1-12a', 'expressive_arts', 'first',
 'I can explore and use different art and design media and techniques to create images and objects.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['art', 'design', 'media', 'techniques', 'creating', 'exploring']),

('EXA 1-13a', 'expressive_arts', 'first',
 'Inspired by a range of stimuli, I can create and present performances and productions.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['performance', 'drama', 'production', 'creating', 'presenting', 'stimuli']),

-- SECOND LEVEL
('EXA 2-01a', 'expressive_arts', 'second',
 'I have experienced the energy and excitement of taking part in creative and performance activities and have developed skills in my chosen art form(s).',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['performance', 'creative', 'art', 'skills', 'confidence', 'expression']),

('EXA 2-02a', 'expressive_arts', 'second',
 'I can sing and play music, using techniques and understanding to perform and express myself.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['singing', 'music', 'performing', 'expression', 'techniques', 'instruments']),

('EXA 2-03a', 'expressive_arts', 'second',
 'I can explore and explain different musical concepts, using music vocabulary to discuss and evaluate my own and others'' work.',
 ARRAY['successful_learner'],
 ARRAY['music', 'concepts', 'vocabulary', 'evaluating', 'discussing', 'music theory']),

('EXA 2-04a', 'expressive_arts', 'second',
 'I can respond to the work of artists and performers by discussing my thoughts and feelings. I can give and accept constructive comment on my own and others'' work.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['art', 'performance', 'responding', 'feedback', 'constructive comment', 'evaluation']),

('EXA 2-11a', 'expressive_arts', 'second',
 'Inspired by a range of stimuli, I can create artworks showing my awareness of the basic elements of art using a variety of media.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['art', 'artwork', 'elements of art', 'media', 'creating', 'visual arts', 'inspired']),

('EXA 2-12a', 'expressive_arts', 'second',
 'I can explore and use different creative skills and techniques to communicate my ideas, thoughts and feelings through visual art.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['visual art', 'skills', 'techniques', 'ideas', 'feelings', 'communicating', 'creating']),

('EXA 2-13a', 'expressive_arts', 'second',
 'I can use dramatic conventions to explore and express ideas, thoughts and feelings.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['drama', 'conventions', 'exploring', 'expression', 'ideas', 'feelings', 'role play']),

('EXA 2-14a', 'expressive_arts', 'second',
 'I can create and present performances and productions, applying the skills I have developed in expressive arts.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['performance', 'production', 'presenting', 'drama', 'skills', 'creating']),

('EXA 2-16a', 'expressive_arts', 'second',
 'I can use movement and expression to create my own dance, taking inspiration from a variety of stimuli.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['dance', 'movement', 'expression', 'creating', 'choreography', 'physical']),

-- THIRD/FOURTH LEVEL
('EXA 3-01a', 'expressive_arts', 'third_fourth',
 'I can use my understanding of the expressive arts and their impact on my thoughts, feelings and actions to inform my own work.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['expressive arts', 'impact', 'feelings', 'thoughts', 'creative', 'informing work']),

('EXA 3-02a', 'expressive_arts', 'third_fourth',
 'I can perform with technical skill and musical understanding to express my ideas and feelings.',
 ARRAY['confident_individual', 'successful_learner'],
 ARRAY['music', 'performance', 'technical skill', 'expression', 'ideas', 'feelings']),

('EXA 3-13a', 'expressive_arts', 'third_fourth',
 'I can independently create and present performances and productions to a range of audiences.',
 ARRAY['confident_individual', 'effective_contributor'],
 ARRAY['performance', 'production', 'independent', 'presenting', 'audience', 'drama']),

-- SENIOR PHASE
('EXA 4-02a', 'expressive_arts', 'senior',
 'I can demonstrate advanced technical skill and musical understanding in my work and can evaluate my own and others'' performances critically.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['music', 'advanced', 'technical skill', 'critical evaluation', 'performance']),

('EXA 4-11a', 'expressive_arts', 'senior',
 'I can create ambitious and complex artworks, demonstrating a high level of skill and informed by knowledge of artists and their practice.',
 ARRAY['successful_learner', 'confident_individual'],
 ARRAY['art', 'ambitious', 'complex', 'skill', 'artists', 'practice', 'knowledge']);


-- =============================================================================
-- RELIGIOUS AND MORAL EDUCATION
-- Abbreviation: RME
-- =============================================================================

INSERT INTO cfe_outcomes (reference_code, curriculum_area, level, outcome_text, capacity_tags, keywords) VALUES

-- EARLY LEVEL
('RME 0-01a', 'rme', 'early',
 'I am developing my understanding of Christianity and its place in the world.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['Christianity', 'religion', 'world religions', 'understanding', 'belief']),

('RME 0-02a', 'rme', 'early',
 'I am curious about other faiths and beliefs and am developing my understanding of the difference these make to the lives of the people who have them.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['faiths', 'beliefs', 'religions', 'diversity', 'curiosity', 'understanding']),

('RME 0-09a', 'rme', 'early',
 'I can share my thoughts on different experiences and ideas and am developing my understanding of right and wrong.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['right and wrong', 'moral', 'ethics', 'sharing', 'experiences', 'values']),

-- FIRST LEVEL
('RME 1-01a', 'rme', 'first',
 'I am developing my understanding of Christianity and its place in Scotland and the world.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['Christianity', 'Scotland', 'world', 'religion', 'history', 'culture']),

('RME 1-02a', 'rme', 'first',
 'I can discuss the similarities and differences in the beliefs and practices of other faiths.',
 ARRAY['responsible_citizen', 'successful_learner'],
 ARRAY['faiths', 'beliefs', 'practices', 'similarities', 'differences', 'world religions']),

('RME 1-09a', 'rme', 'first',
 'I can explain why different things are valued by myself and others.',
 ARRAY['confident_individual', 'responsible_citizen'],
 ARRAY['values', 'explaining', 'others', 'moral', 'reflection']),

-- SECOND LEVEL
('RME 2-01a', 'rme', 'second',
 'I can describe the main beliefs and practices of Christianity and explain how these influence the lives of Christians.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['Christianity', 'beliefs', 'practices', 'influence', 'Christians', 'religion']),

('RME 2-02a', 'rme', 'second',
 'I can describe the main beliefs, practices and traditions of world religions and can explain how these influence the lives of their followers.',
 ARRAY['successful_learner', 'responsible_citizen'],
 ARRAY['world religions', 'beliefs', 'practices', 'traditions', 'Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Sikhism']),

('RME 2-04a', 'rme', 'second',
 'I can explain the importance of having a caring and compassionate attitude towards others and can explore this in religious and moral contexts.',
 ARRAY['responsible_citizen', 'confident_individual'],
 ARRAY['compassion', 'caring', 'moral', 'others', 'attitude', 'values']),

('RME 2-09a', 'rme', 'second',
 'I can discuss moral issues and explore the importance of values such as honesty, justice and compassion.',
 ARRAY['responsible_citizen', 'confident_individual'],
 ARRAY['moral issues', 'values', 'honesty', 'justice', 'compassion', 'ethics', 'discussion']),

-- THIRD/FOURTH LEVEL
('RME 3-01a', 'rme', 'third_fourth',
 'I can discuss the impact of Christianity and other world religions on Scottish culture and society.',
 ARRAY['responsible_citizen', 'successful_learner'],
 ARRAY['Christianity', 'world religions', 'Scotland', 'culture', 'society', 'impact']),

('RME 3-09a', 'rme', 'third_fourth',
 'I can analyse moral issues and can debate different viewpoints, explaining my own values and beliefs and those of others.',
 ARRAY['responsible_citizen', 'confident_individual'],
 ARRAY['moral issues', 'debate', 'viewpoints', 'values', 'beliefs', 'analysing', 'ethics']),

-- SENIOR PHASE
('RME 4-02a', 'rme', 'senior',
 'I can critically evaluate the importance and influence of religious belief and practice on individuals and communities.',
 ARRAY['responsible_citizen', 'successful_learner'],
 ARRAY['religion', 'belief', 'practice', 'critical evaluation', 'influence', 'communities']),

('RME 4-09a', 'rme', 'senior',
 'I can construct and critically evaluate arguments on complex moral and ethical issues, drawing on a range of perspectives.',
 ARRAY['responsible_citizen', 'successful_learner'],
 ARRAY['moral issues', 'ethics', 'arguments', 'critical', 'perspectives', 'complex', 'evaluating']);


-- =============================================================================
-- VERIFICATION QUERY
-- Run this after seeding to check counts look right
-- =============================================================================

/*
SELECT
  curriculum_area,
  level,
  COUNT(*) as outcome_count
FROM cfe_outcomes
GROUP BY curriculum_area, level
ORDER BY curriculum_area, level;

-- Expected total: approximately 220+ outcomes across all areas and levels

SELECT COUNT(*) as total_outcomes FROM cfe_outcomes;
*/
