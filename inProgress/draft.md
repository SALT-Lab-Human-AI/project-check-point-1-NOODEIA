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

## Proposed Short Survey for Noodeia

To reduce cognitive load on students while maintaining measurement validity, we propose **5-item subsets** of both NASA-TLX and SUS, specifically tailored for evaluating the Noodeia AI tutoring experience.

---

### Short NASA-TLX (5 Items)

#### Selected Dimensions

We retain **5 of 6** original NASA-TLX dimensions, **excluding Physical Demand**:

1. ✅ Mental Demand
2. ❌ ~~Physical Demand~~ (excluded)
3. ✅ Temporal Demand
4. ✅ Performance
5. ✅ Effort
6. ✅ Frustration

#### Rationale for Item Selection

| Dimension | Why Included / Excluded |
|-----------|------------------------|
| **Mental Demand** | **Core measure** for educational tools. Assesses cognitive load, which is critical for learning effectiveness. High mental demand may indicate content is too challenging or interface is confusing. |
| **Physical Demand** | **Excluded** because the AI tutor is primarily screen-based with minimal physical interaction (typing, clicking). Physical demand is not a differentiating factor for software usability in this context. |
| **Temporal Demand** | **Important for learning pace**. Students should feel they have adequate time to think and respond. High temporal demand suggests the system rushes students or creates time pressure that impedes learning. |
| **Performance** | **Critical self-assessment metric**. Students' perception of their success indicates whether the tutor is helping them achieve learning goals. Low perceived performance may signal need for better scaffolding or feedback. |
| **Effort** | **Distinguishes between difficulty and efficiency**. Even if mental demand is high (challenging content), effort should be reasonable. High effort relative to achievement suggests inefficiency in the learning process. |
| **Frustration** | **Emotional experience indicator**. Captures stress, annoyance, and discouragement—key factors in student engagement and persistence. High frustration predicts dropout and disengagement. |

#### Survey Questions

Each dimension is rated using a visual scale with 21 tick marks corresponding to values from 0 to 100 (in increments of 5):

---

**1. Mental Demand**  
*How mentally demanding was using the AI tutor?*

```
Very Low                                                                                                Very High
|    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
0    5    10   15   20   25   30   35   40   45   50   55   60   65   70   75   80   85   90   95   100
```

---

**2. Temporal Demand**  
*How hurried or rushed was the pace of the tutoring session?*

```
Very Low                                                                                                Very High
|    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
0    5    10   15   20   25   30   35   40   45   50   55   60   65   70   75   80   85   90   95   100
```

---

**3. Performance**  
*How successful were you in accomplishing what you were asked to do?*

```
Perfect                                                                                                  Failure
|    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
0    5    10   15   20   25   30   35   40   45   50   55   60   65   70   75   80   85   90   95   100
```

---

**4. Effort**  
*How hard did you have to work to accomplish your level of performance?*

```
Very Low                                                                                                Very High
|    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
0    5    10   15   20   25   30   35   40   45   50   55   60   65   70   75   80   85   90   95   100
```

---

**5. Frustration**  
*How insecure, discouraged, irritated, stressed, and annoyed were you?*

```
Very Low                                                                                                Very High
|    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
0    5    10   15   20   25   30   35   40   45   50   55   60   65   70   75   80   85   90   95   100
```

---

### Short SUS (5 Items)

#### Selected Items

From the original 10 SUS items, we selected these 5:

- ✅ **SUS01** – I think that I would like to use this system frequently.
- ✅ **SUS03** – I thought the system was easy to use.
- ✅ **SUS04** – I think that I would need the support of a technical person to be able to use this system.
- ✅ **SUS07** – I would imagine that most people would learn to use this system very quickly.
- ✅ **SUS09** – I felt very confident using the system.

#### Rationale for Item Selection

| Item | Type | Why Selected |
|------|------|-------------|
| **SUS01** (Frequency of use) | Positive | **Engagement indicator**. Willingness to use the system frequently is the strongest predictor of adoption and learning persistence. For an educational tool, repeated engagement is essential for outcomes. |
| **SUS03** (Easy to use) | Positive | **Core usability measure**. Directly assesses whether students find the interface intuitive. If the system isn't easy to use, students will focus on navigation rather than learning. Most fundamental usability question. |
| **SUS04** (Need technical support) | Negative | **Independence measure**. Students should be able to use the AI tutor autonomously. Need for technical support indicates poor onboarding, unclear instructions, or interface complexity—all barriers to self-directed learning. |
| **SUS07** (Quick to learn) | Positive | **Learnability assessment**. Educational tools must have low barriers to entry. If students can't quickly learn how to use the system, they'll abandon it before experiencing learning benefits. Critical for first-time users. |
| **SUS09** (Confidence) | Positive | **Self-efficacy indicator**. Confidence in using the system correlates with willingness to explore features and engage deeply. Low confidence suggests intimidating design or unclear affordances. |

