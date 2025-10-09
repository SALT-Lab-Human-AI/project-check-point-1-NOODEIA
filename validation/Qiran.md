# Prompting Protocol – [Qiran Hu]

## Tool

*   Perplexity (Sonar Basic and Sonar Pro)    

## Scenarios & Tasks

This protocol demonstrates how Qiran Hu utilizes Perplexity in the designing and evaluating the personalized AI tutor agent NOODIEA for students in the local afterschool programs. Qiran Hu draft prompts for typical, edge, and failure cases during the experiment in order to gain a deeper understanding about the limitations in the current popular AI tools. Typical cases analyze math exercises like  basic arithmetic and conceptual explanations. Edge cases explore ambiguous and contextually complex questions such as word problems with mixed operations. Failure cases examine inaccurate instances, oversimplifications, or hallucinations when the users are using Perplexity.

*   **Typical Cases** explore in basic math problems
    *   Task: Generate simple addition or subtraction word problems.
    *   Task: Explain basic concepts like geometric shapes or counting.
    *   Task: Provide step by step guidance for introductory multiplication.

*   **Edge Cases** examine in complicated muti step math problems
    *   Task: Address ambiguous word problems involving fractions.
    *   Task: Apply real world scenarios with variables or remainders.
    *   Task: Incorporate concept questions to test students’ understandings .

*   **Failure Cases** target the limitations in accuracy and educational alignment.
    *   Task: Simplify complex fractions with intentional error simulation.
    *   Task: Introduce abstract concepts like negative numbers prematurely.
    *   Task: Respond to misinterpreted or trick queries.

# Prompt Transcripts & Outputs 

## Selected Prompts 

Prompts are designed to emphasize socratic methodologies where the model should be g guiding students to solve the questions step by step rather than giving away direct solutions. These prompts aim to evaluate the  critical thinking and problem solving skills of Preplexity. To achieve this, prompts incorporate explicit commands for Sonar Basic and Sonar Pro in order to observe how they handle typical, edge, and failure cases in zero shot. The typical cases utilize Sonar Pro while the edge and failure cases utilize Sonar Basic to better understand how well can reasoning model do in simple tasks as well as how basic model handle edge and failure cases.

