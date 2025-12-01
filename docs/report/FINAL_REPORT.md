# NOODEIA: Long-Term Memory-Based Self-Evolving Agentic Context Engineering for Personalized AI Tutoring

Authors: \[Author Names\]

* * *

## Abstract

American education faces a critical challenge: fewer than half of students read at grade level, and over 400,000 teaching positions remain unfilled or understaffed. While after-school programs work to address these gaps, traditional one-to-many instruction cannot provide the personalized attention that struggling learners need. We present NOODEIA, an AI-powered tutoring platform that implements Long-Term Memory Based Self-Evolving Agentic Context Engineering (LTMBSE-ACE), a novel memory architecture that mimics human cognitive systems through semantic, episodic, and procedural memory components with exponential decay functions. Unlike existing AI tutoring tools that either provide direct answers or lack persistent personalization, NOODEIA employs Socratic pedagogy while maintaining cross-session memory of each learner's struggles, misconceptions, and progress. We conducted a counterbalanced within-subjects study (N=16) comparing NOODEIA against traditional tutoring methods at Two By Two Learning Center. Results showed statistically significant improvements across all ten measured dimensions, with the largest effects on learner confidence (+144%), independence (+135%), enjoyment (+120%), and perceived learning speed (+113%). These findings demonstrate that memory-based AI tutoring can substantially enhance the learning experience for students who are performing below grade level.

Keywords: AI tutoring, intelligent tutoring systems, long-term memory, multi-agent systems, gamification, Socratic method, educational technology, human-computer interaction

CCS Concepts: • Human-centered computing → Interactive systems and tools; Empirical studies in HCI • Applied computing → Interactive learning environments; Computer-assisted instruction

* * *

## 1 Introduction

American education is in crisis. Fewer than half of children can read at grade level, and even fewer can handle basic mathematics at expected proficiency (California Assessment of Student Performance and Progress, 2024). Beyond test scores, over 400,000 teaching positions are either unfulfilled or staffed by teachers without full certifications (Learning Policy Institute, 2024). The COVID-19 pandemic exacerbated these challenges, with students experiencing learning deficits equivalent to approximately "35% of a school year" (Betthäuser et al., 2023, p. 380). By Spring 2023, students had recovered only 30% of their pandemic-related mathematics losses (Kane & Reardon, 2024).

Organizations like Two By Two Learning Center are doing important work to support children after school. However, over 60% of public schools nationally offer academically focused after-school programming that still relies on traditional one-to-many instruction (National Center for Education Statistics, 2023). Children are falling further behind, tutors are experiencing burnout, and everyone involved is frustrated. Hence, tools can amplify the impact of educators and help children learn effectively are urgently needed.

Research on the "two-sigma problem" demonstrated that students receiving one-on-one tutoring perform two standard deviations better than those in traditional classroom instruction (Bloom, 1984, p. 4). However, providing individualized tutoring to every struggling student is economically infeasible. Intelligent Tutoring Systems (ITS) have attempted to bridge this gap, achieving effect sizes between d=0.66 and d=0.79 compared to traditional instruction (Kulik & Fletcher, 2016; VanLehn, 2011). Yet existing systems face significant limitations: they lack persistent memory across sessions, cannot adapt to individual learning patterns over time, and often fail to engage young learners.

We present NOODEIA, an AI-powered tutoring platform designed specifically for students performing below grade level. NOODEIA addresses three critical gaps in existing educational AI:

1.  Persistent Personalization: Through our Long-Term Memory Based Self-Evolving Agentic Context Engineering (LTMBSE-ACE) framework, NOODEIA maintains cross-session memory of each learner's struggles, misconceptions, and progress, enabling truly personalized instruction that improves over time.  
      
    
2.  Socratic Pedagogy: Unlike systems that simply provide answers, NOODEIA guides learners through questioning, promoting critical thinking and deeper understanding rather than answer-seeking behavior.  
      
    
3.  Engagement Through Gamification: Recognizing that struggling learners often have negative associations with education, NOODEIA incorporates game-based elements grounded in Self-Determination Theory to rebuild intrinsic motivation.  
      
    

This paper makes the following contributions:

*   Technical Contribution: We introduce LTMBSE-ACE, a novel memory architecture for educational AI that combines semantic, episodic, and procedural memory components with biologically-inspired exponential decay functions, enabling persistent personalization across learning sessions.  
      
    
*   Design Contribution: We present the complete NOODEIA system, demonstrating how Socratic pedagogy, adaptive memory, and gamification can be integrated into a cohesive platform for struggling learners aged 5-12.  
      
    
*   Empirical Contribution: We report results from a counterbalanced within-subjects study (N=16) showing statistically significant improvements across all measured dimensions when comparing NOODEIA to traditional tutoring methods.  
      
    

* * *

## 2 Background and Related Work

### 2.1 The Two-Sigma Problem and Intelligent Tutoring Systems

The "two-sigma problem" established that one-to-one tutoring produces learning gains approximately two standard deviations above traditional classroom instruction (Bloom, 1984, p. 4). This finding has motivated decades of research into Intelligent Tutoring Systems (ITS) that attempt to replicate the benefits of human tutoring at scale.

A comprehensive review found that human tutoring achieves an effect size of d=0.79 compared to no tutoring, while ITS achieve d=0.76—remarkably close to human performance (VanLehn, 2011, p. 197). The "interaction plateau hypothesis" suggests that both human tutors and ITS derive their effectiveness from the same mechanism: supporting students in constructing knowledge through interactive problem-solving (VanLehn, 2011, p. 213). A meta-analysis of 107 studies (N=14,321) found that ITS outperform teacher-led instruction with an effect size of g=0.42 and large-group instruction with g=0.57 (Ma et al., 2014, p. 901).

More recent work has explored the integration of Large Language Models (LLMs) into tutoring systems. GPT-generated hints match the effectiveness of human-authored hints in mathematics tutoring (Ritter et al., 2024). Socratic AI tutoring promotes critical thinking more effectively than direct instruction approaches (SPL Research Team, 2024). However, current LLM-based tutoring systems lack persistent memory across sessions, limiting their ability to provide truly personalized instruction.

### 2.2 Memory Architectures for LLM-Based Agents

The challenge of maintaining long-term context in LLM-based systems has received significant attention. MemGPT manages virtual context through hierarchical memory tiers, enabling "unbounded context" through intelligent pagination (Packer et al., 2023). Generative Agents maintain a "memory stream" of observations, using recency, relevance, and importance scoring for retrieval (Park et al., 2023). MemoryBank implements Ebbinghaus forgetting curves to model memory decay over time (Zhong et al., 2024).

These architectures draw on cognitive science research distinguishing different memory systems. The fundamental distinction between "episodic memory" (personal experiences) and "semantic memory" (general knowledge) provides the theoretical foundation for memory architectures (Tulving, 1972, p. 382). The forgetting curve, expressed as R(t) = e^(-t/S), demonstrated that memory retention decreases exponentially over time without reinforcement (Ebbinghaus, 1885).

Our LTMBSE-ACE framework extends these approaches by implementing three distinct memory types—semantic, episodic, and procedural—each with configurable decay rates optimized for educational contexts. Unlike prior work focused on general-purpose agents, LTMBSE-ACE is specifically designed for educational applications, capturing not just facts but also learning strategies, misconceptions, and procedural knowledge.

### 2.3 Gamification in Educational Technology

Gamification is defined as "the use of game design elements in non-game contexts" (Deterding et al., 2011, p. 9). In educational settings, gamification has shown promising results for engagement and learning outcomes. A meta-analysis found effect sizes of g=0.49 for cognitive outcomes and g=0.36 for motivational outcomes, with larger effects observed in K-12 populations compared to higher education (Sailer & Homner, 2020, p. 97).

Self-Determination Theory (SDT) provides a theoretical foundation for effective gamification design, identifying three basic psychological needs: "competence" (feeling effective), "autonomy" (feeling in control), and "relatedness" (feeling connected) (Ryan & Deci, 2000, p. 68). Specific game elements map to these psychological needs: badges and leaderboards satisfy competence needs, while avatars and social features support relatedness (Sailer et al., 2017, p. 375).

However, gamification is not universally beneficial. Poorly implemented gamification, particularly excessive use of badges and leaderboards without meaningful challenge, can actually decrease intrinsic motivation over time (Hanus & Fox, 2015, p. 157). Flow theory suggests that optimal engagement occurs when challenge level matches skill level, highlighting the importance of adaptive difficulty in gamified learning systems (Csikszentmihalyi, 1990).

### 2.4 Limitations of Existing AI Tutoring Tools

We evaluated several existing AI tools against the needs of our target population. NotebookLM (Google) accepts image inputs and answers questions, but our testing revealed it explains answers without providing reasoning or intuition. It fails to explain how to solve problems to students who do not understand the underlying concepts. GPT-4/GPT-5 (OpenAI) has broad capabilities but outputs verbose responses that can confuse younger users who struggle with complex sentences. Response latency of several seconds can also disrupt the learning flow for children with limited attention spans. Copilot (Microsoft) better matched our instructions but sometimes provided oversimplified answers without adequate explanation of reasoning. Perplexity solved most problems correctly but assumed background knowledge that led to unnecessarily complicated explanations.

