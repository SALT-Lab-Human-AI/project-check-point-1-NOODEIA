# Research papers analysis 

## Agentic Workflow for Education: Concepts and Applications

### Citation and Link

@misc{jiang2025agenticworkfloweducationconcepts,

      title={Agentic Workflow for Education: Concepts and Applications}, 

      author={Yuan-Hao Jiang and Yijie Lu and Ling Dai and Jiatong Wang and Ruijia Li and Bo Jiang},

      year={2025},

      eprint={2509.01517},

      archivePrefix={arXiv},

      primaryClass={cs.CY},

      url={https://arxiv.org/abs/2509.01517},

}

[https://arxiv.org/abs/2509.01517](https://arxiv.org/abs/2509.01517)

### Summary

This paper criticizes the linear prompt to answer model in educational AI and introduces the Agentic Workflow for Education (AWE), which is a framework built on self-reflection, tool use, task planning, and multi-agent collaboration. The authors ground AWE in a von Neumann-style architecture, mapping computational components to educational functions like task decomposition and reflection. A case study on automated math test generation demonstrates that AWE can produce items comparable to real exam questions and superior to GPT-4 on metrics like option rationality, suggesting it can enhance instructional quality while reducing teacher workload.

### Key Insights

The paper redefines the term agentic as a paradigm shift toward a non-linear orchestration in which agents autonomously plan, utilize tools, and engage in self-critique, thereby transcending simplistic question and answer interactions.

It introduces the von Neumann-style Multi-Agent System (vN-MAS) as a powerful mental model for designing educational AI, mapping the processor to task decomposition, memory to reflection, the controller to planning, and I/O to tool calls.

The research provides evidence that a multi-agent with reflective loops can produce assessment items that are comparable to human-created ones and outperform single-model baselines on specific quality metrics.

### Critical Limitations and Risks

The primary limitation is the study's reliance on a single case study (math item generation) for evidence, with no validation of its impact on actual classroom learning outcomes or external replication.

A significant risk is the increased complexity and governance challenges of multi-agent, tool-calling systems. These architectures introduce higher costs and latency and expand the potential for privacy, safety, and control failures, which were not directly tested in the study.

### Application to Our Project

Inspired by the AWE framework, we will implement a four-agent micro-pipeline for problem-solving, question-writing, and explanation generation. This pipeline will explicitly separate tasks: one agent for planning, one for resource gathering from our knowledge graph, one for solving and self-checking, and a final one for explaining the solution and generating distractors. By adopting this multi-agent with division of labor, we aim to achieve an increase in accuracy and explanation quality while controlling for cost and speed.

  


  

## TutorGym: A Testbed for Evaluating AI Agents as Tutors and Students

### Citation and Link

@misc{weitekamp2025tutorgymtestbedevaluatingai,

      title={TutorGym: A Testbed for Evaluating AI Agents as Tutors and Students},

      author={Daniel Weitekamp and Momin N. Siddiqui and Christopher J. MacLellan},

      year={2025},

      eprint={2505.01563},

      archivePrefix={arXiv},

      primaryClass={cs.AI},

      url={https://arxiv.org/abs/2505.01563},

}

[https://arxiv.org/abs/2505.01563](https://arxiv.org/abs/2505.01563)

### Summary

This paper introduces TutorGym, which is a new platform for testing AI tutors by plugging them directly into real tutoring software. Instead of just checking the final answer, TutorGym evaluates how the AI performs at every single step of a problem. The initial results are surprising because today's large language models are actually pretty bad at tutoring. They are no better than random at spotting a student's mistake, and their hints for the next step are only right about half the time. Interestingly, when the AIs pretended to be students, they learned in a way that looked a lot like how humans learn.

### Key Insights

Focusing solely on “final answers” overestimates AI's practicality in teaching; step-by-step evaluation better reveals instructional shortcomings (error correction, next-step guidance, targeted prompts).

The current observation that “LLMs are unreliable as tutors but perform better as learners” offers valuable insight since teaching scenarios require greater caution when directly providing step-by-step guidance via LLM.

Integrating AI into authentic Intelligent Tutoring System interfaces (featuring buttons, drag-and-drop elements, widgets, etc.) better replicates classroom workflows than text-based Q&A. It is also more effectively to measure strategic diversity and adaptability.

### Critical Limitations and Risks

Current issues primarily stem from platform beta testing and initial experiments, falling short of external validation against real classroom learning outcomes. Hence, it may not represent the capabilities of all AI tutors.

Replicating this approach involves significant engineering hurdles because connecting multiple AI systems/interfaces to different ITS platforms requires additional design and monitoring for integration and governance costs (latency, privacy, security, controllability).

### Application to Our Project

This paper gives us a clear idea for how to test our own AI tutor. We're going to add a mini-test where we give our agent a problem that's halfway done and ask it to do two things: first, decide if the current step is right or wrong, and second, give a good hint for what to do next. This will help us make sure our tutor is actually helpful and doesn't just guess at the right answer.