[For detailed information, check out this](https://www.perplexity.ai/search/can-you-make-some-fun-adding-s-RqI7Z0n5Q6az4wSda_wE5A#9)

## Typical Cases: Everyday Math Questions

### 1. Addition Stories  

Prompt: 

```

Can you make some fun adding stories with animals or toys?

```

Sanitized Output: 

```

Here are some fun adding stories using animals and toys to make math engaging:

Animal Adding Stories
The Monkey Picnic
 There were 3 monkeys swinging in the trees. Then 2 more monkeys joined them with bunches of bananas. How many monkeys are swinging in the trees now?
 (3 + 2 = 5)


The Rabbit Race
 5 rabbits started racing on the grassy hill. Later, 4 more rabbits hopped in to join. How many rabbits are racing together?
 (5 + 4 = 9)


The Elephant Parade
 2 elephants began walking in the parade. Then 6 more elephants joined, each carrying colorful flags. How many elephants are in the parade now?
 (2 + 6 = 8)



Toy Adding Stories
The Teddy Bear Collection
 Mary had 4 teddy bears on her bed. She found 3 more teddy bears in the toy box. How many teddy bears does Mary have now?
 (4 + 3 = 7)


The Train Set
 Sam has 6 train cars. His dad bought him 2 more train cars at the store. How many train cars does Sam now have?
 (6 + 2 = 8)


The Building Blocks
 Lisa stacked up 5 building blocks. Her brother gave her 7 more blocks. How many blocks does she have in total?
 (5 + 7 = 12)


Would you like me to make these adding stories rhyme so they feel like fun little poems?”

```

### 2. Explaining Shapes

Prompt: 

```

What’s a circle and a square and a triangle? Tell me with stuff I see at home.

```

Sanitized Output: 

```

A circle, a square, and a triangle are shapes you can easily spot in everyday things at home. A circle looks like a clock, a coin, or a round dinner plate that you might eat from each day. A square reminds people of a slice of bread, a window, or the keys on a keyboard. A triangle can be seen in a pizza slice, some traffic signs, or the sandwich halves cut diagonally for lunch.[2][4][6]

***

### Everyday Shape Examples

- **Circle:**  
Clocks, coins, dinner plates, and balls are all examples of circles commonly found at home.[4][6][2]

- **Square:**  
Window panes, bread slices, gift boxes, and certain tiles on the floor usually have a square shape.[2][4]

- **Triangle:**  
Pizza slices, sandwich halves cut in triangles, sails on toy boats, and certain road signs are shaped like triangles.[6][4][2]

These everyday objects help make shapes easy to spot and fun to learn!

[1](https://schools.wrdsb.ca/athome/learn/elementary-home/elementary-2/math/math-grades-1-3/investigations/shadowy-shapes/)
[2](https://www.youtube.com/watch?v=wLpsQ7qKD6k)
[3](https://www.theteachertoolkit.com/index.php/tool/triangle-square-circle)
[4](https://www.yourdictionary.com/articles/examples-geometric-shapes-real-life)
[5](https://www.youtube.com/watch?v=cy6XdlRXUUs)
[6](https://www.findtutors.co.uk/questions/maths/how--you-explain-geometry---child)
[7](https://thechattykinder.com/shapes-in-everyday-objects-clip-cards-with-real-photos/)
[8](https://www.onlinemathlearning.com/kindergarten-shapes.html)

```

### 3. Multiplication with Groups
  
Prompt: 

```

How do I do 3 times 4? I don’t get it.

```

Sanitized Output: 

```

# Understanding 3 Times 4

Great question! Multiplying can feel confusing at first, but let's break down what "3 times 4" means using things you see every day.

**Think of it as:**
- "3 groups of 4"
- Or, "Add 4 together 3 times."

### Visual Example: Toy Cars
Imagine you have **3 boxes**. Each box has **4 toy cars** inside.

- First box: 4 cars
- Second box: 4 cars
- Third box: 4 cars

How many toy cars do you have in all? Let's add:

- 4 + 4 + 4 = ?

**Can you try adding those up yourself? What’s the total?**

Once you add them, you’ve found what "3 times 4" equals. After you try, I’ll help check your answer!

[1](https://www.youtube.com/watch?v=5XftC0eGr3w)
[2](https://www.youtube.com/watch?v=Aggtx-BzXyQ)
[3](https://www.reddit.com/r/maths/comments/1gq8tq7/how_do_i_explain_it_to_them/)
[4](https://www.youtube.com/watch?v=g5TmDrXeiR8)
[5](https://math.answers.com/math-and-arithmetic/What_do_you_get_when_you_multiply_3_by_4)
[6](https://www.youtube.com/watch?v=NyziE_7HRng)
[7](https://www.themathdoctors.org/what-is-multiplication-how-to-teach-it/)
[8](https://thirdspacelearning.com/us/math-resources/topic-guides/number-and-quantity/multiplication/)

```

## Edge Cases: Tricky Real World Math Problems

### 4. Fraction Sharing Story  

Prompt: 

```

If I have half a pizza and my friend has a third, how much pizza do we have together?

```

Sanitized Output: 

```

If you have half a pizza and your friend has a third of a pizza, together you have five-sixths of a whole pizza. Adding fractions like halves and thirds works like this:

- Half is written as $$ \frac{1}{2} $$
- A third is written as $$ \frac{1}{3} $$

To add them, find a number both 2 and 3 go into (a common denominator, which is 6):

- $$ \frac{1}{2} = \frac{3}{6} $$
- $$ \frac{1}{3} = \frac{2}{6} $$

Add:  
$$ \frac{3}{6} + \frac{2}{6} = \frac{5}{6} $$

So, together you and your friend have **five-sixths** of a pizza.[3][8]

[1](https://www.reddit.com/r/askmath/comments/16qxrvq/how_adding_fraction_gonna_work_with_2_pizza_with/)
[2](https://www.youtube.com/watch?v=g78WwcKZjas)
[3](https://www.educationworld.com/a_lesson/fun-with-fractions)
[4](https://www.mathnasium.com/math-centers/northbethesda/news/fractions-daily-life-how-slice-pizza-fairly-l)
[5](https://www.elephango.com/index.cfm/pg/k12learning/lcid/14173/Pizza_Party_Math:_Adding_3_Fractions_With_a_Twist)
[6](https://www.youtube.com/watch?v=e7qHNil2Bl8)
[7](https://www.pbslearningmedia.org/resource/turning-pizza-into-fractions-video/rise-and-shine-math-time/)
[8](https://www.instagram.com/reel/DN49PHFDF06/)
[9](https://www.youtube.com/watch?v=lP1l5lOgjEs)
[10](https://sparkedinnovations.net/Easy,%20Peasy,%20Pizza%20Pie!.pdf)

```

### 5. Baking Subtraction Problem
  
Prompt: 

```

I need 10 eggs for cookies but I only got 7. How many more do I need?

```

Sanitized Output: 

```

To find out how many more eggs you need if you have 7 eggs but need 10, you subtract the number you have from the total you need:

10 (needed) - 7 (have) = 3

So, you need 3 more eggs to have enough for the cookies.[1][2]

[1](https://www.youtube.com/watch?v=ao6cCbwhWFY)
[2](https://study.com/learn/lesson/difference-in-math-overview.html)
[3](https://www.reddit.com/r/askmath/comments/p5so7d/what_formula_do_i_use_to_find_the_percent/)
[4](https://www.calculatorsoup.com/calculators/algebra/percent-difference-calculator.php)
[5](https://www.calculatorsoup.com/calculators/algebra/absolute-difference-calculator.php)
[6](https://stackoverflow.com/questions/13602170/how-do-i-find-the-difference-between-two-values-without-knowing-which-is-larger)
[7](https://discussions.apple.com/thread/1520375)
[8](https://community.smartsheet.com/discussion/106038/how-to-calculate-the-difference-between-two-values-and-display-the-result-with-a-or-sign/p1)

```

### 6. Cultural Division Example
  
Prompt: 

```

I got 12 sweets to share with 3 friends. How many does each person get?

```

Sanitized Output: 

```

If you have 12 sweets to share equally with 3 friends, you divide the 12 sweets by 3 people:

12 ÷ 3 = 4

So, each person gets 4 sweets to share fairly among all 3 friends.[1][2]

[1](https://www.youtube.com/watch?v=frlZ_rRjBa0)
[2](https://www.gauthmath.com/solution/1805470302260422/Discuss-the-following-e-12-sweets-betwe3-learners-Divide-12-sweets-between-4-lea)
[3](https://www.gauthmath.com/solution/1806119346575430/Discuss-the-following-Divide-12-sweets-between-3-le-Divide-12-sweels-beter-ve-th)

```

## Failure Cases: Confusing or Misleading Prompts

### 7. Fraction Mistake Then Fix  

Prompt: 

```

How do you add 3/6 and 1/4? I keep getting it wrong.

```

Sanitized Output: 

```

Let's work through how to add $$\frac{3}{6}$$ and $$\frac{1}{4}$$ step by step.

### Step 1: Are the denominators the same? 6 and 4 are different, so we need a common denominator.

### Step 2: Find the least common denominator (LCD)
Look for the smallest number both 6 and 4 divide into evenly. That number is 12.

### Step 3: Convert each fraction to an equivalent fraction with denominator 12
- For $$\frac{3}{6}$$, multiply numerator and denominator by 2: $$\frac{3 \times 2}{6 \times 2} = \frac{6}{12}$$
- For $$\frac{1}{4}$$, multiply numerator and denominator by 3: $$\frac{1 \times 3}{4 \times 3} = \frac{3}{12}$$

### Step 4: Add the numerators and keep the denominator
$$\frac{6}{12} + \frac{3}{12} = \frac{6 + 3}{12} = \frac{9}{12}$$

### Step 5: Simplify if possible
Both numerator and denominator can be divided by 3:
$$\frac{9 \div 3}{12 \div 3} = \frac{3}{4}$$

So, $$\frac{3}{6} + \frac{1}{4} = \frac{3}{4}$$. 

Would you like to try with another example, or want some practice problems to try yourself?

[1](https://www.mashupmath.com/blog/how-to-add-fractions)
[2](https://www.dummies.com/article/academics-the-arts/math/pre-algebra/how-to-add-fractions-with-different-denominators-191336/)
[3](https://www.elephango.com/index.cfm/pg/k12learning/lcid/12777/Adding_Fractions_with_Unlike_Denominators)
[4](https://www.youtube.com/watch?v=tDQipFjAoT8)
[5](https://www.youtube.com/watch?v=CoCmsyFQ_Xc)
[6](https://www.mathnasium.com/math-centers/4sranch/news/add-and-subtract-fractions-unlike-denominators)
[7](https://www.calculatorsoup.com/calculators/math/adding-fractions-calculator.php)
[8](https://www.youtube.com/shorts/VKgcIgRx-3E)

```

### 8. Negative Numbers Confusion  

Prompt: 

```

What’s a negative number? I don’t get what that means.

```

Sanitized Output: 

```

A negative number is a number that is less than zero. It is written with a minus sign (-) in front of it, like -3 or -7. You can think of negative numbers as numbers that are on the left side of zero on a number line. 

For example, if you have zero candies and you owe a friend 3 candies, you could say you have -3 candies because you need to give some back. Negative numbers often show things like owing money, temperatures colder than zero, or going backwards.[1][3][9]

So, negative numbers are the opposite of positive numbers and are really useful when counting things less than nothing or moving below zero on a scale.

[1](https://www.cuemath.com/numbers/negative-numbers/)
[2](https://en.wikipedia.org/wiki/Negative_number)
[3](https://edu.gcfglobal.org/en/algebra-topics/negative-numbers/1/)
[4](https://www.dreambox.com/math/skills/numbers/negative-numbers)
[5](https://davenport.libguides.com/math-skills-overview/basic-operations/negative)
[6](https://www.reddit.com/r/askmath/comments/zpd6a7/negative_numbers_what_are_they/)
[7](https://www.youtube.com/watch?v=OAoLCXpao6s)
[8](https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-negative-number-topic/cc-6th-neg-num-intro/v/introduction-to-negative-numbers)
[9](https://www.mathsisfun.com/definitions/negative.html)
[10](https://www.khanacademy.org/math/arithmetic-home/negative-numbers/neg-num-intro/a/intro-to-negative-numbers)

```

### 9. Math Riddle Misstep  

Prompt: 

```

What’s 2 plus 2 but make it a riddle.

```

Sanitized Output: 

```

Here’s a fun riddle for 2 plus 2:

I am two and two,  
Together in a crew.  
Add us up, what do you see?  
A number as sweet as can be!  

What am I?  

(Answer: 4)  

Would you like more riddles like this?

[1](https://www.dreambox.com/math/guides/brain-teasers-for-kids)
[2](https://loquiz.com/2024/12/18/20-math-riddles-with-answers-to-challenge-your-minds/)
[3](https://www.prodigygame.com/main-en/blog/riddles-for-kids)
[4](https://www.splashlearn.com/blog/best-math-riddles-for-kids/)
[5](https://brighterly.com/blog/math-riddles-for-kids/)
[6](https://logiclike.com/en/math-riddles)
[7](https://www.reddit.com/r/math/comments/thto4v/what_are_your_favourite_math_puzzles_to_give/)
[8](https://www.mashupmath.com/blog/free-math-riddles-for-kids)
[9](https://www.thinkwellhomeschool.com/pages/free-math-puzzles)

```

# Gap Analysis

## Accuracy 

* While the evaluation demonstrates that both Sonar Basic and Pro models exhibit sufficient mathematical computational accuracy across all test cases, the analysis reveals a significant inconsistency in teaching methodology. The tools provide complete solutions in 7 out of 9 cases which is approximately 78%.  

## Reliability

* The systems demonstrate inadequate conceptual progression management as evidenced in case 8 where the tool introduced abstract concepts of negative numbers without first assessing whether students had achieved mastery of prerequisite mathematical foundations. 

## Latency 

* The system constantly takes longer time to generate response as the conversation gets longer and longer


## User Experience Friction

* The interface design presents significant barriers to students as shown in cases 2, 4, 5, 6, 7, and 8 where each response contains 3 to 10 reference links. The overwhelming links create cognitive overload and they are inappropriate for the target demographic. 

* The systems also lack fundamental engagement tracking mechanisms because they just deliver content without engaging and interacting with the students .


## Safety 

* The system includes external citations to YouTube and various websites introduces uncontrolled factors as these platforms lack age appropriate filtering. 

## Cost 

* Despite the increased cost, the responses from Sonar Pro indicate no significant improvement in teaching methodology since it still offers direct answers.  

# Opportunity Framing

* With the scratch paper interface that transforms the traditional problem solving experience into an interactive learning journey,  NOODIEA's digital workspace enables students to visualize their mathematical thinking and demonstrate their problem solving processes in real time. After successfully completing a problem, the system celebrates achievement through engaging visual rewards such as confetti animations, which fosters positive learning associations and intrinsic motivation. 

* NOODIEA's group chat feature represents a significant shift from isolated AI tutoring to collaborative peer learning with AI assistants. Multiple students can simultaneously engage in real time discussions about mathematical concepts. The students can create virtual study group environments that mirror classroom collaboration dynamics as the threaded conversation architecture allows students to reply directly to specific messages. 

* The @ai feature  provides personalized assistance by analyzing entire conversation threads to understand the context before responding. With its context awareness, NOODIEA can respond directly to the student who requested help, which provides personalized guidance in the collaborative learning environment. Students can switch between different chat rooms in order to engage in solving different mathematical problems based on their needs. 

* NOODIEA's teaching assistant integration allows teaching assistants to upload detailed instructional notes and teaching strategies from professional educators so that NOODIEA can follow the current established classroom methodologies and individual teaching styles. This feature enables the NOODIEA to deliver feedback that mirrors the exact instructional approach students would receive from their regular teachers.

* The NOODIEA’s advanced voice synthesis technology clones teaching assistants' voices to provide audio narration of questions and responses, which creates an inclusive learning environment that enhances comprehension and reduces cognitive distance between AI and human instruction. By preserving the teaching assistant's style within the AI system, NOODIEA ensures that it amplifies rather than replaces human educational expertise.
  

