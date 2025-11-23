# Proxona: Supporting Creators' Sensemaking and Ideation with LLM-Powered Audience Personas

**Authors:** Yoonseo Choi, Eun Jeong Kang, Seulgi Choi, Min Kyung Lee, Juho Kim

**Institution:** KAIST School of Computing, Cornell University, University of Texas at Austin

**Conference:** CHI '25, Yokohama, Japan

---

## Abstract

A content creator's success depends on understanding their audience, but existing tools fail to provide in-depth insights and actionable feedback necessary for effectively targeting their audience. We present Proxona, an LLM-powered system that transforms static audience comments into interactive, multi-dimensional personas, allowing creators to engage with them to gain insights, gather simulated feedback, and refine content. Proxona distills audience traits from comments into dimensions (categories) and values (attributes), then clusters them into interactive personas representing audience segments. Technical evaluations show that Proxona generates diverse dimensions and values, enabling the creation of personas that sufficiently reflect the audience and support data-grounded conversation. User evaluation with 11 creators confirmed that Proxona helped creators discover hidden audiences, gain persona-informed insights on early-stage content, and allowed them to confidently employ strategies when iteratively creating storylines. Proxona introduces a novel creator-audience interaction framework and fosters a persona-driven, co-creative process.

**Keywords:** Large Language Models, Human-AI Interaction, Persona, Agent Simulation, Sensemaking, Ideation, Creative Iterations

---

## 1. Introduction

With the rise of the creator economy, competition for audience attention on digital platforms has grown. As viewer engagement directly influences creators' popularity, revenue, and content strategy, creators must capture and retain the audience's interest. Platform data analytics tools like YouTube Studio offer an overview of audience behaviors, such as view counts, watch time, and demographic data to support content decisions.

However, these tools focus on quantitative data, which often do not capture the deeper, contextual aspects of viewer behavior, such as motivations or preferences. Creators are left with valuable yet abstract data, which requires significant effort to interpret and act upon. In contrast, comments provide direct, qualitative insights into viewers' sentiments and reactions. Yet, the sheer volume of comments can make it difficult for creators to extract insights that aid ideations considering their specific audiences.

### Formative Study Findings

Our formative study (N = 13) confirmed that creators face challenges in:
- Understanding the motivations behind audience behavior (e.g., why viewers engaged with or disengaged from their content)
- Seeking more direct audience feedback beyond basic reactions such as likes or comments
- Feeling uncertain about how to adapt their content to meet audience expectations better

These challenges are particularly pronounced during the early stages of content creation, when creators explore ideas and make initial decisions about how to target and engage their audiences.

### Solution: Audience Personas

To address these challenges, we introduce the concept of **audience personas**, built on the concept of personas from user-centered design. Audience personas synthesize large-scale and unstructured audience data—comments—into compact and actionable representations of distinct audience segments. Instead of requiring manual analysis of a large number of comments or relying on general metrics, these personas provide a structured way to discover audience insights.

### Proxona System

We instantiate the concept of audience personas in our system, **Proxona**, which generates interactive audience personas grounded on real audience data, bridging the gap between abstract analytics and relatable audience insights. With Proxona, creators can chat with audience personas to better understand their audiences' characteristics and receive targeted support for content creation.

#### Dimension-Value Framework

To create consistent and interpretable personas, we propose a framework that organizes audience data into:
- **Dimensions**: Broad characteristic categories (e.g., hobbies, expertise levels)
- **Values**: Specific attributes within each dimension (e.g., 'novice' or 'expert' for expertise levels)

This structured organization uncovers patterns in audience traits that might otherwise be overlooked, enabling systematic analysis and clustering of audience comments into distinct, meaningful audience segments.

### Key Findings

**Technical Evaluations:**
- Proxona produced multi-dimensional personas that provided unexpected and diverse perspectives of audiences compared to baseline personas
- Persona-generated responses had a low likelihood of hallucinations (below 5%)
- System demonstrates reliability in providing grounded, evidence-based insights

**User Evaluation (N=11 YouTube creators):**
- Proxona helped creators explore diverse and in-depth audience characteristics
- Gained confidence in tailoring content ideas to plausible audience preferences
- Identified audience segments they might have previously overlooked
- Gathered potential audience opinions and refined content logic through iterative feedback
- Made informed decisions throughout their creative process

### Contributions

1. **Insights from formative study** highlighting design opportunities to help creators better understand and target their audience

2. **Proxona system**: An LLM-powered system that supports creators in exploring plausible audience traits and patterns by interacting with data-driven personas and making informed decisions in content creation

3. **Technical pipeline** that effectively generates relevant, distinct, and audience-centric personas with our persona construction framework (dimensions & values)

4. **Empirical findings** from user study showing how Proxona enhanced creators' sensemaking of their audience and helped them make audience-driven decisions in their creative practices

---

## 2. Background and Related Work

### 2.1 Involving Audience to Catalyze Creator's Creativity

Creativity emerges and operates in society through complex processes. Platforms like YouTube redefine 'creativity' by connecting creators with their audience, offering more opportunities for self-expression. This highlights the complex interplay between creators and their audiences, requiring creators to put extra effort into comprehending their audience when creating content.