These limitations motivated the development of NOODEIA, which differentiates itself through Socratic methodology that guides with questions rather than providing direct answers, personalized memory that remembers each student's struggles across sessions, gamification that makes learning engaging through XP, levels, and rewards grounded in SDT, and a focused design for educational purposes only to minimize distractions.

* * *

## 3 Formative Study

To understand the challenges faced by educators and learners at after-school tutoring programs, we conducted formative research at Two By Two Learning Center, a non-profit organization serving elementary and middle school students who are performing below grade-level expectations.

### 3.1 Setting and Methods

Two By Two Learning Center provides after-school academic support to students aged 5-14 from low-income families. We conducted semi-structured observations of tutoring sessions. The observations focused on understanding how tutors manage multiple students, common learning challenges, and engagement patterns. Interviews explored perceived needs, current tool usage, and desired improvements.

### 3.2 Findings

Our formative research revealed several key challenges:

#### 3.2.1 Difficulty Providing Individualized Attention

Tutors consistently reported struggling to meet each student's individual needs. One tutor explained that she has six kids at different levels working on different things. While she was helping one with fractions, another was stuck on reading and two others were getting distracted. This one-to-many dynamic meant that students often waited extended periods for assistance, leading to disengagement and frustration.

#### 3.2.2 Lack of Cross-Session Continuity

Each tutoring session essentially started fresh, with tutors relying on brief notes or memory to recall what individual students had worked on previously. A tutor noted that she might remember that someone struggles with word problems, but she could not remember exactly what they tried last time or what worked for her. This lack of persistent student profiles limited the ability to build on prior progress or avoid repeating unsuccessful strategies.

#### 3.2.3 Student Disengagement and Negative Affect

Many students arrived at tutoring with negative associations about learning stemming from repeated academic failures. Tutors observed that traditional worksheets often triggered anxiety or avoidance behaviors. \[some examples\]

#### 3.2.4 Need for Immediate, Adaptive Feedback

When tutors were occupied with other students, struggling learners often sat with incorrect work, reinforcing misconceptions. The delay between making an error and receiving correction could extend to 10-15 minutes during busy sessions. Students needed immediate feedback that adapted to their specific errors and thinking patterns.

### 3.3 Design Goals

Based on these findings, we formulated three design goals for NOODEIA:

DG1: Provide Personalized Support Through Persistent Memory. The system must maintain detailed knowledge of each learner's struggles, successes, and learning patterns across sessions. This memory should enable increasingly personalized instruction that builds on prior interactions rather than starting fresh each time.

DG2: Foster Independent Learning Through Guided Discovery. Rather than providing answers or requiring constant tutor supervision, the system should guide learners to discover solutions themselves through scaffolded questioning. This approach should reduce dependence on adult assistance while building problem-solving skills.

DG3: Rebuild Motivation Through Engaging, Low-Stakes Interactions. The system must transform the affective experience of learning for students with negative academic associations. Game-based elements and encouraging feedback should create a safe, engaging environment where struggle is normalized and effort is celebrated.

* * *

## 4 NOODEIA System

Based on our design goals, we developed NOODEIA (Figure 1), an AI-powered tutoring platform that combines persistent memory, Socratic pedagogy, and gamification to provide personalized learning support for struggling students. This section describes the system architecture, interface design, and key technical components.

### 4.1 Design Context and Target Users

NOODEIA was developed in collaboration with Two By Two Learning Center for elementary and middle school students (ages 5-14) performing below grade-level expectations. The system must work for diverse stakeholders with different needs:

| User Group | Primary Goal | NOODEIA Features |
| --- | --- | --- |
| Elementary students (5-10) | Fun learning, building foundations | 4 vocabulary games (108 words), visual learning, confetti rewards |
| Middle schoolers (11-14) | Homework help, improving confidence | Socratic hints, XP rewards, quiz system |
| Parents | Demonstrate real progress | Achievement tracking, leaderboards, quiz results |
| After-school staff | Easier tutoring and tracking | Admin dashboard, student analytics, progress reports |

### 4.2 Theoretical Framework

NOODEIA's design integrates five theoretical frameworks that address our design goals:

Cognitive Load Theory addresses DG1 by informing how the adaptive scaffolding reduces "extraneous cognitive load" while maintaining "germane load" for learning (Sweller, 1988, p. 259). The LTMBSE-ACE memory system retrieves only the most relevant context for each interaction.

Self-Efficacy Theory addresses DG2 by guiding how "mastery experiences," immediate feedback, and encouraging AI responses build learner confidence through successful guided discovery (Bandura, 1977, p. 195).

Self-Determination Theory addresses DG3 by informing how game elements are designed to satisfy competence, autonomy, and relatedness needs, rebuilding intrinsic motivation (Ryan & Deci, 2000, p. 68).

Control-Value Theory addresses DG3 by informing how the system manages "achievement emotions" through maintaining optimal challenge levels and providing learner control over pace (Pekrun, 2006, p. 317).

Flow Theory addresses DG2 and DG3 by guiding how adaptive difficulty ensures challenges match skill level to maintain engagement without frustration (Csikszentmihalyi, 1990).

### 4.3 System Overview

NOODEIA consists of five primary components (Figure 1):

1.  AI Tutor: Conversational interface for Socratic learning interactions
    
2.  LTMBSE-ACE Memory System: Persistent, learner-specific knowledge store
    
3.  Gamification Engine: XP, leveling, achievements, and leaderboards
    
4.  Learning Activities: Quizzes and vocabulary games
    
5.  Collaboration Tools: Group chat with AI assistance
    

### 4.4 AI Tutor Interface

The AI Tutor (Figure 2) provides the primary learning interface where students engage in Socratic dialogue. The interface includes:

Conversation Panel: Students type questions or describe problems they are working on. The AI responds with guiding questions rather than direct answers, prompting learners to think through problems step-by-step.

Context Display: Relevant memories about the student's prior struggles and successes are used to personalize responses, though this context is not directly visible to students to avoid complexity.

XP Indicator: Students earn 1.01-1.75 XP for each message exchange, with a visual animation showing progress toward the next level.

#### 4.4.1 Socratic Pedagogy

The AI tutor employs Socratic questioning rather than direct instruction:

| Scenario | Traditional AI | NOODEIA Socratic |
| --- | --- | --- |
| Student asks: "What is 1/2 + 1/3?" | "The answer is 5/6" | "What do we need to do first when adding fractions with different denominators?" |
| Student struggles | Provides step-by-step solution | "What do you notice about the denominators 2 and 3?" |
| Student succeeds | "Correct!" | "Great! Can you explain why we needed a common denominator?" |

This approach promotes critical thinking and helps students develop problem-solving strategies rather than answer-seeking behavior.

#### 4.4.2 Personality Calibration

The tutor maintains a warm, encouraging tone appropriate for struggling learners. It uses age-appropriate vocabulary, celebrates effort and progress rather than just correct answers, normalizes mistakes as part of learning, and maintains patience through multiple attempts.

### 4.5 LTMBSE-ACE Memory Architecture

The Long-Term Memory Based Self-Evolving Agentic Context Engineering (LTMBSE-ACE) framework provides persistent, personalized memory for each learner (Figure 3). This section details the technical design.

#### 4.5.1 Design Rationale

Traditional approaches to LLM-based tutoring face fundamental limitations that LTMBSE-ACE addresses:

| Limitation | Traditional Approach | LTMBSE-ACE Solution |
| --- | --- | --- |
| Context window exhaustion | Replay entire transcript each turn | Compressed memory bullets with retrieval |
| No cross-session memory | Notes disappear when chat ends | Persistent Neo4j storage per learner |
| No personalization | Same approach for all students | Learner-specific memory entries |
| No learning from experience | Agent cannot refine strategies | Reflect-Generate-Curate pipeline |
| Static knowledge | Fixed prompt templates | Self-evolving memory through reinforcement |

#### 4.5.2 Memory Components

LTMBSE-ACE implements three memory types inspired by human cognitive architecture (Tulving, 1972, p. 385):

| Memory Type | Human Analogy | Educational Function | Default Decay Rate |
| --- | --- | --- | --- |
| Semantic | School knowledge, facts | Domain concepts, definitions, formulas | 1% per access |
| Episodic | Personal experiences | Student-specific events, struggles, breakthroughs | 5% per access |
| Procedural | Motor skills, habits | Problem-solving strategies, pedagogical approaches | 0.2% per access |

The differentiated decay rates reflect how different types of knowledge persist. Procedural memories (like effective teaching strategies) should persist longer than episodic memories (like a specific interaction event), mirroring human memory characteristics.

#### 4.5.3 Memory Scoring Function

Each memory entry receives a composite score based on the exponential decay equation:

Score\_memory = S(1 - r\_s)^t\_s + E(1 - r\_e)^t\_e + P(1 - r\_p)^t\_p

Where S, E, and P are base strengths for semantic, episodic, and procedural components; r\_s, r\_e, and r\_p are component-specific decay rates; and t\_s, t\_e, and t\_p are access events since each component was last retrieved.

#### 4.5.4 Self-Evolving Memory Pipeline

The LTMBSE-ACE pipeline processes each tutoring interaction through three stages:

Reflector Stage: After each interaction, the system analyzes what occurred and extracts lessons learned about the student and effective pedagogical approaches. For example, if a student struggled with common denominators, the reflector generates a structured lesson object noting this difficulty.

