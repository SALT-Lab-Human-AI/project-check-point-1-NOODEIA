# NASA Task Load Index (NASA-TLX)

Hart and Staveland’s NASA Task Load Index (TLX) method assesses workload on
six dimensions. Each dimension is rated on a 21-point scale from **Very Low**
to **Very High** (or **Perfect** to **Failure** for Performance).

---

### Participant Information

| Name | Task | Date |
|------|------|------|
|      |      |      |

---

## 1. Mental Demand  
**How mentally demanding was the task?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

## 2. Physical Demand  
**How physically demanding was the task?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

## 3. Temporal Demand  
**How hurried or rushed was the pace of the task?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

## 4. Performance  
**How successful were you in accomplishing what you were asked to do?**

Perfect  
`| | | | | | | | | | | | | | | | | | | |`  
Failure  

---

## 5. Effort  
**How hard did you have to work to accomplish your level of performance?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

## 6. Frustration  
**How insecure, discouraged, irritated, stressed, and annoyed were you?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

_Standard NASA Task Load Index (NASA-TLX) form._

# NASA-TLX Scoring

### Step 1 – Collect ratings

For each of the six dimensions, record a rating from 0–100  
(you can map the 21 tick marks to 0, 5, 10, …, 100):

- Mental Demand (MD)
- Physical Demand (PD)
- Temporal Demand (TD)
- Performance (PE)  *(note: higher = worse performance)*
- Effort (EF)
- Frustration (FR)

Let these be:

$$(R_{MD}, R_{PD}, R_{TD}, R_{PE}, R_{EF}, R_{FR})$$

---

### Raw (unweighted) TLX score

Just take the average of the six ratings:

$$[\text{Raw TLX} = \frac{R_{MD} + R_{PD} + R_{TD} + R_{PE} + R_{EF} + R_{FR}}{6}]$$

This gives a score from 0 to 100.

---

# Standard version of the System Usability Scale (SUS)

For each statement, please select a number from **1** to **5**:

- **1** – Strongly disagree  
- **2** – Disagree  
- **3** – Neither agree nor disagree  
- **4** – Agree  
- **5** – Strongly agree  

1. I think that I would like to use this system frequently.  
2. I found the system unnecessarily complex.  
3. I thought the system was easy to use.  
4. I think that I would need the support of a technical person to be able to use this system.  
5. I found the various functions in this system were well integrated.  
6. I thought there was too much inconsistency in this system.  
7. I would imagine that most people would learn to use this system very quickly.  
8. I found the system very cumbersome to use.  
9. I felt very confident using the system.  
10. I needed to learn a lot of things before I could get going with this system.

# SUS Scale

$$\mathrm{SUS} = 2.5\left(20 + \sum(\mathrm{SUS01},\mathrm{SUS03},\mathrm{SUS05},\mathrm{SUS07},\mathrm{SUS09}) - \sum(\mathrm{SUS02},\mathrm{SUS04},\mathrm{SUS06},\mathrm{SUS08},\mathrm{SUS10})\right)$$

SUS has generally been seen as providing this type of high-level subjective view of usability and is thus often used in carrying out comparisons of usability between systems. Because it yields a single score on a scale of 0–100, it can be used to compare even systems that are outwardly dissimilar. This one-dimensional aspect of the SUS is both a benefit and a drawback because the questionnaire is necessarily quite general.

---

# ✅ Proposed Short Survey for Noodeia AI Tutor

Below are the **proposed subsets** (5 items each) from NASA-TLX and SUS that focus on kids’ experience with the Noodeia AI tutor, plus updated scoring formulas.

---

## Proposed NASA-TLX Subset (5 Dimensions)

For Noodeia, we use 5 of the 6 original NASA-TLX dimensions  
(dropping **Physical Demand**, which is less relevant for a screen-based AI tutor).

We keep the same wording and visual format:

---

## 1. Mental Demand  
**How mentally demanding was the task?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

## 2. Temporal Demand  
**How hurried or rushed was the pace of the task?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

## 3. Performance  
**How successful were you in accomplishing what you were asked to do?**

Perfect  
`| | | | | | | | | | | | | | | | | | | |`  
Failure  

---

## 4. Effort  
**How hard did you have to work to accomplish your level of performance?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

## 5. Frustration  
**How insecure, discouraged, irritated, stressed, and annoyed were you?**

Very Low  
`| | | | | | | | | | | | | | | | | | | |`  
Very High  

---

### Scoring for Proposed Short NASA-TLX (5-Item)

For each of the five selected dimensions, record a rating from 0–100:

- Mental Demand (MD)
- Temporal Demand (TD)
- Performance (PE)  *(note: higher = worse performance)*
- Effort (EF)
- Frustration (FR)

Let these be:

$$(R_{MD}, R_{TD}, R_{PE}, R_{EF}, R_{FR})$$

Then compute the **short TLX score** as the mean of these five ratings:

$$[\text{Short TLX} = \frac{R_{MD} + R_{TD} + R_{PE} + R_{EF} + R_{FR}}{5}]$$

This gives a workload score from **0 to 100** (higher = higher workload).

---

## Proposed SUS Subset (5 Items)

From the original 10 SUS items, we use these 5 that best capture  
kids’ experience with the AI tutor:

1. **SUS01** – I think that I would like to use this system frequently.  
2. **SUS03** – I thought the system was easy to use.  
3. **SUS04** – I think that I would need the support of a technical person to be able to use this system.  
4. **SUS07** – I would imagine that most people would learn to use this system very quickly.  
5. **SUS09** – I felt very confident using the system.  

Response scale remains the same (1–5):

- **1** – Strongly disagree  
- **2** – Disagree  
- **3** – Neither agree nor disagree  
- **4** – Agree  
- **5** – Strongly agree  

---

### Scoring for Proposed Short SUS (5-Item, 0–100)

Let the raw responses be:

- $\mathrm{SUS01}, \mathrm{SUS03}, \mathrm{SUS04}, \mathrm{SUS07}, \mathrm{SUS09} \in \{1,2,3,4,5\}$

We follow standard SUS logic (positive vs negative items) but adapted to 5 items:

- **Positive items** (higher = better usability): 01, 03, 07, 09  
  - Contribution: response − 1  → range 0–4  
- **Negative item** (higher = worse usability): 04  
  - Contribution: 5 − response → range 0–4  

Let:

- $C_{01} = \mathrm{SUS01} - 1$  
- $C_{03} = \mathrm{SUS03} - 1$  
- $C_{07} = \mathrm{SUS07} - 1$  
- $C_{09} = \mathrm{SUS09} - 1$  
- $C_{04} = 5 - \mathrm{SUS04}$  

Sum the contributions (max = 5 × 4 = 20), then scale to 0–100:

$$
\text{Short SUS} = 5 \left(C_{01} + C_{03} + C_{04} + C_{07} + C_{09}\right)
$$

Substituting back in terms of the original item scores:

$$
\text{Short SUS} = 5 \Big[(\mathrm{SUS01}-1) + (\mathrm{SUS03}-1) + (5-\mathrm{SUS04}) + (\mathrm{SUS07}-1) + (\mathrm{SUS09}-1)\Big]
$$

This produces a **0–100 usability score** for the **5-item subset**, directly comparable in scale (though not identical in meaning) to the full SUS.