The HCI community has introduced several creative support tools to aid content creators, from gathering feedback to refining their work. However, these tools are most beneficial for experienced creators open to experimenting to connect with their target audience effectively. Given that creators produce diverse content for varying audiences, it is essential for them to develop the skills to filter feedback from a wide range of reactions.

**Proxona's Contribution:** We designed Proxona to help creators process and interpret audience feedback more effectively through LLM-driven personas, offering clearer insights into audience preferences.

### 2.2 Creating and Testing with Personas

Creating and testing with an 'imagined user' is often practiced by product managers and UX designers. The 'imagined user', or 'persona' integrates users' actual characteristics with the designers' ideal product goals. To understand users' actual characteristics, designers conduct user research meticulously through surveys or focus group interviews.

**Data-Driven Approaches:**
Recent work suggests data-driven methods to generate personas, which utilize users' behavioral data via algorithms. These methods create personas close to presented users efficiently based on data. Recent advances in LLMs have introduced new methods for persona generation, enabling more profound analysis of qualitative data.

**Proxona's Approach:** We leverage this potential by combining LLM-driven qualitative analysis with quantitative methods—blending the scalability of algorithmic approaches with the depth of qualitative data.

### 2.3 Simulating Agents with LLMs

Recent studies suggest that LLMs can simulate aspects of human behavior, offering potential utility in situations where engaging human resources might be costly or inaccessible. LLMs can be used to comprehend human perspectives and cognition as an agent, for example, in user interviews and feedback sessions.

**Key Considerations:**
- Incorporating personality traits into agents boosts engagement by reflecting specific character viewpoints
- Without grounded contextual background, agents risk miscommunication and misleading users
- Potential biases inherent in foundation models and automated generation process

**Proxona's Differentiation:**
- Grounds persona simulations in real-world comments collected directly from the creator's channel
- Provides contextually relevant and personalized experience
- Uses dimension-value framework to systematically organize audience traits
- Enhances interpretability and usability of persona simulations

---

## 3. Formative Study

### Method

We conducted semi-structured interviews with 13 YouTube creators (N = 13) who have been actively managing their channels for over a year. Participants were recruited through social media and direct cold emails. Each interviewee participated in a 50-minute Zoom session and was compensated with KRW 50,000 (approx. USD 38).

**Focus Areas:**
- Current practices for defining and analyzing target audience during content creation
- Experiences using existing tools (e.g., YouTube Studio)
- Types of feedback and data relied upon
- Additional insights desired to better align content with audience preferences

**Analysis:** Two researchers conducted thematic analysis by reviewing transcripts, identifying key themes, and consolidating them through iterative discussions.

### 3.1 Findings

All interviewees unanimously agreed on the importance of understanding their audience. They predominantly used YouTube Studio and comments to gauge audience engagement and demographics.

#### 3.1.1 Difficulty in Gaining In-depth Audience Insights

Only a few interviewees could go beyond surface-level analysis. For example, I4 (M, car reviews) defined his target audience as 'white-collar males in the U.S., aged between 40-60, nearing retirement, predominantly white' based on heuristic analysis of viewer comments and demographic data.

However, most interviewees found that available tools primarily provide quantitative data that does not fully capture motivations or preferences behind audience behaviors. These tools highlight 'what' the audience is doing but fail to answer 'why' they engage with specific content.

#### 3.1.2 Hard to Expect Meaningful Feedback from Real Audience

While I2 (nail arts) successfully gleaned insights about viewer preferences from reading comments, accessing this level of useful feedback was not universal. Most interviewees felt that comments often focus on surface-level aspects rather than providing deeper insights into viewers' motivations and needs.

Interviewees expressed desire for more focused feedback on individual content pieces or the strength of their channel against others, but recognized the difficulty in obtaining such feedback directly from their audience.

#### 3.1.3 Translating Insights into Actionable Plans Is Challenging

Interviewees attempted to adjust their video elements based on their understanding of the audience, such as:
- Resizing transcript fonts for older viewers (I7)
- Replicating popular video formats (I1)
- Following trends among younger audiences (I3, I11)

However, performance metrics and demographic information lacked the depth needed to guide future content strategies. For instance, I3 wanted to expand his channel's audience to women and people in their 30s but was unsure how to proceed.

### 3.2 Design Goals

#### DG 1: Provide In-depth Insights of Their Audience in Easily Digestible Formats

The system must efficiently process large-scale comment data and deliver insights relevant to individual creators in an easily digestible format (e.g., personas), minimizing the time and effort needed to understand their audience.

#### DG 2: Facilitate Creation through Communication with Simulated Audience

The system must provide responses that are flexible and interactive, allowing creators to ask diverse questions tailored to their creative challenges and audience understanding. This helps creators adapt their content based on the audience's perspective.

#### DG 3: Foster On-demand, Applicable Feedback to Creative Process

The system must provide feedback that is timely, easy to understand, and directly applicable to content creation. This ensures creators receive tailored, actionable suggestions to align their content with their goals efficiently.

---

## 4. Proxona

### 4.1 What is the Audience Persona?

The concept of audience personas in Proxona draws inspiration from 'personas'—fictional yet data-driven representations of different user groups. In Proxona, audience personas serve as **exploratory tools** that highlight plausible audience traits and motivations, rather than attempting to replicate real-world viewers.