#### Items NOT Selected (and why)

| Item | Type | Why NOT Selected |
|------|------|------------------|
| SUS02 (Unnecessarily complex) | Negative | **Redundant with SUS03**. Complexity is the inverse of ease-of-use; including both doesn't add new information in a short survey. |
| SUS05 (Well integrated) | Positive | **Too technical for students**. "Integration" refers to feature coherence, which requires systems-thinking most students lack. Less actionable than concrete usability measures. |
| SUS06 (Too much inconsistency) | Negative | **Lower priority**. While important for power users, inconsistency is less critical than fundamental ease-of-use and learnability for educational contexts. |
| SUS08 (Cumbersome) | Negative | **Overlaps with SUS03 and SUS04**. "Cumbersome" combines difficulty and inefficiency—already captured by easier-to-interpret items. |
| SUS10 (Learn many things first) | Negative | **Redundant with SUS07**. Both assess learnability; SUS07's positive framing ("quick to learn") is clearer for students than SUS10's negative framing. |

#### Survey Questions

Respondents rate each statement on a 5-point scale:

| Rating | Meaning |
|--------|---------|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Neither agree nor disagree |
| 4 | Agree |
| 5 | Strongly agree |

---

**1. I think that I would like to use this system frequently.**

`○ Strongly disagree    ○ Disagree    ○ Neither    ○ Agree    ○ Strongly agree`

---

**2. I thought the system was easy to use.**

`○ Strongly disagree    ○ Disagree    ○ Neither    ○ Agree    ○ Strongly agree`

---

**3. I think that I would need the support of a technical person to be able to use this system.**

`○ Strongly disagree    ○ Disagree    ○ Neither    ○ Agree    ○ Strongly agree`

---

**4. I would imagine that most people would learn to use this system very quickly.**

`○ Strongly disagree    ○ Disagree    ○ Neither    ○ Agree    ○ Strongly agree`

---

**5. I felt very confident using the system.**

`○ Strongly disagree    ○ Disagree    ○ Neither    ○ Agree    ○ Strongly agree`

---

## Scoring Instructions

### Short NASA-TLX Scoring (5-Item Version)

#### Step 1: Collect Ratings

For each dimension, record the rating (0-100):
- R_MD = Mental Demand
- R_TD = Temporal Demand
- R_PE = Performance (note: higher = worse)
- R_EF = Effort
- R_FR = Frustration

#### Step 2: Calculate Score

```
Short TLX = (R_MD + R_TD + R_PE + R_EF + R_FR) / 5
```

#### Formula Explanation

**Why simple averaging?**
- The Raw TLX approach treats all dimensions equally, which is appropriate for a general assessment
- For the 5-item version, we removed Physical Demand but kept the same averaging logic
- Each of the 5 remaining dimensions contributes 20% to the final score

**Mathematical breakdown:**
1. Sum all five ratings: `Total = R_MD + R_TD + R_PE + R_EF + R_FR`
   - Minimum possible sum: 0 (all dimensions rated 0)
   - Maximum possible sum: 500 (all dimensions rated 100)

2. Divide by 5 to get mean: `Short TLX = Total / 5`
   - Minimum possible score: 0 / 5 = **0**
   - Maximum possible score: 500 / 5 = **100**

**Result interpretation:**
- **0-100 scale** where higher scores indicate **higher cognitive workload**
- Maintains comparability with standard TLX literature (just multiply by 6/5 to estimate full TLX if needed)

---

### Short SUS Scoring (5-Item Version)

#### Step 1: Identify Item Types

- **Positive items** (higher rating = better usability): SUS01, SUS03, SUS07, SUS09
- **Negative item** (higher rating = worse usability): SUS04

#### Step 2: Calculate Contributions

For each item, calculate its contribution to the score:

**Positive items:**
```
Contribution = Raw Score - 1
```
- If student rates 5 (Strongly agree) → Contribution = 5 - 1 = 4
- If student rates 3 (Neutral) → Contribution = 3 - 1 = 2
- If student rates 1 (Strongly disagree) → Contribution = 1 - 1 = 0