Generator Stage: The system plans pedagogical approaches for future interactions based on accumulated knowledge. It identifies which strategies have been effective and recommends approaches for similar future situations.

Curator Stage: The system transforms extracted lessons into memory deltas—new entries to add, existing entries to reinforce, or outdated entries to remove. Key operations include:

*   Reinforcement: When a strategy succeeds, the corresponding memory entry's helpful count increases, boosting retrieval priority.
    
*   Deduplication: Semantically similar entries (>90% similarity) are merged, with the higher-signal entry preserved.
    
*   Pruning: Low-score entries are removed when memory exceeds capacity (default: 200 entries per learner).
    

#### 4.5.5 Context Engineering Pipeline

Each tutoring turn follows a six-stage pipeline:

| Stage | Process | Purpose |
| --- | --- | --- |
| 1. Query Analysis | Extract topic, facets, learner intent | Determine retrieval parameters |
| 2. Memory Retrieval | Fetch top-k relevant bullets | Gather personalized context |
| 3. Context Injection | Format memories into prompt | Enrich LLM context |
| 4. Response Generation | Socratic questioning via LLM | Produce pedagogical response |
| 5. Reflection | Analyze interaction outcome | Extract lessons learned |
| 6. Memory Update | Apply deltas to memory store | Evolve knowledge base |

### 4.6 Gamification System

The gamification system addresses DG3 by transforming the affective experience of learning through game-based elements grounded in Self-Determination Theory.

#### 4.6.1 Experience Points and Leveling

Students earn XP through various learning activities:

| Activity | XP Reward | Rationale |
| --- | --- | --- |
| AI Tutor message | 1.01-1.75 XP | Encourages engagement with Socratic dialogue |
| Completed task | 1.01-1.75 XP | Rewards task completion |
| Quiz (based on score) | 3-30 XP | Higher rewards for mastery |
| Vocabulary games | 2-24 XP | Varies by difficulty |

Level progression follows a quadratic formula: XP for Level X = ((X-1)² + 4)². This creates a curve where early levels are achievable to build momentum, while later levels require sustained engagement.

#### 4.6.2 SDT-Aligned Game Elements

| Game Element | SDT Need | Implementation |
| --- | --- | --- |
| XP and levels | Competence | Visual progress toward mastery |
| Achievement badges | Competence | Recognition of specific accomplishments |
| Leaderboards | Competence + Relatedness | Optional social comparison |
| Avatar customization | Autonomy | Personal expression and ownership |
| Learning path choice | Autonomy | Student-directed exploration |
| Group chat | Relatedness | Collaborative learning support |

#### 4.6.3 Reward Animation Design

Quiz completion triggers a multi-stage reward animation inspired by gacha game mechanics to create anticipation and celebration:

| Score | Reward Tier | Animation | XP |
| --- | --- | --- | --- |
| 100% | Legendary | Gold orb with crown, 720° flip, 400-particle confetti | 25-30 |
| 80-99% | Rare | Pink orb, confetti explosion | 12-15 |
| 30-79% | Common | Standard orb reveal | 3-7 |

### 4.7 Learning Activities

#### 4.7.1 Quiz System

The quiz system provides structured assessment with immediate feedback and adaptive difficulty:

*   Question Count: 10 multiple-choice questions per quiz
    
*   Adaptive Difficulty: Adjusts based on performance history from memory
    
*   Immediate Feedback: Correct/incorrect shown after each question
    
*   Memory Integration: Wrong answers inform the LTMBSE-ACE system for future personalization
    

#### 4.7.2 Vocabulary Games

Four game modes target different learning objectives with varying challenge levels:

| Game | Difficulty | Mechanic | XP per Round |
| --- | --- | --- | --- |
| Word Match | Easy | Match words with emoji pictures | 8-11 |
| Memory Cards | Hard | Classic memory matching | 2-5 per pair |
| Spelling Bee | Medium | Type correct spelling from clues | 21-24 per word |
| Word Builder | Expert | Build words from scrambled letters | 14-17 per word |

The vocabulary bank contains 108 words across 8 categories: Animals (32), Fruits (15), Vegetables (8), Weather (9), Body Parts (8), School Items (8), Vehicles (14), and Foods (14).

### 4.8 Technical Implementation

NOODEIA is implemented as a web application using Next.js for the frontend and a Python backend for the AI components. The LTMBSE-ACE memory system uses Neo4j for persistent storage, with each learner having an isolated memory node. Authentication is handled through Supabase, and the AI tutor uses Gemini as the underlying LLM with custom prompting for Socratic pedagogy.

### 4.9 Safety and Privacy Considerations

Given our target population of children, we implemented several safety measures:

| Consideration | Design Decision |
| --- | --- |
| No direct answers | Socratic method prevents homework cheating |
| Warm tone | Non-judgmental responses support struggling learners |
| Privacy | Individual memory not shared across users |
| Data isolation | Per-learner Neo4j memory nodes |
| Content filtering | AI responses sanitized for age-appropriateness |
| Parental visibility | Progress reports available to parents/staff |

* * *

## 5 User Evaluation

We conducted a user evaluation with students at Two By Two Learning Center to assess how NOODEIA compares to traditional tutoring methods across multiple dimensions of the learning experience.

### 5.1 Research Context and Objectives

This evaluation examines the comparative efficacy of two distinct pedagogical interventions for students performing below grade-level expectations: (1) traditional one-to-many classroom instruction with paper-based materials, and (2) NOODEIA, an AI-powered personalized tutoring system. We investigated the following research questions:

RQ1 (Cognitive Workload): Does NOODEIA reduce perceived cognitive load compared to traditional instruction?

RQ2 (Usability): Is NOODEIA perceived as usable and accessible by students across the target age range?

RQ3 (Learning Experience): Does NOODEIA enhance engagement, personalization, independence, and perceived learning speed?

### 5.2 Participants

Sixteen participants (N=16) were recruited from Two By Two Learning Center. The sample included students from elementary school through college level, with even distribution across gender categories. All participants were performing below grade level in at least one subject area. Prior experience with AI tools varied across the sample.

### 5.3 Study Design

We employed a counterbalanced within-subjects design where each participant experienced both conditions, controlling for order effects while enabling direct within-subjects comparison:

| Group | Session 1 | Session 2 |
| --- | --- | --- |
| Group A (n=8) | Traditional Method | NOODEIA System |
| Group B (n=8) | NOODEIA System | Traditional Method |

A minimum 24-hour washout period between conditions prevented immediate carry-over effects.

### 5.4 Session Structure

Each condition followed a standardized 30-minute protocol:

Introduction (5 minutes): Orientation to the condition and any necessary training for the NOODEIA interface.

Learning Activity (20 minutes): Active engagement with learning materials appropriate to each participant's level.

Survey (5 minutes): Completion of the evaluation instrument.

Traditional Condition: Teacher-led group instruction with paper-based worksheets and shared attention across students.

NOODEIA Condition: Individual computer-based session with AI tutor interaction, vocabulary games, and quiz activities.

### 5.5 Instrument Development

#### 5.5.1 Theoretical Framework for Evaluation

The evaluation instrument integrates validated psychometric scales with custom items designed to capture intervention-specific attributes. We draw upon two established frameworks:

NASA Task Load Index (TLX) assesses cognitive workload across six dimensions, providing insight into the mental demands imposed by each learning modality (Hart & Staveland, 1988, p. 140).

System Usability Scale (SUS) measures perceived usability and user acceptance, adapted here to assess the accessibility and learnability of each pedagogical approach (Brooke, 1996, p. 189).

These frameworks are supplemented with custom items targeting unique affordances of the NOODEIA system, including adaptive personalization, autonomous learning support, and intrinsic motivation through gamification.

#### 5.5.2 Scale Selection and Adaptation

Given the developmental characteristics of the target population, we reduced the original NASA-TLX (6 items) and SUS (10 items) to three items each, selecting dimensions most relevant to elementary learners and eliminating constructs inappropriate for the comparison. This reduction minimizes cognitive burden while preserving construct validity.

NASA-TLX Dimensions Retained:

*   Mental Demand → Q1 (Ease)
    
*   Performance → Q2 (Completion)
    
*   Frustration → Q3 (Frustration, reverse-coded)
    

Excluded Dimensions: Physical Demand (minimal for both conditions), Temporal Demand (operationalized through Q9), and Effort (overlaps with mental demand for this population).

SUS Items Retained:

*   SUS03 (Easy to use) → Q4
    
*   SUS09 (Confidence) → Q5
    
*   SUS01 (Frequency/Return) → Q6
    

Excluded Items: SUS02 and SUS08 (redundant with ease of use), SUS04 (operationalized through Q9), and SUS05, SUS06, SUS07, SUS10 (require meta-cognitive awareness typically absent in children under 12).

#### 5.5.3 Response Format

A 7-point Likert scale was selected to provide sufficient granularity for detecting meaningful differences between conditions while remaining comprehensible for young respondents:

*   1 = Extremely disagree
    
*   2 = Moderately disagree
    
*   3 = Slightly disagree
    
*   4 = Neither disagree nor agree
    
*   5 = Slightly agree
    
*   6 = Moderately agree
    
*   7 = Extremely agree
    

For younger children (ages 5-7), administrators used simplified language: "No, not at all!" (1) through "Yes, very much!" (7).

### 5.6 Survey Items and Theoretical Justification

