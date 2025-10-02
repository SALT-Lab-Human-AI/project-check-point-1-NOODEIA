**# Prompting Protocol – \[Rosie Xu\]

## Tool

*   ChatGPT (GPT-5), Copilot / Perplexity, Khanmigo
    

## Scenarios & Tasks

*   T1 Homework Help (typical): Present a math word problem. Ask the tool to give only the next step and a one-sentence hint.  
      
    
*   T2 Item Generation (edge): Request one multiple-choice question with one correct answer and three distractors that each match a common misconception.  
      
    
*   T3 Step Fix (failure): Provide a student’s incorrect solution step. Ask the tool to (a) judge if correct/incorrect, and (b) if incorrect, label the error and give one correct next step.  
      
    

## Prompts Used

*   T1 Prompt:  
    “A student asks: <problem>. Give ONLY the next step and one short hint. Do not provide the full solution.”  
      
    
*   T2 Prompt:  
    “Learning goal: <topic>. Generate 1 multiple-choice question with 1 correct answer and 3 distractors, each tied to a common misconception. Output in JSON.”  
      
    
*   T3 Prompt:  
    “Student step: <expression>. Decide if it is correct or incorrect. If incorrect, name the error and give only one correct next step.”  
      
    

(Replace <problem>, <topic>, <expression> with own examples.)

## Protocol Rules

*   Format: Use plain text or minimal JSON for consistency.  
      
    
*   Retries: Maximum 1 retry. Keep both outputs.  
      
    
*   Consistency: Use identical wording across all tools.  
      
    
*   Logging: Record timestamps, latency, and sanitized outputs (no personal data).  
      
    

## Observations (to discuss later)

*   Accuracy: Was the output mathematically correct?  
      
    
*   Step-level guidance: Did it give a useful “next step”?  
      
    
*   Reliability: Was the format consistent? Any digressions?  
      
    
*   User Experience: Was the answer clear, short, and actionable?  
      
    
*   Failure cases: Did hallucinations occur? Did the tool agree with a wrong answer (sycophancy)?  
      
    

AI Use and Disclosure

In preparing the Prompting Protocol and validation plan, I made use of ChatGPT (OpenAI GPT-5, 2025) for the following:

Drafting task descriptions and example prompts for the three scenarios (homework help, item generation, step fix).

Suggesting a standardized protocol structure to ensure consistency across tools.

All AI-generated content was critically reviewed, edited, and adapted by human team members before inclusion.**
