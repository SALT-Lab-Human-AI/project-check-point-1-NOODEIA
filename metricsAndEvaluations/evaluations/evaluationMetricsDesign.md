# Noodeia AI Tutor: User Experience Survey Guide

## Table of Contents
- [Background: NASA-TLX](#background-nasa-tlx)
- [Background: System Usability Scale (SUS)](#background-system-usability-scale-sus)
- [Proposed Short Survey for Noodeia](#proposed-short-survey-for-noodeia)
  - [Short NASA-TLX (5 Items)](#short-nasa-tlx-5-items)
  - [Short SUS (5 Items)](#short-sus-5-items)
- [Scoring Instructions](#scoring-instructions)
- [Interpreting Results](#interpreting-results)

---

## Background: NASA-TLX

The **NASA Task Load Index (TLX)** by Hart and Staveland assesses workload across six dimensions. Each dimension is rated on a scale with 21 tick marks, mapped to values from 0 to 100.

### Original Six Dimensions

| Dimension | Question | Scale |
|-----------|----------|-------|
| **Mental Demand** | How mentally demanding was the task? | 21-point scale: Very Low → Very High |
| **Physical Demand** | How physically demanding was the task? | 21-point scale: Very Low → Very High |
| **Temporal Demand** | How hurried or rushed was the pace of the task? | 21-point scale: Very Low → Very High |
| **Performance** | How successful were you in accomplishing what you were asked to do? | 21-point scale: Perfect → Failure |
| **Effort** | How hard did you have to work to accomplish your level of performance? | 21-point scale: Very Low → Very High |
| **Frustration** | How insecure, discouraged, irritated, stressed, and annoyed were you? | 21-point scale: Very Low → Very High |

### Standard NASA-TLX Scoring

The **Raw TLX Score** is calculated as the mean of all six ratings:

```
Raw TLX = (R_MD + R_PD + R_TD + R_PE + R_EF + R_FR) / 6
```

Where:
- R_MD = Mental Demand rating (0-100)
- R_PD = Physical Demand rating (0-100)
- R_TD = Temporal Demand rating (0-100)
- R_PE = Performance rating (0-100, higher = worse)
- R_EF = Effort rating (0-100)
- R_FR = Frustration rating (0-100)

**Result:** A workload score from 0 to 100 (higher = higher workload)

---

## Background: System Usability Scale (SUS)

The **System Usability Scale (SUS)** by John Brooke is a 10-item questionnaire that provides a quick, reliable measure of perceived usability.

### Original 10 Items

Respondents rate each statement on a 5-point scale:
- **1** = Strongly disagree
- **2** = Disagree
- **3** = Neither agree nor disagree
- **4** = Agree
- **5** = Strongly agree

| # | Statement | Type |
|---|-----------|------|
| 1 | I think that I would like to use this system frequently. | Positive |
| 2 | I found the system unnecessarily complex. | Negative |
| 3 | I thought the system was easy to use. | Positive |
| 4 | I think that I would need the support of a technical person to be able to use this system. | Negative |
| 5 | I found the various functions in this system were well integrated. | Positive |
| 6 | I thought there was too much inconsistency in this system. | Negative |
| 7 | I would imagine that most people would learn to use this system very quickly. | Positive |
| 8 | I found the system very cumbersome to use. | Negative |
| 9 | I felt very confident using the system. | Positive |
| 10 | I needed to learn a lot of things before I could get going with this system. | Negative |

### Standard SUS Scoring

The SUS score is calculated using this formula:

```
SUS = 2.5 × (Sum of positive items - 5) + (25 - Sum of negative items))
```

Or more explicitly:

```
SUS = 2.5 × ((SUS01-1) + (SUS03-1) + (SUS05-1) + (SUS07-1) + (SUS09-1) 
            + (5-SUS02) + (5-SUS04) + (5-SUS06) + (5-SUS08) + (5-SUS10))
```

**Result:** A usability score from 0 to 100 (higher = better usability)

---

## Evaluation Instrument Design for NOODEIA Comparative Study

### 1. Research Context and Objectives

This evaluation study examines the comparative efficacy of two distinct pedagogical interventions for elementary students (ages 5-12) performing below grade-level expectations: (1) traditional one-to-many classroom instruction with paper-based materials, and (2) NOODEIA, an AI-powered personalized tutoring system incorporating gamification elements. The central research question investigates which intervention demonstrates superior outcomes across multiple dimensions: student engagement, learning preparedness, rate of academic remediation, accuracy of knowledge acquisition, and affective learning experience.

### 2. Theoretical Framework

The evaluation instrument integrates validated psychometric scales with custom items designed to capture intervention-specific attributes. We draw upon two established frameworks:

1. **NASA Task Load Index (TLX)** (Hart & Staveland, 1988): Assesses cognitive workload across six dimensions, providing insight into the mental demands imposed by each learning modality.

2. **System Usability Scale (SUS)** (Brooke, 1996): Measures perceived usability and user acceptance, adapted here to assess the accessibility and learnability of each pedagogical approach.

These frameworks are supplemented with custom items targeting unique affordances of the NOODEIA system, including adaptive personalization, autonomous learning support, and intrinsic motivation through gamification.

### 3. Instrument Development

#### 3.1 Scale Selection and Adaptation

Given the developmental characteristics of the target population (ages 5-12), we reduced the original NASA-TLX (6 items) and SUS (10 items) to three items each, selecting dimensions most relevant to elementary learners and eliminating constructs inappropriate for the comparison (e.g., physical demand, technical complexity). This reduction minimizes cognitive burden while preserving construct validity.

#### 3.2 Response Format

A 7-point Likert scale was selected to provide sufficient granularity for detecting meaningful differences between conditions while remaining comprehensible for young respondents. The scale employs both numerical anchors and emoji-based visual cues to accommodate varying literacy levels within the target age range.

**Scale Anchors:**
- 1 = Extremely disagree
- 2 = Moderately disagree
- 3 = Slightly disagree
- 4 = Neither disagree nor agree
- 5 = Slightly agree
- 6 = Moderately agree
- 7 = Extremely agree

---

## Survey 1: Baseline Condition (Traditional Teaching Method)

**Context**: Traditional classroom instruction with paper-based worksheets and teacher-led group instruction.

**Instructions for Administrator**: "We want to know about your experience learning with paper and your teacher. For each statement, tell me how much you agree or disagree. There are no right or wrong answers—we just want to know what you think."

---

**Q1.** Learning this way was easy for me.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q2.** I was able to complete my learning activities successfully.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q3.** I felt frustrated while learning this way.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q4.** This learning method was easy to use.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q5.** I felt confident while learning this way.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q6.** I would like to learn this way again.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q7.** Learning this way was fun for me.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q8.** The teaching matched what I needed to learn.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q9.** I could learn on my own without needing help.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q10.** I learned new things quickly with this method.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

---

## Survey 2: Experimental Condition (NOODEIA System)

**Context**: AI-powered personalized tutoring system with gamification elements delivered via computer interface.

**Instructions for Administrator**: "We want to know about your experience learning with the computer and NOODEIA. For each statement, tell me how much you agree or disagree. There are no right or wrong answers—we just want to know what you think."

---

**Q1.** Learning this way was easy for me.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q2.** I was able to complete my learning activities successfully.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q3.** I felt frustrated while learning this way.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q4.** This learning method was easy to use.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q5.** I felt confident while learning this way.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q6.** I would like to learn this way again.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q7.** Learning this way was fun for me.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q8.** The teaching matched what I needed to learn.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q9.** I could learn on my own without needing help.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

**Q10.** I learned new things quickly with this method.

> 1 ○ ── 2 ○ ── 3 ○ ── 4 ○ ── 5 ○ ── 6 ○ ── 7 ○
>
> Extremely Disagree ──────────────────────────── Extremely Agree

---

## Instrument Design Rationale

### 4. Question Selection Methodology

The final 10-item instrument was developed through a systematic process of item selection, adaptation, and validation. Each question was evaluated against four criteria: (1) developmental appropriateness for ages 5-12, (2) relevance to the research question, (3) discriminant validity between conditions, and (4) clarity for young respondents.

#### 4.1 NASA-TLX Dimension Selection (3 of 6 Retained)

**Q1: Mental Demand** (Retained)
- **Theoretical Justification**: Cognitive load theory posits that excessive mental demand impedes learning (Sweller, 1988). For struggling students, an intervention that reduces cognitive burden while maintaining educational rigor may facilitate superior learning outcomes.
- **Operational Definition**: Perceived ease or difficulty of the learning method.
- **Expected Hypothesis**: NOODEIA's adaptive scaffolding and personalized pacing will yield lower perceived mental demand compared to one-size-fits-all traditional instruction.

**Q2: Performance** (Retained)
- **Theoretical Justification**: Self-efficacy theory emphasizes that perceived success enhances motivation and persistence (Bandura, 1977). Students' subjective assessment of task completion provides insight into whether the intervention supports goal attainment.
- **Operational Definition**: Student's perception of successfully completing learning objectives.
- **Expected Hypothesis**: NOODEIA's immediate feedback and adaptive difficulty will increase perceived performance relative to traditional methods.

**Q3: Frustration** (Retained)
- **Theoretical Justification**: Affective experiences during learning significantly influence engagement and persistence (Pekrun, 2006). Frustration is a critical indicator of intervention acceptability, particularly for students with prior academic struggles.
- **Operational Definition**: Negative emotional states including stress, discouragement, and irritation.
- **Expected Hypothesis**: NOODEIA's supportive AI tutor and judgment-free environment will reduce frustration compared to traditional classroom settings.

**Excluded Dimensions and Justification**:
- **Physical Demand**: Both interventions involve minimal physical activity (writing/typing), rendering this dimension non-discriminative.
- **Temporal Demand**: While theoretically relevant, pilot testing indicated young children struggled to differentiate temporal pressure from general difficulty. This construct is partially captured by Q9 (independence).
- **Effort**: Conceptually overlaps substantially with mental demand (Q1) for this population. Eliminating effort reduces redundancy without sacrificing construct coverage.

#### 4.2 System Usability Scale Item Selection (3 of 10 Retained)

**Q4: Ease of Use** (SUS Item 3, Retained)
- **Theoretical Justification**: The Technology Acceptance Model (Davis, 1989) identifies perceived ease of use as a primary determinant of system adoption. For educational technology targeting struggling learners, intuitive interfaces are essential.
- **Operational Definition**: Perceived simplicity and accessibility of the learning method.
- **Expected Hypothesis**: Despite NOODEIA's technological complexity, its child-centered design will be perceived as equally or more accessible than traditional paper methods.

**Q5: Confidence** (SUS Item 9, Retained)
- **Theoretical Justification**: Computer self-efficacy research demonstrates that confidence in technology use predicts learning outcomes (Compeau & Higgins, 1995). For struggling students, building confidence is paramount.
- **Operational Definition**: Student's self-assurance while engaging with the learning method.
- **Expected Hypothesis**: NOODEIA's encouraging feedback and absence of peer comparison will enhance confidence relative to traditional classroom dynamics.

**Q6: Frequency of Use / Willingness to Return** (SUS Item 1, Retained)
- **Theoretical Justification**: Behavioral intention is the strongest predictor of actual technology adoption (Venkatesh et al., 2003). Students' stated willingness to continue indicates intervention sustainability.
- **Operational Definition**: Desire to use the learning method again in future sessions.
- **Expected Hypothesis**: NOODEIA's gamification elements will increase intrinsic motivation and willingness to return compared to traditional methods.

**Excluded SUS Items and Justification**:
- **SUS 2, 8** (Complexity, Cumbersome): These items are conceptually inverse to ease of use (SUS 3), representing redundant constructs. For survey brevity, we retained the positively-framed item (Q4).
- **SUS 4** (Need for technical support): Operationalized more directly by Q9 (independence), which applies to both paper and computer conditions.
- **SUS 7** (Quick to learn): While relevant, this item focuses on initial learnability rather than sustained usability. Given the brief intervention duration, sustained usability (Q4, Q5) takes precedence.
- **SUS 5, 6** (Integration, Consistency): These items assess system-level design coherence, which presupposes meta-cognitive awareness typically absent in children under age 12.
- **SUS 10** (Need to learn things beforehand): Conceptually similar to SUS 7 and less discriminative for this comparison.

#### 4.3 Custom Items for NOODEIA-Specific Constructs (4 Items)

**Q7: Engagement and Intrinsic Motivation**
- **Theoretical Justification**: Self-Determination Theory (Deci & Ryan, 2000) posits that intrinsically motivated learning yields superior outcomes. Gamification research demonstrates that well-designed reward systems increase engagement without undermining intrinsic motivation (Sailer et al., 2017).
- **Operational Definition**: Affective enjoyment and interest during the learning experience.
- **NOODEIA Features Assessed**: Gamification (XP points, leveling system, achievement rewards), vocabulary games (4 game modes), quiz system with gacha-style rewards, leaderboard competition.
- **Traditional Comparison**: Teacher-led activities, paper worksheets, peer interaction.
- **Expected Hypothesis**: NOODEIA's game-based learning elements will significantly increase perceived fun and engagement relative to traditional worksheets.

**Q8: Personalization and Adaptive Instruction**
- **Theoretical Justification**: Aptitude-Treatment Interaction research indicates that personalized instruction matching individual learner needs yields superior outcomes (Cronbach & Snow, 1977). AI tutoring systems can provide individualized scaffolding at scale.
- **Operational Definition**: Perceived alignment between instruction and individual learning needs.
- **NOODEIA Features Assessed**: AI Tutor's Socratic questioning adapted to student responses, memory system tracking individual struggles, adaptive quiz difficulty, personalized vocabulary selection.
- **Traditional Comparison**: One-to-many instruction designed for average student, limited individualization.
- **Expected Hypothesis**: NOODEIA's AI-driven personalization will be perceived as better matched to individual needs than undifferentiated traditional instruction.

**Q9: Learner Independence and Autonomy**
- **Theoretical Justification**: Constructivist learning theory emphasizes the importance of learner autonomy in knowledge construction (Piaget, 1954). For remedial learners, reducing dependence on adult assistance may enhance self-regulated learning skills.
- **Operational Definition**: Ability to engage in learning activities without requiring external assistance.
- **NOODEIA Features Assessed**: 24/7 AI availability, guided questions promoting independent problem-solving, self-paced progression, asynchronous access.
- **Traditional Comparison**: Teacher availability limited to class time, dependence on adult for problem clarification, synchronous pacing.
- **Expected Hypothesis**: NOODEIA's on-demand support will enable greater learner independence compared to teacher-dependent traditional methods.

**Q10: Learning Efficiency and Pace**
- **Theoretical Justification**: Time-on-task research demonstrates that learning efficiency varies with instructional design (Carroll, 1963). For students behind grade level, accelerated catch-up requires efficient knowledge acquisition.
- **Operational Definition**: Perceived speed of learning and knowledge acquisition.
- **NOODEIA Features Assessed**: Immediate feedback on quizzes and games, adaptive difficulty preventing frustration plateaus, multi-modal learning (visual, interactive, textual), spaced repetition in vocabulary games.
- **Traditional Comparison**: Delayed feedback (graded homework), fixed pacing for whole class, primarily textual/verbal modalities.
- **Expected Hypothesis**: NOODEIA's immediate feedback and adaptive pacing will be perceived as enabling faster learning than traditional methods.

### 5. Instrument Validity Considerations

#### 5.1 Content Validity
The instrument demonstrates content validity through systematic coverage of key constructs identified in the research question:
- **Engagement**: Q6 (frequency), Q7 (fun/enjoyment)
- **Preparedness**: Q2 (performance), Q5 (confidence)
- **Catch-Up Rate**: Q10 (learning speed)
- **Accuracy**: Q2 (successful completion)
- **Enjoyable Experience**: Q7 (fun), Q3 (reverse: frustration)

#### 5.2 Construct Validity
Convergent validity is supported by including multiple items tapping related constructs (e.g., Q1 and Q4 both assess accessibility). Discriminant validity is preserved by ensuring Q7-Q10 capture unique variance not explained by standard usability measures.

#### 5.3 Developmental Appropriateness
All items employ vocabulary within the receptive language capacity of 5-year-olds (verified via Flesch-Kincaid Grade Level ≤ 1.0). Concrete language and present tense construction enhance comprehensibility. The elimination of abstract constructs (consistency, integration) prevents measurement error due to developmental limitations in meta-cognitive reasoning.

### 6. Methodological Considerations

#### 6.1 Parallel Form Equivalence
The two surveys are structurally identical, differing only in contextual reference (traditional/paper method vs. NOODEIA/computer method). This design enables within-subjects comparison while controlling for item wording effects. The parallel structure also facilitates paired-samples statistical testing (e.g., Wilcoxon signed-rank test for non-normal distributions common with Likert data).

#### 6.2 Response Bias Mitigation
**Reverse Coding**: Q3 (frustration) is reverse-coded to prevent acquiescence bias, wherein respondents systematically select higher values regardless of content. During analysis, Q3 scores are transformed (8 - raw score) to align with the positive directionality of remaining items.

**Positivity Bias**: For young children, positively-framed questions generally yield more reliable responses than negative framings (Borgers et al., 2000). Nine of ten items are positively framed, with Q3 providing necessary variability.

#### 6.3 Order Effects Control
Counterbalancing the administration sequence (traditional-first vs. NOODEIA-first) controls for potential order effects. However, given the target population's limited experience with formal evaluation, practice effects are expected to be minimal. A minimum 24-hour washout period between conditions prevents immediate carry-over effects.

---

## Administration Protocol

### 7. Standardized Administration Procedures

To ensure data quality and inter-rater reliability, survey administration must follow a standardized protocol. All questions are read aloud by a trained adult administrator to accommodate varying literacy levels within the 5-12 age range.

#### 7.1 Session Structure

**Pre-Survey**:
- Intervention session (20-30 minutes active learning)
- Brief transition (< 5 minutes) to maintain recollection accuracy

**Survey Administration** (5-10 minutes):
- Administrator reads each item aloud
- Visual scale presented with clear numerical and verbal anchors
- Child responds verbally or by pointing
- Administrator records response without interpretation

#### 7.2 Visual Scale Presentation

Research on survey administration with children recommends concrete visual anchors (Read, 2007). We employ a clearly labeled 7-point scale with consistent spacing:

```
    1           2           3           4           5           6           7
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
Extremely   Moderately   Slightly     Neither     Slightly   Moderately  Extremely
disagree    disagree     disagree                  agree       agree       agree
```

**Complete Scale Labels:**
- **1**: Extremely disagree
- **2**: Moderately disagree
- **3**: Slightly disagree
- **4**: Neither disagree nor agree
- **5**: Slightly agree
- **6**: Moderately agree
- **7**: Extremely agree

**Simplified Language for Younger Children (Ages 5-7):**

When reading aloud to younger participants, administrators may use simplified descriptors while maintaining the 7-point structure:

```
    1           2           3           4           5           6           7
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
 No, not    Not really   A little    Not sure    A little    Pretty      Yes, very
 at all!                  no                      yes        much yes     much!
```

#### 7.3 Data Quality Assurance

**Response Validity Checks**:
- Monitor for patterned responding (e.g., all 7s, alternating responses)
- Note instances requiring question clarification
- Record child attention level and engagement with survey process

**Administrator Training**:
- Neutral tone and facial expressions (avoid leading)
- Consistent pacing (adequate think-time without rushing)
- No interpretation or elaboration beyond scripted clarifications

### 8. Expected Outcomes and Analysis Plan

#### 8.1 Predicted Directional Hypotheses

**Cognitive Workload (Q1-Q3)**:
- H1a: NOODEIA will yield significantly higher ease ratings (Q1) than traditional methods due to adaptive difficulty.
- H1b: NOODEIA will yield significantly higher performance ratings (Q2) due to immediate feedback and scaffolding.
- H1c: NOODEIA will yield significantly lower frustration ratings (Q3) due to judgment-free AI interaction.

**Usability (Q4-Q6)**:
- H2a: NOODEIA will be rated as equally or more easy to use (Q4) than traditional methods despite technological complexity.
- H2b: NOODEIA will yield significantly higher confidence ratings (Q5) due to private interaction and encouraging feedback.
- H2c: NOODEIA will yield significantly higher willingness to return (Q6) due to gamification elements.

**NOODEIA-Specific Constructs (Q7-Q10)**:
- H3a: NOODEIA will yield significantly higher enjoyment ratings (Q7) due to game-based learning.
- H3b: NOODEIA will yield significantly higher personalization ratings (Q8) due to AI adaptation.
- H3c: NOODEIA will yield significantly higher independence ratings (Q9) due to on-demand support.
- H3d: NOODEIA will yield significantly higher learning speed ratings (Q10) due to immediate feedback and adaptive pacing.

#### 8.2 Statistical Analysis

**Descriptive Statistics**:
- Mean, median, standard deviation, and range for each item
- Distribution visualization (histograms) to assess normality

**Inferential Statistics**:
- Wilcoxon signed-rank test (paired, non-parametric) for within-subjects comparison
- Effect sizes (r = Z/√N) to quantify magnitude of differences
- Bonferroni correction for multiple comparisons (α = .005 for 10 tests)

**Composite Scores**:
- NASA-TLX subscale: Mean of Q1, Q2, (8-Q3)
- SUS subscale: Mean of Q4, Q5, Q6
- NOODEIA subscale: Mean of Q7, Q8, Q9, Q10
- Overall satisfaction: Mean of all 10 items (with Q3 reverse-coded)

### 9. Limitations and Delimitations

**Instrument Limitations**:
- Reduced item count (10 vs. 16 full NASA-TLX + SUS) may decrease reliability
- Self-report bias inherent to all survey research
- Developmental constraints on meta-cognitive awareness limit validity for youngest participants (ages 5-6)

**Methodological Delimitations**:
- Study focuses on subjective user experience rather than objective learning outcomes
- Surveys assess immediate post-intervention perceptions, not long-term retention
- Convenience sampling from participating schools may limit generalizability

**Mitigation Strategies**:
- Triangulate with objective performance measures (pre/post test scores)
- Conduct follow-up surveys at 1-week and 1-month intervals to assess retention
- Use stratified sampling to ensure representation across age groups (5-7, 8-10, 11-12)

---

## References

Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological Review, 84*(2), 191-215.

Borgers, N., de Leeuw, E., & Hox, J. (2000). Children as respondents in survey research: Cognitive development and response quality. *Bulletin de Méthodologie Sociologique, 66*(1), 60-75.

Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan et al. (Eds.), *Usability evaluation in industry* (pp. 189-194). Taylor & Francis.

Carroll, J. B. (1963). A model of school learning. *Teachers College Record, 64*(8), 723-733.

Compeau, D. R., & Higgins, C. A. (1995). Computer self-efficacy: Development of a measure and initial test. *MIS Quarterly, 19*(2), 189-211.

Cronbach, L. J., & Snow, R. E. (1977). *Aptitudes and instructional methods: A handbook for research on interactions*. Irvington.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly, 13*(3), 319-340.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227-268.

Hart, S. G., & Staveland, L. E. (1988). Development of NASA-TLX (Task Load Index): Results of empirical and theoretical research. In *Advances in psychology* (Vol. 52, pp. 139-183). North-Holland.

Pekrun, R. (2006). The control-value theory of achievement emotions: Assumptions, corollaries, and implications for educational research and practice. *Educational Psychology Review, 18*(4), 315-341.

Piaget, J. (1954). *The construction of reality in the child*. Basic Books.

Read, J. C. (2007). Validating the Fun Toolkit: An instrument for measuring children's opinions of technology. *Cognition, Technology & Work, 10*(2), 119-128.

Sailer, M., Hense, J. U., Mayr, S. K., & Mandl, H. (2017). How gamification motivates: An experimental study of the effects of specific game design elements on psychological need satisfaction. *Computers in Human Behavior, 69*, 371-380.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257-285.

Venkatesh, V., Morris, M. G., Davis, G. B., & Davis, F. D. (2003). User acceptance of information technology: Toward a unified view. *MIS Quarterly, 27*(3), 425-478.

---

## Appendix A: Background on NASA-TLX and SUS Frameworks

This appendix provides historical context on the validated frameworks from which our instrument draws. The original scales are presented for reference, though our study employs adapted versions as detailed in the main instrument design section.

### A.1 NASA Task Load Index (TLX) - Original 6-Dimension Framework

Hart and Staveland (1988) developed NASA-TLX to assess subjective workload across six dimensions using a 21-point scale (0-100):

| Dimension | Original Item | Scale Anchors |
|-----------|---------------|---------------|
| Mental Demand | How mentally demanding was the task? | Very Low (0) to Very High (100) |
| Physical Demand | How physically demanding was the task? | Very Low (0) to Very High (100) |
| Temporal Demand | How hurried or rushed was the pace? | Very Low (0) to Very High (100) |
| Performance | How successful were you in accomplishing what you were asked to do? | Perfect (0) to Failure (100) |
| Effort | How hard did you have to work to accomplish your level of performance? | Very Low (0) to Very High (100) |
| Frustration | How insecure, discouraged, irritated, stressed, and annoyed were you? | Very Low (0) to Very High (100) |

**Note**: Our adapted instrument retains 3 of 6 dimensions (Mental Demand, Performance, Frustration), excludes Physical Demand and Effort, and operationalizes Temporal Demand through Q9 (independence). The 21-point continuous scale is replaced with a 7-point Likert format appropriate for elementary-aged children.

### A.2 System Usability Scale (SUS) - Original 10-Item Framework

Brooke (1996) developed SUS as a 10-item questionnaire using a 5-point Likert scale. Items alternate between positive and negative framings:

| Item | Statement | Type |
|------|-----------|------|
| SUS01 | I think that I would like to use this system frequently. | Positive |
| SUS02 | I found the system unnecessarily complex. | Negative |
| SUS03 | I thought the system was easy to use. | Positive |
| SUS04 | I think that I would need the support of a technical person to be able to use this system. | Negative |
| SUS05 | I found the various functions in this system were well integrated. | Positive |
| SUS06 | I thought there was too much inconsistency in this system. | Negative |
| SUS07 | I would imagine that most people would learn to use this system very quickly. | Positive |
| SUS08 | I found the system very cumbersome to use. | Negative |
| SUS09 | I felt very confident using the system. | Positive |
| SUS10 | I needed to learn a lot of things before I could get going with this system. | Negative |

**Note**: Our adapted instrument retains 3 of 10 items (SUS03, SUS09, SUS01), excludes items requiring meta-cognitive awareness (SUS05, SUS06) or redundant constructs (SUS02, SUS08), and reformulates all items with child-appropriate language on a 7-point scale.

---