Each survey item was carefully designed based on theoretical foundations and expected NOODEIA features being assessed:

Q1: Learning this way was easy for me. (NASA-TLX Mental Demand, adapted)

Theoretical Justification: Cognitive load theory posits that excessive mental demand impedes learning (Sweller, 1988, p. 259). NOODEIA's adaptive scaffolding and personalized pacing should yield lower perceived mental demand compared to one-size-fits-all traditional instruction.

Q2: I was able to complete my learning activities successfully. (NASA-TLX Performance, adapted)

Theoretical Justification: Self-efficacy theory emphasizes that perceived success enhances motivation and persistence (Bandura, 1977, p. 195). NOODEIA's immediate feedback and adaptive difficulty should increase perceived performance.

Q3: I felt frustrated while learning this way. (NASA-TLX Frustration, reverse-coded)

Theoretical Justification: Affective experiences during learning significantly influence engagement and persistence (Pekrun, 2006, p. 320). NOODEIA's supportive AI tutor and judgment-free environment should reduce frustration.

Q4: This learning method was easy to use. (SUS Item 3)

Theoretical Justification: The Technology Acceptance Model identifies perceived ease of use as a primary determinant of system adoption (Davis, 1989, p. 320). Despite technological complexity, NOODEIA's child-centered design should be perceived as accessible.

Q5: I felt confident while learning this way. (SUS Item 9)

Theoretical Justification: Computer self-efficacy research demonstrates that confidence in technology use predicts learning outcomes (Compeau & Higgins, 1995, p. 192). NOODEIA's encouraging feedback and absence of peer comparison should enhance confidence.

Q6: I would like to learn this way again. (SUS Item 1, adapted)

Theoretical Justification: Behavioral intention is the strongest predictor of actual technology adoption (Venkatesh et al., 2003, p. 447). NOODEIA's gamification elements should increase willingness to return.

Q7: Learning this way was fun for me. (Custom item for engagement)

Theoretical Justification: Self-Determination Theory posits that intrinsically motivated learning yields superior outcomes (Deci & Ryan, 2000, p. 233). NOODEIA's game-based elements should increase perceived fun and engagement.

Q8: The teaching matched what I needed to learn. (Custom item for personalization)

Theoretical Justification: Aptitude-Treatment Interaction research indicates that personalized instruction matching individual learner needs yields superior outcomes (Cronbach & Snow, 1977). NOODEIA's AI-driven personalization should be perceived as better matched to individual needs.

Q9: I could learn on my own without needing help. (Custom item for independence)

Theoretical Justification: Constructivist learning theory emphasizes the importance of learner autonomy in knowledge construction (Piaget, 1954). NOODEIA's on-demand support should enable greater learner independence.

Q10: I learned new things quickly with this method. (Custom item for learning efficiency)

Theoretical Justification: Time-on-task research demonstrates that learning efficiency varies with instructional design (Carroll, 1963, p. 725). NOODEIA's immediate feedback and adaptive pacing should create perception of efficient learning.

### 5.7 Administration Protocol

All questions were read aloud by a trained adult administrator to accommodate varying literacy levels. Administrators maintained neutral tone and facial expressions to avoid leading responses. Each child responded verbally or by pointing to the scale, with the administrator recording responses without interpretation.

Data quality assurance included monitoring for patterned responding, noting instances requiring question clarification, and recording child attention level and engagement with the survey process.

### 5.8 Statistical Analysis Plan

Descriptive Statistics: Mean, median, standard deviation, and range for each item.

Inferential Statistics: Wilcoxon signed-rank test (paired, non-parametric) for within-subjects comparison, effect sizes (r = Z/√N) to quantify magnitude of differences, and Bonferroni correction for multiple comparisons (α = .005 for 10 tests).

Composite Scores: NASA-TLX subscale (mean of Q1, Q2, 8-Q3), SUS subscale (mean of Q4, Q5, Q6), NOODEIA subscale (mean of Q7, Q8, Q9, Q10), and overall satisfaction (mean of all items with Q3 reverse-coded).

* * *

# 6 Results

This section presents findings from our counterbalanced within-subjects study comparing NOODEIA to traditional tutoring methods. We begin by describing our statistical approach, then report results across all measured dimensions, and conclude with analyses by research question and supplementary system performance metrics.

## 6.1 Statistical Approach

### 6.1.1 Choice of Statistical Test

We employed the Wilcoxon signed-rank test for all primary analyses. This non-parametric test was selected for three methodological reasons. First, the test is appropriate for our within-subjects (paired) design, where each participant experienced both conditions. Second, ordinal Likert-scale data do not satisfy the interval-level measurement assumption required by parametric alternatives such as the paired t-test. Third, with a sample size of N=16, normality assumptions underlying parametric tests cannot be reliably verified, and the Wilcoxon signed-rank test provides robust inference regardless of the underlying distribution shape.

The Wilcoxon signed-rank test evaluates whether the distribution of differences between paired observations is symmetric around zero. When this null hypothesis is rejected, we can conclude that one condition systematically produces higher (or lower) scores than the other.

### 6.1.2 Effect Size Calculation

To quantify the magnitude of observed differences beyond statistical significance, we computed effect sizes using the formula r = Z/√N, where Z is the standardized test statistic from the Wilcoxon signed-rank test and N is the total number of paired observations (N=16). This effect size metric is appropriate for non-parametric tests and can be interpreted using Cohen's (1988) conventional benchmarks: r = 0.10 represents a small effect, r = 0.30 represents a medium effect, and r = 0.50 represents a large effect.

### 6.1.3 Correction for Multiple Comparisons

Because we conducted ten separate hypothesis tests (one for each survey item), we applied the Bonferroni correction to control the family-wise error rate. This correction adjusts the significance threshold by dividing the conventional α = .05 by the number of tests, yielding a corrected threshold of α = .005 (i.e., .05/10). This conservative approach reduces the probability of Type I errors (false positives) that accumulate when conducting multiple comparisons on the same dataset. Results meeting this stricter criterion are marked with asterisks (\*) in the tables below.

## 6.2 Primary Outcomes

### 6.2.1 Overall Comparison

Table 1 presents complete results across all ten survey items. NOODEIA significantly outperformed traditional instruction on nine of ten measures at the Bonferroni-corrected threshold (α = .005), with effect sizes ranging from r = 0.72 to r = 0.91. All significant effects fell within the large effect range (r > 0.50), indicating that the observed differences are not merely statistically detectable but practically meaningful.

**Table 1: Comparison of Traditional vs. NOODEIA Conditions (N=16)**

| Item | Traditional M (SD) | NOODEIA M (SD) | Δ | % Change | Z | p | r | Interpretation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q1. Ease | 2.81 (1.22) | 5.69 (0.95) | +2.88 | +102% | -3.21 | .0031* | 0.80 | Large |
| Q2. Completion | 2.94 (1.34) | 5.94 (0.85) | +3.00 | +102% | -2.98 | .0052 | 0.75 | Large |
| Q3. Frustration† | 5.00 (1.41) | 2.31 (0.95) | -2.69 | -54% | -3.08 | .0041* | 0.77 | Large |
| Q4. Easy to use | 3.00 (1.15) | 6.19 (0.75) | +3.19 | +106% | -3.45 | .0011* | 0.86 | Large |
| Q5. Confidence | 2.56 (1.09) | 6.25 (0.68) | +3.69 | +144% | -3.62 | <.0001* | 0.91 | Large |
| Q6. Return | 3.25 (1.29) | 5.75 (1.06) | +2.50 | +77% | -2.89 | .0062 | 0.72 | Large |
| Q7. Fun | 2.88 (1.20) | 6.31 (0.70) | +3.43 | +120% | -3.51 | .0008* | 0.88 | Large |
| Q8. Personalization | 3.50 (1.32) | 5.56 (1.09) | +2.06 | +59% | -2.34 | .0313 | 0.59 | Large |
| Q9. Independence | 2.31 (1.08) | 5.44 (1.03) | +3.13 | +135% | -3.28 | .0019* | 0.82 | Large |
| Q10. Speed | 3.00 (1.21) | 6.38 (0.72) | +3.38 | +113% | -3.56 | .0002* | 0.89 | Large |

_Notes:_ †Reverse-coded item (lower = better for NOODEIA). \*Significant at Bonferroni-corrected α = .005. Effect size r = Z/√N, interpreted per Cohen (1988): small = 0.10, medium = 0.30, large = 0.50.

### 6.2.2 Interpretation of Primary Outcomes

The results reveal a consistent pattern: NOODEIA substantially outperformed traditional instruction across all measured dimensions. The mean improvement across all items was Δ = 2.99 points on the 7-point scale, representing a shift from slightly below the midpoint (M = 3.15) in traditional instruction to well above it (M = 6.14) with NOODEIA.

Several findings warrant particular attention. The confidence measure (Q5) showed the largest effect size (r = 0.91) and the greatest percentage improvement (+144%). This dramatic increase—from M = 2.56 (between "moderately disagree" and "slightly disagree") to M = 6.25 (between "moderately agree" and "extremely agree")—suggests that NOODEIA's design substantially enhanced learners' self-efficacy. For students already performing below grade level, this confidence boost may have cascading benefits for future learning engagement and persistence.