**Negative item:**
```
Contribution = 5 - Raw Score
```
- If student rates 1 (Strongly disagree) → Contribution = 5 - 1 = 4 ✓ (good!)
- If student rates 3 (Neutral) → Contribution = 5 - 3 = 2
- If student rates 5 (Strongly agree) → Contribution = 5 - 5 = 0 (bad!)

#### Step 3: Calculate Final Score

```
Short SUS = 5 × (C_01 + C_03 + C_04 + C_07 + C_09)
```

Where:
- C_01 = SUS01 - 1
- C_03 = SUS03 - 1
- C_04 = 5 - SUS04 (note the reversal!)
- C_07 = SUS07 - 1
- C_09 = SUS09 - 1

**Expanded formula:**
```
Short SUS = 5 × [(SUS01 - 1) + (SUS03 - 1) + (5 - SUS04) + (SUS07 - 1) + (SUS09 - 1)]
```

#### Formula Explanation

**Why this scoring method?**

1. **Normalizes positive and negative items:**
   - Positive items: Subtract 1 to get range of 0-4
   - Negative item: Reverse with (5 - score) to get range of 0-4
   - This ensures all items contribute in the same direction (higher = better)

2. **Mathematical breakdown:**
   - Each item contributes 0-4 points
   - 5 items × 4 points = **20 maximum points**
   - Multiply by 5 to scale to 0-100: `20 × 5 = 100`

3. **Example calculation:**
   ```
   Student responses:
   SUS01 = 5 (Strongly agree - would use frequently)
   SUS03 = 4 (Agree - easy to use)
   SUS04 = 2 (Disagree - don't need tech support) ✓
   SUS07 = 4 (Agree - quick to learn)
   SUS09 = 5 (Strongly agree - felt confident)
   
   Contributions:
   C_01 = 5 - 1 = 4
   C_03 = 4 - 1 = 3
   C_04 = 5 - 2 = 3 (reversed!)
   C_07 = 4 - 1 = 3
   C_09 = 5 - 1 = 4
   
   Total contributions = 4 + 3 + 3 + 3 + 4 = 17
   
   Short SUS = 5 × 17 = 85 (Excellent usability!)
   ```

**Result interpretation:**
- **0-100 scale** where higher scores indicate **better usability**
- Maintains the SUS scale properties for benchmarking

---

## Interpreting Results

### Short NASA-TLX Interpretation

**Overall Workload Score:**

| Score Range | Interpretation | Recommended Action |
|-------------|----------------|-------------------|
| **0-20** | Very low workload | System may be too simple or not engaging enough |
| **21-40** | Low workload | Good balance for learning—students feel comfortable |
| **41-60** | Moderate workload | Optimal for learning; challenging but manageable |
| **61-80** | High workload | May need simplification or better scaffolding |
| **81-100** | Very high workload | Critical issues; system is overwhelming students |

**Dimension-Specific Analysis:**

| Dimension | Red Flags (Scores > 60) | What to Investigate |
|-----------|------------------------|---------------------|
| **Mental Demand** | Content may be too complex or interface confusing | - Simplify language<br>- Add visual aids<br>- Break down complex tasks |
| **Temporal Demand** | Students feel rushed or time-pressured | - Remove time limits<br>- Add pause functionality<br>- Reduce content per session |
| **Performance** | Students feel they're failing | - Provide better feedback<br>- Add hints or examples<br>- Adjust difficulty algorithm |
| **Effort** | High effort relative to results | - Streamline workflows<br>- Reduce clicks/steps<br>- Improve instructions |
| **Frustration** | Students are stressed or annoyed | - Fix technical bugs<br>- Improve error messages<br>- Add encouraging feedback |