**Key Distinctions:**
- Traditional personas: Based on structured, explicit observations from surveys or interviews
- Audience personas: Generated by transforming unstructured, implicit audience comments into digestible and relatable formats

**Why LLMs for Audience Personas:**
- Extract latent characteristics from large volumes of unstructured text data
- Discern subtle patterns that traditional methods might overlook
- Capture detailed traits of different audience segments

#### Dimension-Value Framework

To construct audience personas, we developed a framework that systematically organizes audience data:

- **Dimensions**: Broad characteristic themes (e.g., hobbies, expertise levels)
- **Values**: Specific attributes within dimensions (e.g., 'novice' or 'expert' for expertise levels)

**Example:** For a cooking channel:
- Dimension: 'Culinary Expertise'
- Values: 'Amateur Cook', 'Professional Chef'

**Benefits:**
- Enhances LLM performance by providing structured representations
- Reduces ambiguity and inconsistency in persona generation
- Aligns with sensemaking practices
- Improves transparency and interpretability

### 4.2 Interface

The Proxona interface consists of two parts:

1. **Exploration Page**: For exploring audience personas by interacting with them
2. **Creation Page**: For drafting a storyline and refining it with persona feedback

#### 4.2.1 Configuring Dimension-Value of Own Audience

The creator provides data about their channel (audience comments and video metadata). The system generates a channel-specific dimension-value set that reflects unique characteristics and preferences of the audience.

**Example Dimensions for Monica's Garden Channel:**
- **Expertise Level**: Novice, Master, etc.
- **Motivation**: Aesthetic, Functional, Environmental
- **Gardening Space**: Balcony, Backyard, etc.
- **Learning Style**: Visual, Experiential, etc.

#### 4.2.2 Exploring Audience Personas

The Exploration Page provides multiple Persona Cards generated by Proxona. Each persona card includes:
- Name
- One-line introduction
- Top-5 relevant values
- Detailed information (job, recent experiences, motivations)
- Videos frequently watched by the original comment owners

**Example Personas for Monica:**
- **Diane, the balcony beautifier**: Novice, Aesthetic, Balcony, Visual
- **Julie, the urban eco-gardener**: Casual Hobbyist, Environmental, Urban, Experiential
- **Patricia, the suburban homesteader**: Master, Functional, Backyard

#### 4.2.3 Asking Questions to Personas

The Conversation Space enables natural language chat with audience personas. Creators can ask any questions, such as:
- "Why do you watch my videos?"
- "What videos do you like on my channel?"
- "What's your daily routine?"

**Example Interaction:**
Monica asks: "Instead, would you prefer to see my daily Vlog?"
Patricia responds: "Your Vlog video sounds very interesting! Why don't you show how you prepare meals with homegrown vegetables?"

#### 4.2.4 Customizing Persona with Dimension-Value Configurations

Beyond data-driven personas, creators can:
- Create custom personas by choosing combinations of existing values
- Extend values under specific dimensions through:
  - Manual addition
  - System-generated suggestions

**Example:**
Monica manually enters a value under Motivation dimension and requests recommendations for Expertise Level. The system suggests "Passing Knowledge," allowing Monica to create a new persona: **Sally, a practical urban gardener**.

#### 4.2.5 Creating and Revising Content with Audience Personas

The Creation Page supports:
- Drafting video storylines
- Receiving overall feedback from personas
- Requesting targeted feedback on specific sections with two options:
  - "What are your thoughts on this part?"
  - "How can I revise or improve this section?"

**Example:**
Monica writes a storyline for promoting a Nespresso coffee machine. She requests suggestions from Julie, who advises: "Even though I drink a lot of coffee during my work day, viewers like me might not be interested in the technical abilities of the coffee machine. How about adding your own experiences using it at home?"

### 4.3 Technical Pipeline

#### 4.3.1 Data Collection

The pipeline crawls data from YouTube channels:
- Channel metadata (name, description, categories, subscribers, view counts)
- Video information (ID, title, description, comments)
- Comments for each video (content, writer ID, date created)

**Tools:** yt-dlp library, Django SQLite database

#### 4.3.2 Inferring Audience Characteristics from Comments

**Process:**
1. Generate transcript summary of each video
2. Create audience observation summary from title, transcript summary, and raw comments
3. Extract key dimensions and values from audience observation summaries

**Dimension-Value Definitions:**
- **Dimensions**: Categories that describe the audience's characteristics
- **Values**: Distinct attributes that predict the audience's specific traits or preferences for each dimension

The pipeline uses GPT-4 to generate dimensions and values that are:
- Relevant to the channel audience
- Mutually exclusive and unique to each other

#### 4.3.3 Generating Audience Personas

**Comment Selection:**
- Longest 200 comments across all videos (longer comments contain richer insights)
- Three longest comments from each video not covered by initial sampling

**Characteristic Inference:**
For each selected comment, GPT-4 infers audience characteristics as combinations of values across dimensions. If specific dimensions are challenging to infer, they are classified as 'None' to avoid forcing inferences from insufficient data.

**Clustering Process:**
1. Concatenate comment with inferred dimensions and values
2. Embed combined input using Transformer-based model (all-MiniLM-L6-v2)
3. Apply k-means clustering to organize audience traits
4. Determine optimal k by calculating inertia value