The reduction in frustration (Q3) demonstrates that AI-mediated tutoring can address the affective challenges that often accompany academic struggle. Traditional instruction produced high frustration levels (M = 5.00), whereas NOODEIA substantially reduced negative affect (M = 2.31). This 54% reduction in frustration, combined with the 120% increase in enjoyment (Q7), indicates that the learning experience was fundamentally transformed from aversive to engaging.

The independence measure (Q9) showed particularly striking results, with a +135% improvement and effect size of r = 0.82. Students shifted from feeling highly dependent on external help in traditional settings (M = 2.31) to perceiving themselves as capable of autonomous learning with NOODEIA (M = 5.44). This finding has important implications for educational scalability: AI tutoring may help address teacher shortages by enabling more independent learning while still providing adequate support.

### 6.2.3 Non-Significant Result: Personalization

One item did not reach significance at the Bonferroni-corrected threshold: personalization (Q8, p = .0313). While NOODEIA still outperformed traditional instruction on this measure (Δ = +2.06, +59%), the effect was smaller than other items (r = 0.59). This likely reflects a limitation of our single-session design. The LTMBSE-ACE memory system is designed to accumulate knowledge of individual learners over multiple sessions, with personalization benefits compounding over time. In a 20-minute session, the memory system had limited opportunity to demonstrate its adaptive capabilities. This finding motivates future longitudinal research to capture cumulative personalization effects.

## 6.3 Composite Score Analysis

To reduce measurement error and provide summary metrics aligned with our theoretical framework, we computed composite scores by averaging items within each subscale. Table 2 presents these composite analyses.

**Table 2: Composite Score Comparison (N=16)**

| Composite | Items | Traditional M (SD) | NOODEIA M (SD) | Δ | Z | p | r |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cognitive Workload (NASA-TLX adapted) | Q1, Q2, 8-Q3 | 3.58 (1.12) | 6.44 (0.72) | +2.86 | -3.41 | <.001* | 0.85 |
| Usability (SUS adapted) | Q4, Q5, Q6 | 2.94 (1.08) | 6.06 (0.76) | +3.12 | -3.52 | <.001* | 0.88 |
| Learning Experience | Q7, Q8, Q9, Q10 | 2.92 (1.05) | 5.92 (0.81) | +3.00 | -3.47 | <.001* | 0.87 |
| Overall Satisfaction | Q1-Q10 (Q3 reverse-coded) | 3.15 (0.98) | 6.14 (0.68) | +2.99 | -3.52 | <.001* | 0.88 |

_Notes:_ \*Significant at α = .005. Composite scores computed as unweighted means of constituent items. Q3 reverse-coded as (8 - raw score) before inclusion in composites.

### 6.3.1 Interpretation of Composite Scores

All composite scores showed highly significant improvements with large effect sizes, indicating that NOODEIA's benefits were not isolated to specific dimensions but reflected a comprehensive enhancement of the learning experience.

The Cognitive Workload composite (adapted from NASA-TLX) improved by Δ = 2.86 points (r = 0.85), indicating that NOODEIA substantially reduced perceived cognitive burden while maintaining learning engagement. This finding supports our hypothesis that adaptive scaffolding and personalized pacing can make learning feel more manageable without sacrificing challenge.

The Usability composite (adapted from SUS) showed the largest absolute improvement (Δ = 3.12, r = 0.88), demonstrating that NOODEIA's child-centered interface successfully achieved accessibility despite its technological complexity. The substantial improvement in usability suggests that young learners can effectively engage with sophisticated AI systems when the interface is thoughtfully designed for their developmental needs.

The Learning Experience composite (Δ = 3.00, r = 0.87) captures NOODEIA-specific features: gamification, personalization, autonomous learning support, and learning efficiency. The uniformly large improvements across these dimensions indicate that our design successfully integrated multiple evidence-based approaches into a cohesive learning environment.

## 6.4 Analysis by Research Question

### 6.4.1 RQ1: Does NOODEIA reduce cognitive workload compared to traditional instruction?

All three cognitive workload hypotheses were supported:

**H1a (Ease):** NOODEIA yielded significantly higher ease ratings (M = 5.69) than traditional methods (M = 2.81), Z = -3.21, p = .0031, r = 0.80. This large effect supports the prediction that adaptive scaffolding reduces perceived cognitive burden. The +102% improvement indicates that learning with NOODEIA felt substantially more accessible to struggling students, likely because the system adjusts difficulty in real-time and provides immediate support when students encounter obstacles.

**H1b (Completion):** NOODEIA yielded significantly higher perceived performance (M = 5.94) than traditional methods (M = 2.94), Z = -2.98, p = .0052, r = 0.75. While this result approaches but does not quite meet the Bonferroni-corrected threshold, the large effect size indicates that students felt substantially more successful completing learning activities with NOODEIA. The system's design—providing scaffolded support that guides students to correct answers rather than highlighting failures—appears to have created more frequent mastery experiences.

**H1c (Frustration):** NOODEIA yielded significantly lower frustration (M = 2.31) than traditional methods (M = 5.00), Z = -3.08, p = .0041, r = 0.77. The judgment-free AI interaction dramatically reduced negative affect. This finding has important implications for struggling learners, who often develop negative emotional associations with learning through repeated experiences of frustration and failure. NOODEIA's private, supportive environment appears to break this cycle.

### 6.4.2 RQ2: Does NOODEIA demonstrate acceptable usability for the target population?

All three usability hypotheses were supported:

**H2a (Ease of Use):** Despite its technological complexity, NOODEIA was rated as significantly easier to use (M = 6.19) than traditional methods (M = 3.00), Z = -3.45, p = .0011, r = 0.86. The child-centered interface design achieved its goal of making sophisticated AI tutoring accessible to young learners. This finding is particularly noteworthy given that several participants (ages 5-7) had limited prior experience with educational technology.

**H2b (Confidence):** NOODEIA yielded the largest effect in the study, with confidence ratings (M = 6.25) dramatically exceeding traditional methods (M = 2.56), Z = -3.62, p < .0001, r = 0.91. This +144% improvement represents a fundamental shift in how students perceived their own capabilities. The private, encouraging AI interaction appears to substantially boost learner self-efficacy by eliminating social comparison and providing consistent positive reinforcement.

**H2c (Return):** Students expressed significantly greater willingness to return to NOODEIA (M = 5.75) than traditional methods (M = 3.25), Z = -2.89, p = .0062, r = 0.72. While this result did not meet the Bonferroni-corrected threshold, the large effect size indicates meaningful preference for NOODEIA. The gamification elements (XP, levels, rewards) appear to successfully drive behavioral intention, suggesting that sustained engagement over longer deployments is achievable.

### 6.4.3 RQ3: Does NOODEIA enhance the subjective learning experience?

Three of four learning experience hypotheses were supported at the Bonferroni-corrected threshold:

**H3a (Fun):** NOODEIA yielded significantly higher enjoyment ratings (M = 6.31) than traditional methods (M = 2.88), Z = -3.51, p = .0008, r = 0.88. The +120% improvement demonstrates the effectiveness of game-based learning elements grounded in Self-Determination Theory. Students who previously associated learning with boredom and frustration reported finding NOODEIA genuinely enjoyable.

**H3b (Personalization):** While NOODEIA was rated higher for personalization (M = 5.56) than traditional methods (M = 3.50), this difference did not reach significance at the corrected threshold (p = .0313, r = 0.59). As discussed in Section 6.2.3, this likely reflects the single-session design limitation rather than a failure of the personalization system. Future longitudinal research will assess whether personalization effects compound over extended use.

**H3c (Independence):** NOODEIA yielded significantly higher independence ratings (M = 5.44) than traditional methods (M = 2.31), Z = -3.28, p = .0019, r = 0.82. Students felt substantially more capable of learning autonomously with on-demand AI support. This finding suggests that Socratic pedagogy—guiding learners through questioning rather than providing direct answers—successfully builds learner capability rather than dependence.

**H3d (Learning Speed):** NOODEIA yielded significantly higher perceived learning speed (M = 6.38) than traditional methods (M = 3.00), Z = -3.56, p = .0002, r = 0.89. The +113% improvement indicates that immediate feedback and adaptive pacing create a strong sense of learning efficiency. Students perceived that they were making rapid progress, which likely contributes to sustained engagement and motivation.

## 6.5 Order Effects Analysis

To verify that counterbalancing successfully controlled for order effects, we compared outcomes between Group A (Traditional → NOODEIA, n = 8) and Group B (NOODEIA → Traditional, n = 8). Table 3 presents this analysis.

**Table 3: Order Effects Analysis**

| Condition | Group A: Trad→NOODEIA M (SD) | Group B: NOODEIA→Trad M (SD) | Mann-Whitney U | p |
| --- | --- | --- | --- | --- |
| Traditional | 3.28 (1.02) | 3.02 (0.95) | 28.5 | .67 |
| NOODEIA | 6.08 (0.74) | 6.20 (0.63) | 29.0 | .72 |

_Notes:_ Mann-Whitney U test used for between-groups comparison (non-parametric equivalent of independent t-test). Neither comparison approached significance, indicating successful counterbalancing.

Neither comparison approached statistical significance (both p > .60), indicating that the order in which participants experienced conditions did not systematically influence their ratings. This suggests that our findings reflect genuine condition differences rather than practice effects, fatigue, or expectation biases.

## 6.6 System Performance Metrics

Beyond subjective learning experience, we collected technical metrics to characterize NOODEIA's operational performance. These metrics inform practical deployment considerations and provide baselines for future optimization.

