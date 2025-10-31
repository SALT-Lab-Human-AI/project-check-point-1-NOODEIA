CYPHER_PROMPT = """Task: Generate a valid Cypher query statement to query a Neo4j graph database.

CRITICAL: You MUST output ONLY a valid Cypher query. Do NOT include any explanations, comments, or other text.

Instructions:
- Use only the provided relationship types and properties in the schema below
- Do not use any other relationship types or properties that are not provided
- Always filter out NULL values when finding the highest value of a property
- Use LIMIT to prevent returning too many results (default: 10)
- For aggregations (count, sum, avg), use appropriate Cypher functions
- When ordering results, use ORDER BY DESC for "top" or "highest" queries
- Use DISTINCT when counting unique entities
- Return meaningful column names using AS
- Output ONLY the Cypher query, nothing else

Schema:
{schema}

Node Properties:
- User: id, email, name, iconType, iconColor, iconEmoji, xp, level, createdAt, created_at, updated_at
- Session: id, title, created_at, updated_at
- Chat: id, role, content, created_at
- GroupChat: id, name, createdAt, accessKey, createdBy, description
- Message: id, content, createdAt, createdBy, edited, groupId, editedAt, parentId, isAI
- MarkdownNote: content, lastModified, userId
- QuizProgress: userId, totalQuizzes, bestStreak, totalXPFromQuiz, commonCompleted, rareCompleted, legendaryCompleted
- QuizSession: id, userId, completedAt, nodeType, score, totalQuestions, streak, xpEarned
- Chapter: name, order
- Unit: name, content, order
- Activity: type, prompt
- Definition: order, term, definition
- Section: title, content, order, keyPoints
- Example: title, order, problem, solution, explanation
- Problem: type, number, instructions, problems

Relationships:
- (User)-[:HAS]->(Session)
- (User)-[:COMPLETED]->(QuizSession)
- (User)-[:HAS_QUIZ_PROGRESS]->(QuizProgress)
- (User)-[:MEMBER_OF {{role, joinedAt}}]->(GroupChat)
- (User)-[:POSTED]->(Message)
- (Session)-[:OCCURRED]->(Chat)
- (Session)-[:HAS_NOTES]->(MarkdownNote)
- (Chat)-[:NEXT]->(Chat)
- (GroupChat)-[:CONTAINS]->(Message)
- (Message)-[:REPLY_TO]->(Message)
- (Chapter)-[:HAS_UNIT]->(Unit)
- (Unit)-[:CONTAINS]->(Activity)
- (Unit)-[:CONTAINS]->(Definition)
- (Unit)-[:CONTAINS]->(Section)
- (Unit)-[:CONTAINS]->(Problem)
- (Section)-[:CONTAINS]->(Example)

Examples:
Q: "How many users are in the system?"
Cypher: MATCH (u:User) RETURN count(u) as total_users

Q: "Which user has the highest XP?"
Cypher: MATCH (u:User) WHERE u.xp IS NOT NULL RETURN u.name as name, u.xp as xp ORDER BY u.xp DESC LIMIT 1

Q: "List all chapters and their units"
Cypher: MATCH (c:Chapter)-[:HAS_UNIT]->(u:Unit) RETURN c.name as chapter_name, c.order as chapter_order, u.name as unit_name, u.order as unit_order ORDER BY c.order, u.order LIMIT 10

Q: "What sections are in a specific unit?"
Cypher: MATCH (u:Unit)-[:CONTAINS]->(s:Section) WHERE u.name = 'Unit Name' RETURN s.title as section_title, s.order as section_order, s.keyPoints as key_points ORDER BY s.order

Q: "Show users who completed quizzes and their total XP earned"
Cypher: MATCH (u:User)-[:COMPLETED]->(qs:QuizSession) RETURN u.name as user_name, sum(qs.xpEarned) as total_xp_earned ORDER BY total_xp_earned DESC LIMIT 10

Q: "Find all examples in a given section"
Cypher: MATCH (s:Section)-[:CONTAINS]->(e:Example) WHERE s.title = 'Section Title' RETURN e.title as example_title, e.problem as problem, e.solution as solution, e.explanation as explanation ORDER BY e.order

Q: "Explain the example about borrowing in Dots and Boxes"
Cypher: MATCH (s:Section)-[:CONTAINS]->(e:Example) WHERE e.title CONTAINS 'borrow' OR e.problem CONTAINS 'borrow' OR e.explanation CONTAINS 'borrow' OR e.solution CONTAINS 'borrow' RETURN e.title as example_title, e.problem as problem, e.solution as solution, e.explanation as explanation LIMIT 5

Q: "Find an example with a specific title"
Cypher: MATCH (s:Section)-[:CONTAINS]->(e:Example) WHERE e.title CONTAINS 'specific keyword' RETURN e.title as example_title, e.problem as problem, e.solution as solution, e.explanation as explanation ORDER BY e.order LIMIT 10

IMPORTANT RULES:
1. Output ONLY the Cypher query - no explanations, no apologies, no markdown formatting
2. Do not include the word "Cypher:" before your query
3. Do not wrap your query in code blocks or backticks
4. Start directly with MATCH, RETURN, CREATE, or another valid Cypher keyword
5. If you cannot generate a valid query, output: MATCH (n) RETURN n LIMIT 0

The question is:
{question}

Generate the Cypher query now:"""

QA_PROMPT = """Use the following pieces of context retrieved from a Neo4j graph database to answer the question at the end.

If you don't know the answer or if the context is insufficient, just say that you don't have enough information based on the retrieved data. Don't try to make up an answer.

Be concise and direct. Format your answer in a clear, readable way. If the context contains structured data (like lists or multiple records), present it in an organized manner.

Context:
{context}

Question: {question}

Answer:"""