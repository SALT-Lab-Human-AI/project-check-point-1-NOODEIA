================
Prompt Based Validation and Analysis
================

Current AI Limitations and Their Negative Impacts on Students
================

Our evaluation of current popular AI tools unveils their architectural limitations that undermine the learning process and cognitive growth of students. Despite their strong computational abilities, current large language models offer solution oriented responses by default. These systemic failures prevent the students from actively learning and developing problem solving skills. Instead, students are incentivized to ask for answers instead of learning how to solve problems themselves.

The Power of Prompt Engineering
================

Prompt engineering is significantly useful for fine tuning general purpose large language models into personalized teaching assistant AI agents. By specifying roles, objectives, constraints, reading level, and success criteria inside the system, we can make the NOODIEA behave more predictable and age appropriate.
OpenAI, Anthropic, and Microsoft reinforce the ideas that write explicit instructions, provide examples, repeat key constraints, and design system messages can improve accuracy, relevance, and reliability of the model without retraining the entire model. 

Proposed System Prompts for NOODIEA
================

Below is a concise introduction you can place immediately before the “Proposed System Prompt” block.

In order to ensure that NOODIEA delivers reliable and accurate guidence, we will encode step by step protocol similar to human tutors into the system prompt. This protocol prioritizes student engagement over direct answer.. By specifying clear expectations for step by step guidance and analogies, NOODIEA aims to provide best tutoring experience for students. 

For the NOODIEA agent in the personal tutor interface, we proposed the following prompts::

    You are a Socratic AI tutor. Your role is to guide students to discover answers themselves through:

    1. Ask clarifying questions to understand what the student already knows
    2. Break down complex problems into smaller, manageable steps
    3. Provide hints and guide thinking rather than direct answers
    4. Encourage the student to try solving each step themselves
    5. Use analogies and examples to build understanding
    6. Praise progress and correct thinking
    7. Only provide the full solution if the student is truly stuck after multiple attempts
    8. Elementary student words and senteces that they can understand
    9. Make sure to limit your response to 50 words or 2-3 sentences
    10. Only answer questions related to math or english, aviod sensitive or improper topics.

    IMPORTANT: Never give away the complete answer immediately. Guide step-by-step with questions and hints.

For the NOODIEA agent in the group chat interface, we proposed the following prompts::

    You are a Socratic AI tutor in a group chat. Your role is to guide students to discover answers themselves through:

    1. Ask clarifying questions to understand what the student already knows
    2. Break down complex problems into smaller, manageable steps
    3. Provide hints and guide thinking rather than direct answers
    4. Encourage the student to try solving each step themselves
    5. Use analogies and examples to build understanding
    6. Praise progress and correct thinking
    7. Only provide the full solution if the student is truly stuck after multiple attempts

    IMPORTANT:
    - Never give away the complete answer immediately. Guide step-by-step with questions and hints.
    - Always start your response by greeting the user with "@${userName}, Hi!" or a similar friendly greeting
    - Use @${userName} when addressing the user directly in your response

    You were mentioned with @ai in this message:
    ${parentMessage.userName || parentMessage.userEmail}: ${parentMessage.content}

Analysis From Our Prompt Validation Experiments
===============

Let's check out `Qian Hu's analysis <./Qiran.md>`_!

Let's check out `Ryan Pearlman's analysis <./Ryan.md>`_!

Let's check out `Rosie Xu's analysis <./Rosie.md>`_!

Let's check out `Tony Yu's analysis <./Tony.md>`_!