**Rationale for Clustering Approach:**
- Focus on 'audience similarity' rather than just 'semantic similarity'
- Audience similarity refers to similarity in inferred traits
- Semantic similarity alone often clusters based on superficial language patterns

**Persona Profile Generation:**
For each cluster, GPT-4 creates detailed profiles including:
- Name
- Job
- Short biography
- Reasons for watching videos and channel
- Personal experiences

#### 4.3.4 Retaining Context for Persona Conversations and Feedback

**Context Retention Method:**
1. Embed transcript summaries using OpenAI Embedding
2. Store embeddings in FAISS database
3. Use RetrievalQA chain from LangChain for generating responses
4. Apply chain-of-thought method for reasoning

**Benefits:**
- Ensures conversations remain coherent and relevant to actual videos
- Reduces likelihood of hallucinations
- Provides grounded, evidence-based insights

---

## 5. Technical Evaluation

### Research Question

**RQ 1:** Can Proxona effectively generate relevant, distinct, and audience-reflecting personas that provide evidence-based responses?

### 5.1 Evaluating Dimension-Value Generation Pipeline

**Evaluators:** Three YouTube creators with experience understanding their audience by reviewing comments

**Channels:** Six channels (Channel A-F) across diverse topics

**Results:**
- Average 5 dimensions (min=4, max=6)
- Average 17.5 values (min=15, max=24)

**Evaluation Metrics:**

1. **Relevance** (5-point Likert scale):
   - Dimensions: 3.68/5 (SD = 0.35)
   - Values: 3.6/5 (SD = 0.23)

2. **Mutual Exclusiveness** (Binary scale):
   - Dimensions: 6.67% overlap
   - Values: 7.62% overlap

**User Study Validation (N=11):**
- Dimension relevance: M = 4.55/5
- Value relevance: M = 4.45/5
- Dimension helpfulness: M = 4.36/5
- Value helpfulness: M = 4.18/5
- New perspectives (dimensions): M = 3.91/5
- New perspectives (values): M = 4.36/5

**Note on Mutual Exclusiveness:**
- User study showed moderate scores (M_dimension = 3.36, M_value = 3.64)
- Some overlaps reflected real-world similarities in audience behaviors
- Particularly relevant for niche topics

### 5.2 Evaluating Comment Clustering Pipeline

**Comparison:** Proxona (with dimension-value info) vs. Baseline (semantic similarity only)

**Evaluators:** Three YouTube creators

**Method:**
- 5 channels tested
- 10 reference comments per channel
- 4 closest comments to cluster centroid from each method
- Majority voting for evaluation

**Evaluation Criteria:**
- **Linguistic Similarity**: Surface-level language and wording resemblance
- **Audience Similarity**: Alignment in audience traits or behaviors

**Results:**
- Proxona showed higher audience similarity: M = 6.4/10 clusters
- Channel D showed mixed results (5/10), likely because baseline sometimes clustered by keywords that unintentionally reflected audience traits

### 5.3 Evaluating Generated Persona

**Comparison:** Proxona vs. Baseline (pure LLM approach, similar to LLM-Auto condition)

**Evaluators:** 6 YouTube creators

**Channels:** 7 YouTube channels

**Evaluation Types:**

1. **Comparative Survey** (Majority voting):
   - Proxona outperformed Baseline in 7/10 criteria
   - Baseline better for: Realism (Q2), Comprehensiveness (Q9)
   
2. **Standalone Survey** (5-point Likert, Wilcoxon signed-rank tests):

| Criterion | Proxona | Baseline | Significance |
|-----------|---------|----------|--------------|
| Completeness (Q1) | 4.06 | 3.49 | p < .01 |
| Credibility (Q2) | 3.51 | 3.89 | - |
| Clarity (Q3) | 4.09 | 3.83 | - |
| Empathy (Q4) | 3.83 | 3.86 | - |
| Diversity (Q5) | 4.06 | 3.4 | p < .01 |
| Serendipity (Q6) | 3.94 | 3.06 | p < .01 |
| Predictability (Q7, reverse) | 3.17 | 3.77 | p < .01 |
| Multi-dimensionality (Q8) | 3.74 | 3.26 | p < .01 |
| Comprehension (Q9) | 3.43 | 3.4 | - |
| Generalizability (Q10, reverse) | 3.29 | 3.51 | - |

**Key Findings:**
- Proxona personas were more complete, diverse, novel, and multi-dimensional
- Baseline personas seemed more "real" in some aspects
- Proxona offered depth and structure necessary for informed decision-making

### 5.4 Evaluating Hallucinations in Persona Chat Responses

**Definition of Hallucination:**
Responses that inaccurately mention resources or content, particularly when referencing specific video or channel content.

**Evaluators:** Two external evaluators

**Sample:** 203 responses from 5 randomly selected channels

**Classification Criteria:**
1. Referred video title was incorrect
2. Referred video content did not match actual YouTube video content
3. Relevant video could not be found despite being indirectly mentioned