**Ideal Profile for Educational AI:**
- Mental Demand: 40-60 (challenging but not overwhelming)
- Temporal Demand: < 40 (students don't feel rushed)
- Performance: < 30 (students feel successful)
- Effort: 30-50 (reasonable work for results)
- Frustration: < 30 (minimal stress)

---

### Short SUS Interpretation

**Overall Usability Score:**

| Score Range | Grade | Adjective | Interpretation |
|-------------|-------|-----------|----------------|
| **85-100** | A | Excellent | Best-in-class usability; students love it |
| **73-84** | B | Good | Above average; minor improvements possible |
| **52-72** | C | Okay | Average usability; needs improvement |
| **26-51** | D | Poor | Below average; significant issues present |
| **0-25** | F | Awful | Severe usability problems; unusable for most |

**Benchmarking Context:**
- Average SUS score across all products: **68**
- Educational software average: **65-70**
- Target for Noodeia: **≥ 75** (good to excellent)

**Item-Specific Red Flags:**

| Item | Low Score Indicates | Improvement Actions |
|------|-------------------|---------------------|
| **SUS01** (Frequency) | Students don't want to return | - Improve engagement features<br>- Add gamification<br>- Personalize content |
| **SUS03** (Easy to use) | Interface is confusing | - Simplify navigation<br>- Add onboarding tutorial<br>- Improve visual hierarchy |
| **SUS04** (Tech support) | Students need help to use it | - Better instructions<br>- Contextual help tooltips<br>- FAQ or video tutorials |
| **SUS07** (Quick to learn) | High learning curve | - Streamline first experience<br>- Reduce feature complexity<br>- Progressive disclosure |
| **SUS09** (Confidence) | Interface is intimidating | - Add success feedback<br>- Simplify language<br>- Provide examples |

---

### Expected Results from Noodeia Testing

Based on the survey design, we expect to observe:

#### 1. **Correlation Patterns**

**Strong negative correlation expected:**
- High Mental Demand ↔ Low SUS scores
- High Frustration ↔ Low SUS01 (frequency)
- High Temporal Demand ↔ Low SUS09 (confidence)

**Interpretation:** Students who find the system mentally demanding and frustrating are less likely to perceive it as usable or want to return.

#### 2. **Student Segmentation**

**High performers vs. struggling students:**
- High performers: Lower Performance scores (feel successful), higher SUS scores
- Struggling students: Higher Performance, Effort, and Frustration scores, lower SUS scores

**Use case:** Identify if the AI tutor works for all ability levels or only benefits certain students.

#### 3. **Feature Effectiveness**

**Compare scores across different features:**
- Practice problems vs. concept explanations
- Hint system vs. worked examples
- Adaptive vs. fixed difficulty

**Actionable insights:** Identify which features minimize workload while maximizing perceived usability.

#### 4. **Benchmarking Against Traditional Tutoring**

**Expected advantages of AI tutor:**
- Lower Temporal Demand (no appointment scheduling)
- Higher SUS07 (quick to learn - instant access)
- Lower Frustration (available 24/7, judgment-free)

**Expected challenges:**
- Higher Mental Demand? (less personalized than human tutor)
- Lower SUS01? (less engaging than human interaction)

#### 5. **Iterative Improvement Metrics**

**Track changes across versions:**
```
Version 1.0 → Version 1.1 → Version 1.2
TLX: 65 → 58 → 52 (decreasing workload ✓)
SUS: 62 → 71 → 78 (increasing usability ✓)
```

**Success criteria:** Each iteration should show measurable improvement in at least 2-3 dimensions.

---

### Statistical Analysis Recommendations

#### Sample Size
- **Minimum:** 30 students (for basic statistics)
- **Recommended:** 100+ students (for robust analysis and segmentation)

#### Analysis Methods

1. **Descriptive Statistics:**
   ```
   - Mean and SD for each dimension
   - Distribution plots (histograms)
   - Identify outliers (students with extreme experiences)
   ```

2. **Comparative Analysis:**
   ```
   - Compare across grade levels (5th vs 8th grade)
   - Compare across subjects (math vs science)
   - Compare across usage patterns (frequent vs infrequent users)
   ```

3. **Correlation Analysis:**
   ```
   - Pearson correlation between TLX and SUS
   - Identify which workload dimensions most impact usability
   - Find relationships between objective performance (test scores) and subjective measures
   ```

4. **Regression Analysis:**
   ```
   - Predict SUS from TLX dimensions
   - Identify strongest predictors of overall satisfaction
   - Control for demographic variables (age, prior achievement)
   ```

---

## Administering the Survey

### Best Practices

1. **Timing:**
   - Administer immediately after a tutoring session (while experience is fresh)
   - Ideal session length: 20-30 minutes
   - Allow 5-10 minutes after session for survey completion

2. **Instructions for Students:**
   ```
   "We want to know about your experience using the AI tutor today. 
   There are no right or wrong answers—we just want your honest opinion 
   so we can make the tutor better for you and other students.
   
   This should take about 5 minutes. Please answer based on how you 
   felt during today's session."
   ```

3. **Response Format:**
   - Use visual sliders or click-to-mark scales (more engaging than text boxes)
   - Show progress indicator (e.g., "Question 3 of 10")
   - Allow "skip" option but encourage completion

4. **Anonymous vs. Identified:**
   - **Anonymous:** Higher honesty, can't track individual progress
   - **Identified:** Can correlate with performance data, track over time
   - **Recommendation:** Use student IDs (pseudo-anonymous) to enable longitudinal analysis while protecting identity

---