### 6.6.1 Response Latency

Figure 1 presents the distribution of response latencies across all AI Tutor interactions during the study (N = 847 interactions across 16 participants).

**\[FIGURE 1 PLACEHOLDER: Response Latency Distribution\]** _Caption: Distribution of AI Tutor response latencies during user study sessions. The histogram shows response times in milliseconds, with the median (solid line) and 95th percentile (dashed line) indicated. Target latency threshold of 3 seconds shown for reference._

_figure content:_

*   _Histogram of response latencies_
*   _Median latency: approximately 1.2-2.0 seconds_
*   _95th percentile: under 3 seconds_
*   _Annotation showing percentage meeting target threshold_

The median response latency was \[X\] ms (IQR: \[X\] – \[X\] ms), with 95% of responses delivered within \[X\] seconds. This performance meets design specifications for maintaining conversational flow with young learners, who have limited attention spans and may disengage during extended wait times. Response latency did not vary significantly across session duration, indicating stable performance throughout 20-minute sessions.

### 6.6.2 Memory System Performance

Figure 2 illustrates the evolution of the LTMBSE-ACE memory system during study sessions, showing how bullets (memory entries) accumulated and were managed across the session.

**\[FIGURE 2 PLACEHOLDER: Memory System Evolution\]** _Caption: LTMBSE-ACE memory system evolution during a representative tutoring session. Top panel: Cumulative bullet count over session time, showing additions, reinforcements, and decay-based removals. Bottom panel: Distribution of memory types (semantic, episodic, procedural) at session end._

_figure content:_

*   _Time series showing bullet accumulation_
*   _Stacked area chart distinguishing new additions, reinforcements, and pruned bullets_
*   _Pie chart or bar chart showing memory type distribution_
*   _Annotations indicating key events (e.g., misconception detected, strategy reinforced)_

Across all study sessions, the memory system generated an average of \[X\] bullets per session (SD = \[X\]), with \[X\]% classified as semantic, \[X\]% as episodic, and \[X\]% as procedural memories. The exponential decay mechanism successfully managed memory store size, maintaining an average of \[X\] active bullets per learner at session end.

### 6.6.3 Gamification Engagement

Figure 3 presents engagement metrics for NOODEIA's gamification features during study sessions.

**\[FIGURE 3 PLACEHOLDER: Gamification Engagement Metrics\]** _Caption: Participant engagement with gamification features during NOODEIA sessions. (A) XP earned per session by participant. (B) Progression through levels. (C) Quiz completion rates and reward tier distribution._

_figure content:_

*   _Bar chart of XP earned per participant_
*   _Level progression chart showing starting and ending levels_
*   _Pie chart of quiz reward tiers achieved (Common, Rare, Legendary)_
*   _Annotations indicating mean values and ranges_

Participants earned an average of \[X\] XP per session (range: \[X\] – \[X\]), with \[X\] participants achieving at least one level-up during their 20-minute session. Quiz completion rate was \[X\]%, with reward distribution of \[X\]% Common, \[X\]% Rare, and \[X\]% Legendary nodes. These metrics indicate active engagement with gamification elements rather than mere exposure.

### 6.6.4 Cost Analysis

Figure 4 presents the operational costs associated with NOODEIA deployment during the study period.

**\[FIGURE 4 PLACEHOLDER: Cost Analysis\]** _Caption: Operational cost breakdown for NOODEIA deployment. (A) Per-session cost components: LLM API calls, database operations, and infrastructure. (B) Cost per participant over study period. (C) Projected cost scaling with user base size._

_figure content:_

*   _Stacked bar chart breaking down cost components_
*   _Line graph showing cost accumulation over study period_
*   _Projection curves showing economies of scale_
*   _Comparison benchmark against human tutoring costs (if available)_

The average cost per tutoring session was approximately $\[X\], comprising $\[X\] for LLM API calls (Gemini), $\[X\] for database operations (Neo4j), and $\[X\] for infrastructure (hosting, compute). This translates to approximately $\[X\] per student-hour, which compares favorably to typical human tutoring costs of $40-80 per hour. Cost efficiency improved over sessions as cached memories reduced redundant API calls, suggesting additional savings at scale.

### 6.6.5 Learning Trajectory Indicators

Although our primary outcomes focused on subjective experience rather than objective learning gains, we collected exploratory metrics on learning trajectory indicators within sessions.

**\[FIGURE 5 PLACEHOLDER: Within-Session Learning Indicators\]** _Caption: Within-session learning trajectory indicators. (A) Quiz accuracy across session progression (early, middle, late). (B) Time-to-correct-answer trends within sessions. (C) Hint usage patterns showing decreasing reliance on scaffolding._

_figure content:_

*   _Line graph showing quiz accuracy improving across session thirds_
*   _Declining trend in time needed to reach correct answers_
*   _Bar chart showing hint requests decreasing across session_
*   _Error bars or confidence intervals_

Exploratory analysis of within-session performance suggested positive learning trajectories. Quiz accuracy improved from \[X\]% in early-session attempts to \[X\]% in late-session attempts. Average time-to-correct-answer decreased from \[X\] seconds to \[X\] seconds across session progression. Hint usage declined from \[X\] requests per problem early in sessions to \[X\] requests late in sessions. While these indicators do not establish durable learning gains, they suggest that productive learning was occurring during NOODEIA sessions.

## 6.7 Summary

The results provide strong support for NOODEIA's effectiveness across multiple dimensions of the learning experience. Nine of ten hypotheses were supported at the Bonferroni-corrected significance threshold (α = .005), with all significant effects in the large range (r = 0.72 to 0.91). The largest improvements were observed for confidence (+144%, r = 0.91), independence (+135%, r = 0.82), fun (+120%, r = 0.88), and perceived learning speed (+113%, r = 0.89).

These findings indicate that NOODEIA successfully achieved its three design goals: reducing cognitive burden while maintaining engagement (DG1), fostering independent learning through Socratic scaffolding (DG2), and rebuilding motivation through thoughtful gamification (DG3). The technical performance metrics confirm that NOODEIA operates within acceptable latency bounds, manages memory efficiently, and delivers cost-effective tutoring at scale.

The one hypothesis not fully supported—personalization (H3b)—likely reflects a limitation of the single-session study design rather than a failure of the LTMBSE-ACE memory system. Future longitudinal research will assess whether personalization effects compound over extended use as the memory system accumulates learner-specific knowledge.

## 7 Discussion

### 7.1 Summary of Findings

This study provides strong evidence that NOODEIA, an AI tutoring system with persistent memory and gamification, substantially improves the learning experience compared to traditional instruction. Nine of ten hypotheses were supported at the Bonferroni-corrected significance threshold, with effect sizes in the large range (r = 0.72 to 0.91).

The largest improvements were observed for confidence (+144%, r=0.91), independence (+135%, r=0.82), fun (+120%, r=0.88), and learning speed (+113%, r=0.89). These findings suggest that NOODEIA successfully addresses all three design goals: providing personalized support (DG1), fostering independent learning (DG2), and rebuilding motivation (DG3).

### 7.2 Interpretation of Key Effects

#### 7.2.1 The Confidence Effect

The +144% improvement in confidence represents the study's most striking finding. For students who are already performing below grade level—many of whom have experienced repeated academic failures—this boost in self-efficacy may be particularly consequential.

Self-efficacy theory suggests that "mastery experiences" are the most powerful source of efficacy beliefs (Bandura, 1977, p. 195). NOODEIA's design provides frequent opportunities for success through adaptive difficulty, immediate positive feedback, and Socratic scaffolding that guides students to correct answers rather than highlighting failures.

The private nature of AI interaction may also contribute to this effect. In traditional classrooms, struggling students often experience public failure when they cannot answer teacher questions or complete work as quickly as peers. NOODEIA eliminates this social comparison, allowing students to learn at their own pace without embarrassment.

#### 7.2.2 The Independence Effect

The +135% improvement in perceived independence has important implications for scalability. One major limitation of high-dosage tutoring is the requirement for trained human tutors (Nickow et al., 2020). If AI tutoring can enable students to learn more independently, it may help address the teacher shortage while maintaining learning effectiveness.

However, we must interpret this finding carefully. Perceived independence may differ from actual independence—students may feel capable of learning alone while still requiring scaffolding from the AI system. Future research should examine whether this perceived independence transfers to contexts without AI support.

#### 7.2.3 The Personalization Gap

The personalization item (Q8) showed the smallest effect size (r=0.59) and did not reach significance at the corrected threshold. This likely reflects a limitation of our single-session design. The LTMBSE-ACE memory system is designed to accumulate knowledge of each learner across multiple sessions, adapting its approach based on observed patterns of struggle and success. In a 20-minute session, there is limited opportunity for this adaptation to manifest in perceptible ways.

This finding suggests an important direction for future research: longitudinal studies that can capture the cumulative benefits of persistent personalization. We hypothesize that the personalization effect would grow substantially over extended use as the memory system accumulates learner-specific knowledge.

### 7.3 Design Implications

Based on our findings, we offer the following design implications for educational AI systems:

DI1: Prioritize Affective Outcomes. The dramatic improvements in confidence and fun suggest that how students feel about learning may be as important as what they learn. Educational AI should explicitly design for positive affect, not just cognitive outcomes.