**Results:**
- Hallucination rate: 4.93% (10 out of 203)
- Inter-rater reliability (Cohen's Kappa): 0.804
- Demonstrates low occurrence of hallucinations
- Highlights effectiveness of methods in minimizing inaccuracies

---

## 6. User Evaluation

### Research Questions

- **RQ2:** How effectively can Proxona support creators in exploring audience traits for sensemaking and ideation?
- **RQ3:** With Proxona, how do creators integrate persona-informed insights into their creative practices?

### 6.1 Recruitment

**Criteria:**
1. Maintained active channel for at least one year
2. Run informational video channel with specific topic
3. Use subtitles or audio narration
4. Have received more than 400 comments on videos

**Compensation:** KRW 150,000 (approx. USD 112) for up to two hours

### 6.2 Participants

**N = 11 YouTube creators:**
- Gender: 5 females, 6 males
- Age: 20s-40s
- Content: Electronics, studying abroad, music production, baking, interior design, K-pop, economics, skin care, travel
- Commitment: 4 full-time, 7 part-time
- Channel activity: 1 year to over 6 years

### 6.3 Study Protocol

**Design:** Within-subjects comparison
- Condition 1 (Baseline): Docs - Google Docs + any current methods
- Condition 2: Proxona
- No counterbalancing (to prevent learning effects)

**Task:** 
"Please first explore your audience [as current practices / with our system], then create a video storyline with provided topic, targeting your audience."

**Topics:** Unrelated to channel content to minimize prior knowledge effects
- Consumer products: Nespresso coffee machine, running shoes, vitamin supplements, massage chair
- Digital tools: Nike Run Club app, language learning app, grocery shopping app
- Other: Modern art exhibition

**Procedure:**
1. Pre-interview (10 minutes)
2. Task 1 with Docs (max 30 minutes)
3. Post-task survey 1 (5 minutes)
4. Tutorial for Proxona (15 minutes)
5. Task 2 with Proxona (max 30 minutes)
6. Post-task survey 2 (5 minutes)
7. Semi-structured interview (15 minutes)

**Total Duration:** Approximately 2 hours

### 6.4 Measures and Analyses

**Quantitative Measures:**
1. System usability for audience exploration, sensemaking, and ideation (7-point Likert scale)
2. NASA-TLX for cognitive load
3. Completeness of created content
4. Quality of dimensions and values (under Proxona condition)
5. Quality of persona chat and feedback (under Proxona condition)
6. Human-AI collaboration effectiveness (AI Chains measures)

**Statistical Analysis:** Wilcoxon signed-rank test (non-parametric for paired data)

**Qualitative Analysis:**
- Transcribed audio recordings using Clova Note
- Thematic analysis by two authors
- Structured findings on Miro board

### 6.5 Results: RQ2 - Supporting Exploration for Sensemaking and Ideation

#### Interaction Patterns

**Chat Engagement:**
- Average 6.73 turns during Exploration phase (SD = 2.8, min = 3, max = 11)
- Average 0.91 turns during Creation phase (SD = 1.2, min = 0, max = 4)
- Total average: 7.64 turns (SD = 3.6)

#### Overall Usability

**Significant Improvements with Proxona:**

| Criterion | Docs M (SD) | Proxona M (SD) | p-value |
|-----------|-------------|----------------|---------|
| Q1: Understand viewers sufficiently | 4.73 (1.42) | 6.09 (0.70) | < .05 |
| Q2: Plan based on understanding | 5.00 (1.41) | 6.00 (0.77) | < .05 |
| Q3: Understand content preferences | 5.36 (1.03) | 5.82 (1.47) | - |
| Q4: Plan with sufficient evidence | 4.55 (1.51) | 5.73 (1.35) | < .05 |
| Q5: Make decisions with confidence | 4.55 (1.75) | 5.82 (0.98) | < .05 |
| Q6: Apply viewer perspectives | 5.18 (1.40) | 6.00 (1.26) | - |
| Q7: Satisfaction with planning | 5.18 (1.08) | 6.36 (0.81) | < .05 |
| Q8: Completeness (0-100) | 73.0 (12.21) | 86.82 (10.78) | < .01 |

#### Key Findings

**1. Gaining Deeper Insights into Audience Preferences and Motivations**

Participants reported gaining richer insights compared to traditional methods. The dimension-value framework helped clarify their personas:
- Dimensions perceived as useful (M = 4.36), specific (M = 4.64), and diversely composed (M = 4.73)
- Values perceived as useful (M = 4.18), specific (M = 4.64), and diversely composed (M = 4.73)

**Participant Quote (P6):**
> "It felt like things that were vaguely in my mind got sorted out. You can't gain this kind of deep insight from short comments."

**Participant Quote (P10):**
> "It made me think more clearly about my audience."

**2. Unveiling Diversity within a Seemingly Homogeneous Audience**

Participants found Proxona helped recognize heterogeneity in their audience:
- Previously perceived audience as relatively homogeneous
- Analysis revealed diverse and distinct segments
- Enabled targeting different personas with specific needs

**Example (P4):**
Identified which audience segments were interested in new baking methods vs. traditional topics, allowing her to balance content strategy.

**Survey Results:**
- Higher satisfaction in exploring audience preferences: M_Proxona = 5.45 vs. M_Docs = 4.36 (p < .05)

**Challenges:**
- Some participants (P9, P10) found multiple personas overwhelming
- Difficulty synthesizing feedback from diverse personas
- Exhaustion from attempting to satisfy all audience personas

**3. Discovering Hidden or Unseen Audience Segments**

Proxona enabled discovery of previously unknown audience segments:

**Example (P6 - Electronics):**
Encountered persona 'eco-friendly lifestyle blogger who prefers products that minimize environmental impact'—perspective not previously considered. Decided to emphasize sustainable aspects in future videos.

**Example (P8 - Single-person households):**
Surprised by persona's request to see 'lessons learned from daily mistakes,' which she had previously edited out. Decided to intentionally include more "real" moments in future videos.

**Survey Results:**
- Ability to discover new audience preferences: M_Proxona = 5.45 vs. M_Docs = 4.18 (p < .05)

### 6.6 Results: RQ3 - Integrating Persona-Informed Insights into Creative Practices

#### Time Investment

- Proxona: Participants used full 30-minute limit
- Docs: Average 14.64 minutes (SD = 6.50)

#### Cognitive Load (NASA-TLX)

- Mental demand: Similar between conditions (M_Proxona = 2.73, M_Docs = 3.09, p = .66)
- Performance: Higher with Proxona (M_Proxona = 5.73 vs. M_Docs = 4.91, p < .05)

#### Key Finding: Distinct Advantage of Proxona

Participants noted dynamic and interactive exploration of audience traits, contrasting with static nature of Docs condition.

**Overall Satisfaction:**
- Higher with Proxona: M = 6.36 vs. M_Docs = 5.18 (p < .05)
- Confidence in decisions: M = 5.82 vs. M_Docs = 4.55 (p < .05)
- Better planning based on understanding: M = 6.0 vs. M_Docs = 5.0 (p < .05)
- More complete storylines: M = 86.82 vs. M_Docs = 73.00 (p < .01)
- Sufficient evidence: M = 5.73 vs. M_Docs = 4.55 (p < .05)

#### 6.6.1 Using Persona Conversations to Enhance Creative Decisions

**Chat Quality Ratings:**
- Consistency: M = 6.55 (SD = 0.69)
- Perspective reflection: M = 6.36 (SD = 0.81)
- Naturalness: M = 5.45 (SD = 1.37)
- Reliability: M = 5.27 (SD = 1.35)

**Use Cases:**

**1. Gathering Opinions on Topic Selection**

Participants gauged personas' interests in potential topics:
- "Are you interested in buying an electric massage chair?" (P2)
- "How do you learn English these days?" (P8)

**2. Collaborating to Improve Content for Certain Goals**

Participants involved personas in content development:
- Requesting titles to attract specific audiences
- Asking for revision tips to enhance visibility
- Examples: "What should I create as a video to increase the viewing duration from viewers?" (P9)

**3. Consulting on Overall Channel Strategy**

Participants considered broader channel management elements:
- Video editing style (P7, P9)
- Transition of channel topics (P4, P8)
- Brand identity and information delivery (P10)
- Example: "Considering videos on well-known baking topics get higher views, do you prefer familiar subjects over new ones?" (P4)

**4. Assessing Performance from Audience Perspective**

Some participants explored predictive use cases (beyond intended scope):
- "Will you watch my Vlog?" (P9)
- "How much does a thumbnail influence your decision to click on my video?" (P5)

#### 6.6.2 Ways to Utilize Persona Feedback in Storyline Creation

**Feedback Usage:**
- Total: 28 times across 11 participants
- Average: M = 2.55 (SD = 2.5, min = 0, med = 2, max = 6)
- Variation: Some used extensively (P5: 6 times), others not at all (P8, P9: 0 times)

**Feedback Quality Ratings:**
- Clarity: M = 5.82 (SD = 1.08)
- Perspective reflection: M = 6.36 (SD = 0.50)
- Diversity: M = 5.00 (SD = 1.55)
- Reliability: M = 5.18 (SD = 1.60)
- Applicability: M = 5.82 (SD = 1.94)

**Use Patterns:**

**1. Strengthening Content Logic with Multiple Persona Perspectives**

Participants sought diverse viewpoints to ensure comprehensive audience coverage.

**Example (P11):**
Received evaluative feedback on various aspects of planning a trip to Nha Trang from multiple personas, integrating insights to refine content's logical flow.

**2. Enriching Content through Iterative Persona Feedback**

Participants refined specific content elements through repeated feedback cycles.

**Examples:**
- P5 and P11 repeatedly adjusted and sought evaluation on same content blocks
- P10 concentrated on single persona for both evaluations and suggestions

**3. Confirming Choices through Persona Feedback**

Some participants decided against content ideas based on persona feedback.

**Example (P2):**
Abandoned idea altogether after negative reactions from personas, despite initial attempts to persuade them.

#### 6.6.3 Perceiving Proxona as Human-AI Co-creation Support

**AI Chains Measures (7-point Likert):**
- Highest: Collaboration (Q36): M = 6.18 (SD = 1.17)
- Lowest: Controllability (Q35): M = 5.18 (SD = 1.66)

**Participant Quote (P4):**
> "Through interacting with them (audience personas), the process of targeting and understanding the audience becomes more concrete—it feels like we're collaborating, creating a sense of 'teamwork'."

**Controllability Challenge (P7):**
> "Even when talking to people now, there are those who steer the conversation only towards their area of interest. I found it sometimes disappointing that, regardless of direction, each persona attempted to lead the discussion solely towards the topic they wanted to talk about."

---

## 7. Discussion

### 7.1 Constructing Audience Personas with Dimensions-Values Framework

**Key Advantages:**

1. **Data-Driven Foundation**: Unlike traditional assumption-based approaches, Proxona generates personas directly from real audience data (comments), ensuring authentic insights.

2. **Structured Organization**: The dimension-value framework structures audience traits into distinct categories, helping creators identify nuanced characteristics often missed with traditional analytics.

3. **Enhanced Sensemaking**: By categorizing information into interpretable units, the framework facilitates derivation of targeted and actionable insights.

**Technical Considerations:**

While k-means clustering currently serves as a practical mechanism for grouping audience traits, it may not be strictly necessary for the dimension-value framework functionality. Future iterations could explore:
- LLM-based clustering
- Other dynamic grouping methods
- Methods to reduce system complexity while maintaining effectiveness

**Future Directions:**

1. **Dynamic Adaptation**: Integrate real-time audience data to ensure personas align with shifting preferences and behaviors

2. **Iterative Development**: Allow for more iterative persona development based on evolving audience interactions

### 7.2 Navigating LLM-Generated Personas: Trust, Creativity, and Reliance

#### Positive Aspects: Trust and Utility

**User Trust:**
- Creators valued data-driven personas grounded in real audience data
- Perceived personas as reliable reflections of their audience
- Enhanced confidence in persona feedback and suggestions
- Found insights easier to grasp compared to raw comments or analytics

**Quote (P7):**
> "Seeing my audience represented as personas was incredibly moving. Normally, I just see usernames and their comments, but with personas, I felt like I could finally picture who my viewers were."

#### Risks and Challenges

**1. Confirmation Bias**
- Risk of creators leaning too heavily on persona feedback that reinforces preconceptions
- LLMs often provide overly agreeable or positive responses

**2. Bias in Persona Generation**
- Inherent social value alignment and moderation mechanisms introduce potential bias
- Under-represents critical, controversial, or dissenting opinions
- May filter out obscure or sensitive attributes during LLM processing

**3. Misuse Potential**
- Some participants occasionally distorted use (e.g., asking about actual view counts)
- Continued misuse may lead to incorrect beliefs about real people

#### Balanced Creator Agency

**Positive Finding:**
Participants maintained critical awareness and agency:
- Recognized personas as exploratory tools, not definitive authorities
- Used persona-driven feedback to leverage ideas rather than fully relying on it
- Actively evaluated relevance and applicability to content strategies
- Final content decisions ultimately rested with creators

**Quote from Creator:**
Participants approached Proxona as a sensemaking tool, leveraging its potential while maintaining control over final decisions.

#### Recommendations for Mitigating Over-Reliance

**1. Enhance Transparency**
- Provide transparent explanations about persona construction process
- Include markers indicating AI-generated responses
- Add metadata showing:
  - Source of audience insights (e.g., source comments)
  - Degree of confidence in predictions
  - Limitations of the system

**2. Promote Balanced Reliance**
- Clarify the exploratory nature of personas
- Emphasize that personas guide exploration rather than predict behavior
- Maintain appropriate mental model of system capabilities

**3. Preserve Creator Agency**
- Ensure creators understand they are the ultimate decision-makers
- Support critical evaluation of AI-generated insights
- Provide tools for creators to validate insights against other data sources

### 7.3 Desirable and Undesirable Use Cases of Proxona

#### Desirable Use Cases

**1. Exploring Potential Audience**
- Uncover audience traits and preferences
- Gain insights into diverse audience segments previously overlooked
- Example: "Would viewers prefer a video focused solely on baking techniques or one that includes stories about the origins of bread?" (P4)

**2. Generating Creative Ideas**
- Develop ideas informed by audience perspectives
- Example: "How can I integrate this ad seamlessly into our music content?" (P3)
- Inspire creative approaches to challenges

**3. Iteratively Refining Content**
- Obtain simulated feedback from audience personas
- Make informed adjustments to content
- Example: "@Kendall, how can I efficiently include the necessary information in my vlog?" (P9)

#### Undesirable Use Cases

**1. Predicting Audience Behavior**
- Proxona NOT designed for predictive use cases
- Example of inappropriate use: "How many people will click on this video?"
- System cannot provide guarantees about measurable results (viewership, engagement metrics)

**2. Seeking Guaranteed Content Outcomes**
- Example of inappropriate use: "Would it be okay to add this ad to increase view count?"
- Proxona offers inspiration and qualitative feedback, not assurances about results

#### Future Improvements

**1. Structured Interactions**
- Template-based questions to guide appropriate use
- Prevent users from asking inappropriate questions

**2. Integrated Predictive Analytics**
- Combine exploratory sensemaking with data-driven predictive analytics
- Meet needs of creators seeking more insights for critical decisions
- Maintain core strengths in exploratory ideation and sensemaking

### 7.4 Generalizing Proxona: Applications in Diverse Creative Practices

#### Beyond Comments

**Integration Opportunities:**
- Behavioral data: view duration, timestamps, watch patterns
- Social media platforms: X, Instagram discussions
- Forums: Reddit conversations about creator's content
- Combined approach enriches personas by capturing wider range of audience opinions

#### Beyond Transcripts and Videos

**Text-Based Content:**
- Applicable to blogs, podcasts, articles
- Anywhere audience engagement occurs through comments/discussions

**Multimodal Potential:**
- Incorporate visual and auditory modalities
- Analyze visual aesthetics, audio quality, editing styles
- Support decision-making across entire video production process

**Live-Streaming Applications:**
- Adapt for real-time audience interaction
- Provide synchronous feedback during live broadcasts
- Generate insights from live chat interactions

#### Beyond Experienced Creators

**For Novice Creators:**
- Generate personas from aspirational channels
- Explore characteristics of desired target audience
- Simulate audience comments based on similar channels
- Address cold start problem for channels with limited comments

**Benefits:**
- Help newer creators understand potential audiences
- Refine content strategies as they grow
- Provide persona-driven insights even without existing audience base

#### Beyond Audience Personas

**Framework Adaptability:**
The dimension-value framework can extend to various contexts requiring synthesis of qualitative data:

**Examples:**
- **Education**: Student personas from class forums
- **Business**: Consumer personas from product reviews
- **Research**: Participant personas from interview transcripts

**Benefits:**
- Structured approach to organizing unstructured data
- Generates meaningful, context-specific insights
- Flexible application across diverse domains

### 7.5 Limitations & Future Work

#### Data Source Limitations

**Comment-Based Bias:**
- Relies solely on audience comments
- Represents only subset of audience behaviors/opinions
- Excludes non-commenting viewers with potentially different preferences

**Comment Filtering Issues:**
- Filtering based on length might omit valuable insights from shorter comments
- May skew personas toward more verbose commenters

**Future Research Directions:**
1. Integrate additional data sources:
   - Passive audience behaviors (view duration, likes, shares)
   - External audience surveys
   - Behavioral analytics
2. Explore comprehensive comment filtering techniques:
   - Judge helpfulness or constructiveness
   - Consider diverse comment types

#### Language Performance

**Current Limitation:**
- LLMs often perform better in English than other languages
- May impact quality of Korean persona generation
- Could affect nuanced or idiomatic expressions

**Future Work:**
- Enhance multilingual support
- Fine-tune models on language-specific data
- Leverage multilingual datasets for better performance

#### Persona-Population Mapping

**Important Clarification:**
- Data-driven personas cannot be mapped to real-world audience populations
- Goal: Enable exploration of prototypical audiences to inform content creation
- Not intended to mirror audience perfectly

**Addressing Limitation:**
- Adjust mental model of system capabilities
- Clarify role of personas as exploratory tools
- Set appropriate user expectations

#### Cold Start Problem

**Current Limitation:**
- Creators with few or no comments cannot benefit from Proxona
- Limits applicability across wide range of creators

**Future Solutions:**
1. Utilize data from similar channels with similar content/demographics
2. Simulate personas for early-stage creators
3. Develop strategies to support creators without existing comment base

---

## 8. Conclusion

We introduce **Proxona**, a novel system that employs LLMs to generate data-driven audience personas, enhancing creators' exploration and sensemaking into their audience and supporting the development of more informed, audience-centered content strategies.

### Key Contributions

**Technical Innovation:**
- Novel dimension-value framework for organizing audience data
- Systematic clustering approach for generating distinct personas
- Low hallucination rate (<5%) in persona responses
- High-quality, multi-dimensional personas that provide diverse perspectives

**User Impact:**
Through evaluation with YouTube creators, Proxona demonstrated ability to:
- Bridge gap between creators and their audiences
- Enable discovery of hidden audience segments
- Provide deeper insights into audience motivations and preferences
- Support iterative content refinement with persona feedback
- Foster collaborative approach to content creation
- Increase creator confidence in audience-driven decisions

**Novel Framework:**
Proxona introduces a novel creator-audience interaction framework that promotes:
- Persona-driven co-creative process
- Dynamic exchange of ideas and feedback
- Exploratory audience engagement
- More effective audience envisioning during content ideation

**Future Vision:**
As the creator economy continues to grow, tools like Proxona that help creators deeply understand and engage with their audiences will become increasingly valuable. By transforming static audience data into interactive, multi-dimensional personas, Proxona represents a significant step forward in supporting creator success through audience-centered content strategies.

---

## Acknowledgments

This work was supported by:
- National Research Foundation of Korea (NRF) grant funded by Korea government (MSIT) (No. RS-2024-00406715)
- Institute of Information & communications Technology Planning & Evaluation (IITP) grant funded by Korea government (MSIT) (No. RS-2024-00443251)
- Office of Naval Research (ONR: N00014-24-1-2290)
- National Science Foundation (USA) (DGE-2125858)
- Good Systems, a UT Austin Grand Challenge for developing responsible AI technologies

Special thanks to:
- Members of KIXLAB (KAIST Interaction Lab) and CSTL (Collaborative Social Technologies Lab) at KAIST
- All interviewees and study participants
- Research friends for friendship, inspiration, and constant encouragement

---

## References

[Note: Full reference list available in original paper - contains 71 references covering topics in HCI, LLMs, persona design, content creation, and related fields]

---

This markdown conversion preserves the structure, content, and key findings from the original PDF while making it easily readable and suitable for reference in academic writing.