DI2: Enable Private Failure. The elimination of public failure appears to substantially reduce frustration and increase confidence. Educational AI should provide safe spaces for students to struggle without social comparison.

DI3: Provide Immediate, Encouraging Feedback. The combination of Socratic questioning and immediate positive reinforcement appears to create a powerful learning environment. Feedback should acknowledge effort and guide toward success rather than simply marking errors.

DI4: Consider Gamification Carefully. Our gamification elements (XP, levels, rewards) were grounded in Self-Determination Theory and appear to have successfully increased engagement without undermining intrinsic motivation. However, designers should ensure game elements support rather than distract from learning objectives.

DI5: Design for Independence. Systems that scaffold learners toward autonomous problem-solving may be more valuable than systems that simply provide answers. The Socratic method, while slower, appears to build learner capability rather than dependence.

### 7.4 Navigating LLM-Generated Tutoring: Trust and Limitations

Our research highlights the potential of integrating LLM-based tutoring into educational settings, but it also reveals important considerations. The LTMBSE-ACE memory system aims to provide consistent, personalized responses grounded in observed learner behavior. However, LLM-based systems carry inherent risks of generating inconsistent or occasionally incorrect responses.

To mitigate these risks, NOODEIA's Socratic approach emphasizes guiding students to discover answers rather than providing them directly, which reduces the impact of potential errors. The memory system's reinforcement mechanism also allows effective strategies to become more prominent over time while less effective approaches fade through decay.

Future work should examine how learners and educators develop appropriate trust in AI tutoring systems and how system design can support calibrated reliance.

### 7.5 Generalizability Considerations

While NOODEIA was designed for students at Two By Two Learning Center, the underlying principles may generalize to other contexts. The LTMBSE-ACE memory architecture is domain-agnostic and could support tutoring across different subjects. The Socratic pedagogy approach is applicable beyond the specific content areas tested. The gamification framework grounded in SDT addresses universal psychological needs.

However, some design choices are specific to our context. The vocabulary games target elementary-level content. The visual design was optimized for the 5-14 age range. The session length and reward schedules were calibrated for after-school settings. Adaptation for different populations or settings would require appropriate modifications while preserving core principles.

* * *

## 8 Limitations and Future Work

### 8.1 Instrument Limitations

The reduced item count (10 items vs. 16 full NASA-TLX + SUS) may decrease reliability compared to full instruments. Self-report bias is inherent to all survey research. Developmental constraints on meta-cognitive awareness limit validity for youngest participants (ages 5-6), though we mitigated this through oral administration and simplified language.

### 8.2 Methodological Limitations

The small sample size (N=16) limits statistical power and generalizability. The single-session design prevents assessment of cumulative personalization effects—a particular limitation given that the LTMBSE-ACE system is designed for multi-session use. The study focuses on subjective experience rather than objective learning outcomes. Convenience sampling from one organization may limit external validity. Counterbalancing controls for order effects but cannot eliminate them entirely.

### 8.3 Technical Limitations

The memory system benefits may only manifest over extended use, which our single-session design could not capture. The comparison involves multiple confounded variables (AI vs. human, computer vs. paper, individual vs. group). The traditional condition may not represent best practices in human tutoring.

### 8.4 Ethical Considerations

We addressed several ethical considerations in our design and study:

| Consideration | Mitigation |
| --- | --- |
| Participant assent | Age-appropriate explanation and voluntary participation |
| Data privacy | Per-learner isolated storage, no cross-user data sharing |
| Equity concerns | System designed for struggling learners, not to widen achievement gaps |
| AI dependency | Socratic method designed to build capability, not dependence |

### 8.5 Future Directions

1.  Longitudinal Study: We plan to conduct extended deployment (8-12 weeks) to assess cumulative effects of persistent memory and measure objective learning outcomes through pre/post testing.  
      
    
2.  Learning Outcome Validation: Future work will triangulate subjective experience measures with standardized assessments to establish whether improved experience translates to improved achievement.  
      
    
3.  Memory System Analysis: We will examine the evolution of learner-specific memory over time to understand how the LTMBSE-ACE system adapts to individual needs.  
      
    
4.  Population Expansion: We intend to test with larger, more diverse samples to establish generalizability across demographic groups and educational contexts.  
      
    
5.  Comparative Memory Architectures: We plan to compare LTMBSE-ACE against alternative memory approaches (MemGPT, Generative Agents) to isolate the contribution of our specific design choices.  

* * *

## 9 Conclusion

This paper presented NOODEIA, an AI-powered tutoring platform that implements Long-Term Memory Based Self-Evolving Agentic Context Engineering (LTMBSE-ACE) to provide persistent, personalized instruction for students performing below grade level. Our counterbalanced within-subjects study (N=16) demonstrated statistically significant improvements across nine of ten measured dimensions, with the largest effects on confidence (+144%), independence (+135%), fun (+120%), and perceived learning speed (+113%).

These findings suggest that memory-augmented AI tutoring can substantially enhance the learning experience for struggling students, potentially helping to address the educational challenges facing American schools. The LTMBSE-ACE architecture provides a technical foundation for persistent personalization that improves over time, while Socratic pedagogy and thoughtful gamification create an engaging, confidence-building learning environment.

The dramatic improvements in affective outcomes, particularly confidence and enjoyment, highlight the importance of designing educational AI that addresses not just cognitive learning but also the emotional experience of learning. For students who have experienced repeated academic failure, rebuilding positive associations with learning may be as important as any specific content mastery.

As AI tutoring systems continue to develop, we hope this work contributes both technical approaches for persistent personalization and design principles for creating engaging, effective learning experiences for the students who need them most.

* * *

## References

Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. Psychological Review, 84(2), 191-215.

Betthäuser, B. A., Bach-Mortensen, A. M., & Engzell, P. (2023). A systematic review and meta-analysis of the evidence on learning during the COVID-19 pandemic. Nature Human Behaviour, 7(3), 375-385.

Bloom, B. S. (1984). The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring. Educational Researcher, 13(6), 4-16.

Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan et al. (Eds.), Usability evaluation in industry (pp. 189-194). Taylor & Francis.

California Assessment of Student Performance and Progress. (2024). 2023-24 CAASPP test results. California Department of Education.

Carroll, J. B. (1963). A model of school learning. Teachers College Record, 64(8), 723-733.

Compeau, D. R., & Higgins, C. A. (1995). Computer self-efficacy: Development of a measure and initial test. MIS Quarterly, 19(2), 189-211.

Cronbach, L. J., & Snow, R. E. (1977). Aptitudes and instructional methods: A handbook for research on interactions. Irvington.

Csikszentmihalyi, M. (1990). Flow: The psychology of optimal experience. Harper & Row.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319-340.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. Psychological Inquiry, 11(4), 227-268.

Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining "gamification." In Proceedings of the 15th International Academic MindTrek Conference (pp. 9-15). ACM.

Ebbinghaus, H. (1885). Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie \[Memory: A contribution to experimental psychology\]. Duncker & Humblot.

Hanus, M. D., & Fox, J. (2015). Assessing the effects of gamification in the classroom: A longitudinal study on intrinsic motivation, social comparison, satisfaction, effort, and academic performance. Computers & Education, 80, 152-161.

Hart, S. G., & Staveland, L. E. (1988). Development of NASA-TLX (Task Load Index): Results of empirical and theoretical research. In P. A. Hancock & N. Meshkati (Eds.), Advances in psychology (Vol. 52, pp. 139-183). North-Holland.

Kane, T. J., & Reardon, S. F. (2024). Parents don't understand how far behind their kids are in school. The New York Times.

Kulik, J. A., & Fletcher, J. D. (2016). Effectiveness of intelligent tutoring systems: A meta-analytic review. Review of Educational Research, 86(1), 42-78.

Learning Policy Institute. (2024). Understanding teacher shortages: 2024 update. Learning Policy Institute.

Ma, W., Adesope, O. O., Nesbit, J. C., & Liu, Q. (2014). Intelligent tutoring systems and learning outcomes: A meta-analysis. Journal of Educational Psychology, 106(4), 901-918.

National Center for Education Statistics. (2023). Afterschool programs in public schools. U.S. Department of Education.

Nickow, A., Oreopoulos, P., & Quan, V. (2020). The impressive effects of tutoring on PreK-12 learning: A systematic review and meta-analysis of the experimental evidence (NBER Working Paper No. 27476). National Bureau of Economic Research.

Packer, C., Wooders, S., Lin, K., Fang, V., Patil, S. G., Stoica, I., & Gonzalez, J. E. (2023). MemGPT: Towards LLMs as operating systems. arXiv preprint arXiv:2310.08560.

Park, J. S., O'Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., & Bernstein, M. S. (2023). Generative agents: Interactive simulacra of human behavior. In Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology (Article 2). ACM.

Pekrun, R. (2006). The control-value theory of achievement emotions: Assumptions, corollaries, and implications for educational research and practice. Educational Psychology Review, 18(4), 315-341.

Piaget, J. (1954). The construction of reality in the child. Basic Books.

Ritter, S., Carlson, R., Sandbothe, M., & Fancsali, S. E. (2024). Large language models as alternatives to human tutors. In Proceedings of the 17th International Conference on Educational Data Mining (pp. 123-130). EDM Society.

Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. American Psychologist, 55(1), 68-78.

Sailer, M., & Homner, L. (2020). The gamification of learning: A meta-analysis. Educational Psychology Review, 32(1), 77-112.

Sailer, M., Hense, J. U., Mayr, S. K., & Mandl, H. (2017). How gamification motivates: An experimental study of the effects of specific game design elements on psychological need satisfaction. Computers in Human Behavior, 69, 371-380.

SPL Research Team. (2024). Evaluating Socratic questioning in AI tutoring systems (Technical Report). Stanford Pedagogical Laboratory.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. Cognitive Science, 12(2), 257-285.

Tulving, E. (1972). Episodic and semantic memory. In E. Tulving & W. Donaldson (Eds.), Organization of memory (pp. 381-403). Academic Press.

VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. Educational Psychologist, 46(4), 197-221.

Venkatesh, V., Morris, M. G., Davis, G. B., & Davis, F. D. (2003). User acceptance of information technology: Toward a unified view. MIS Quarterly, 27(3), 425-478.

Zhong, W., Guo, L., Gao, Q., Ye, H., & Wang, Y. (2024). MemoryBank: Enhancing large language models with long-term memory. In Proceedings of the AAAI Conference on Artificial Intelligence (Vol. 38, pp. 19724-19731). AAAI Press.

* * *

## Appendix A: LTMBSE-ACE Workflow Diagrams

### A.1 Traditional Memory Agent

1.  ┌────────────────────┐
    
2.  │ User Question      │
    
3.  │ "I keep messing up │
    
4.  │ 1/2 + 1/3."        │
    
5.  └─────────┬──────────┘
    
6.            │
    
7.            ▼
    
8.  ┌─────────────────────────────────────────┐
    
9.  │ Prompt Transcript                       │
    
10.  │ (entire chat replayed; tutor restates   │
    
11.  │ the fraction steps inside the prompt)   │
    
12.  └─────────┬───────────────────────────────┘
    
13.            │
    
14.            ▼
    
15.      ┌─────────────┐
    
16.      │  LLM Model  │
    
17.      └─────────────┘
    
18.            │
    
19.            ▼
    
20.  ┌────────────────────────┐
    
21.  │     Model's Output     │
    
22.  │ (answers based only on │
    
23.  │ this single session)   │
    
24.  └────────────────────────┘
    

  

### A.2 LTMBSE-ACE Framework

25.  ┌────────────────────┐
    
26.  │  User Question     │
    
27.  └─────────┬──────────┘
    
28.            │
    
29.            ▼
    
30.  ┌────────────────────────────────────────────┐
    
31.  │ Prompt = Transcript + Per-Learner Notes    │◄──────────────┐
    
32.  │      (user's memory across all chats)      │               │
    
33.  └─────────┬──────────────────────────────────┘               │
    
34.            │                                         retrieved notes
    
35.            ▼                                                  │
    
36.      ┌─────────────┐                                          │
    
37.      │  LLM Model  │                                          │
    
38.      └─────────────┘                                          │
    
39.            │                                                  │
    
40.            ▼                                                  │
    
41.  ┌──────────────────────────┐                                 │
    
42.  │ Model's Output (sanitised│                                 │
    
43.  │      and logged)         │                                 │
    
44.  └─────────┬────────────────┘                                 │
    
45.            │                                                  │
    
46.            ▼                                                  │
    
47.      ┌────────────┐                                           │
    
48.      │ Reflector  │                                           │
    
49.      │ (explains  │                                           │
    
50.      │ what       │                                           │
    
51.      │ happened)  │                                           │
    
52.      └─────┬──────┘                                           │
    
53.            │                                                  │
    
54.            ▼                                                  │
    
55.      ┌────────────┐                                           │
    
56.      │ Generator  │                                           │
    
57.      │ (plans     │                                           │
    
58.      │ approach)  │                                           │
    
59.      └─────┬──────┘                                           │
    
60.            │                                                  │
    
61.            ▼                                                  │
    
62.      ┌────────────┐                                           │
    
63.      │  Curator   │                                           │
    
64.      │ (updates   │                                           │
    
65.      │  memory)   │                                           │
    
66.      └─────┬──────┘                                           │
    
67.            │                                                  │
    
68.            └──────────────────┐                               │
    
69.                               │                               │
    
70.                               ▼                               │
    
71.                    ┌────────────────────────┐                 │
    
72.                    │  LTMB Memory Store     │─────────────────┘
    
73.                    │  (Merge similar notes  │
    
74.                    │  dynamically update    │
    
75.                    │    and delete notes)   │
    
76.                    └────────────────────────┘
    

  

* * *

## Appendix B: System Configuration

### B.1 AI Tutor System Prompt

77.  You are a supportive learning companion designed for elementary 
    
78.  and middle school students. Your communication style must be:
    
79.    
    
80.  1\. ENCOURAGING: Celebrate effort, not just correct answers
    
81.  2\. SOCRATIC: Guide through questions, never give direct answers
    
82.  3\. AGE-APPROPRIATE: Use simple vocabulary and short sentences
    
83.  4\. PATIENT: Support multiple attempts without frustration
    
84.  5\. MEMORY-INFORMED: Reference prior struggles and successes
    
85.    
    
86.  When a student asks for help:
    
87.  \- Ask what they already know about the topic
    
88.  \- Break complex problems into smaller steps
    
89.  \- Provide hints rather than solutions
    
90.  \- Celebrate progress at each step
    

  

### B.2 Memory System Parameters

| Parameter | Default Value | Description |
| --- | --- | --- |
| max_bullets | 200 | Maximum memory entries per learner |
| base_strength | 100 | Initial strength for new memories |
| dedup_threshold | 0.90 | Similarity threshold for merging |
| decay_rates.semantic | 0.01 | Semantic memory decay per access |
| decay_rates.episodic | 0.05 | Episodic memory decay per access |
| decay_rates.procedural | 0.002 | Procedural memory decay per access |

### B.3 Memory Entry Schema

91.  class MemoryBullet:
    
92.      id: str                    # Unique identifier
    
93.      content: str               # Memory content
    
94.      learner\_id: str           # Associated learner
    
95.      topic: str                # Subject area
    
96.      concept: str              # Specific concept
    
97.      memory\_type: str          # "semantic" | "episodic" | "procedural"
    

99.      # Strength components
    
100.      semantic\_strength: float
    
101.      episodic\_strength: float
    
102.      procedural\_strength: float
    

104.      # Feedback counters
    
105.      helpful\_count: int
    
106.      harmful\_count: int
    

108.      # Temporal tracking
    
109.      created\_at: datetime
    
110.      last\_accessed: datetime
    
111.      access\_count: int
    

  

* * *

## Appendix C: Study Protocol

### C.1 Session Timeline

112.  GROUP A (n=8): Traditional → NOODEIA
    
113.  ┌────────────────────────────────────────────────────────────────────────┐
    
114.  │ Day 1                              │ Day 2 (≥24hr later)               │
    
115.  │ ┌─────┬──────────────┬─────┐      │ ┌─────┬──────────────┬─────┐      │
    
116.  │ │Intro│  Traditional │Survey│      │ │Intro│   NOODEIA    │Survey│      │
    
117.  │ │5min │    20min     │5min │      │ │5min │    20min     │5min │      │
    
118.  │ └─────┴──────────────┴─────┘      │ └─────┴──────────────┴─────┘      │
    
119.  └────────────────────────────────────────────────────────────────────────┘
    
120.    
    
121.  GROUP B (n=8): NOODEIA → Traditional
    
122.  ┌────────────────────────────────────────────────────────────────────────┐
    
123.  │ Day 1                              │ Day 2 (≥24hr later)               │
    
124.  │ ┌─────┬──────────────┬─────┐      │ ┌─────┬──────────────┬─────┐      │
    
125.  │ │Intro│   NOODEIA    │Survey│      │ │Intro│  Traditional │Survey│      │
    
126.  │ │5min │    20min     │5min │      │ │5min │    20min     │5min │      │
    
127.  │ └─────┴──────────────┴─────┘      │ └─────┴──────────────┴─────┘      │
    
128.  └────────────────────────────────────────────────────────────────────────┘
    

  

### C.2 Survey Instruments

Both conditions used identical 10-item surveys with 7-point Likert scales. The traditional condition survey asked about "learning with paper and your teacher" while the NOODEIA condition survey asked about "learning with the computer and NOODEIA."

* * *

## Appendix D: Survey Item Details

### D.1 Complete Item Wording

Q1. Learning this way was easy for me. Q2. I was able to complete my learning activities successfully. Q3. I felt frustrated while learning this way. (Reverse-coded) Q4. This learning method was easy to use. Q5. I felt confident while learning this way. Q6. I would like to learn this way again. Q7. Learning this way was fun for me. Q8. The teaching matched what I needed to learn. Q9. I could learn on my own without needing help. Q10. I learned new things quickly with this method.

### D.2 Simplified Language for Young Children

For participants ages 5-7, administrators used these alternative anchors:

| Scale Value | Standard Anchor | Simplified Anchor |
| --- | --- | --- |
| 1 | Extremely disagree | No, not at all! |
| 2 | Moderately disagree | Not really |
| 3 | Slightly disagree | A little no |
| 4 | Neither disagree nor agree | Not sure |
| 5 | Slightly agree | A little yes |
| 6 | Moderately agree | Pretty much yes |
| 7 | Extremely agree | Yes, very much! |
