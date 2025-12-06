# Research papers analysis

## MemGPT: Towards LLMs as Operating Systems

@misc{packer2024memgptllmsoperatingsystems,

      title={MemGPT: Towards LLMs as Operating Systems}, 

      author={Charles Packer and Sarah Wooders and Kevin Lin and Vivian Fang and Shishir G. Patil and Ion Stoica and Joseph E. Gonzalez},

      year={2024},

      eprint={2310.08560},

      archivePrefix={arXiv},

      primaryClass={cs.AI},

      url={https://arxiv.org/abs/2310.08560}, 

}

[https://arxiv.org/abs/2310.08560](https://arxiv.org/abs/2310.08560)

### Summary
MemGPT tackles the core problem that LLMs have small context windows and forget long chats or long documents. It adds an OS-style memory system: a tight **main context** (system rules, a small working pad, and a FIFO history) plus **external stores** for full logs (recall) and distilled notes (archival), all controlled by functions the model can call itself. 

With a **queue manager** and **function executor**, the model moves info in/out of context, writes summaries when space is low, and retrieves past details on demand. In tests, MemGPT boosted long-chat consistency versus the same base models without it, and it handled multi-document QA by paging through many sources. 

### Insights

1. Separating **recall** (raw history) from **archival** (short notes) lets the model keep both precision and brevity. 
2. “Memory pressure” warnings prompt the model to compress recent context on its own, not just rely on a fixed summary. 
3. Function chaining (requesting immediate follow-ups) is key to multi-step retrieval across many documents. 

### Limitations/Risks

- If the base model is weak at tool use, performance drops (e.g., fewer lookups, stopping early). 
- Bad summaries or wrong saves to archival can “lock in” mistakes later.

### Idea for Our Project

Use Archival as the student’s **profile + learning log**: store concise facts (courses, goals, common errors, preferred examples), last plan/next step, and mastered skills; keep the full session transcripts in Recall; on each new session, the tutor loads the Archival note to personalize hints, and when “memory pressure” hits, it writes a fresh progress summary back to Archival.



## REACT: SYNERGIZING REASONING AND ACTING IN LANGUAGE MODELS

@misc{yao2023reactsynergizingreasoningacting,

      title={ReAct: Synergizing Reasoning and Acting in Language Models}, 

      author={Shunyu Yao and Jeffrey Zhao and Dian Yu and Nan Du and Izhak Shafran and Karthik Narasimhan and Yuan Cao},

      year={2023},

      eprint={2210.03629},

      archivePrefix={arXiv},

      primaryClass={cs.CL},

      url={https://arxiv.org/abs/2210.03629}, 

}

[https://arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629)

### Summary
ReAct tackles a clear gap: LLMs can “think” (chain-of-thought) or “act” (use tools), but doing them separately leads to hallucinations or poor decisions. 

The method makes the model alternate **Thought to Action to Observation** so it plans in words, then takes steps (e.g., Wikipedia search/lookup) and updates its plan with what it finds.

On knowledge tasks (HotpotQA, FEVER) this cuts hallucinations; mixing ReAct with self-consistent CoT gives the best prompt results. 

On interactive tasks (ALFWorld, WebShop), a few well-placed thoughts beat act-only and imitation/RL baselines, and the step-by-step traces are easy to inspect. Small models fine-tuned on ReAct trajectories can even surpass larger models that are only prompted. 

### Insights

1. Interleaving thinking with actions makes the model both plan and improve its claims, which reduces hallucination and helps pick the next useful step.
2. The strongest setup combines internal reasoning (CoT) with external retrieval (ReAct) and switches when confidence is low.
3. We don’t need thoughts at every step—sparse, well-timed thoughts are enough to guide long tasks.

### Limitations/Risks

1. ReAct can get stuck repeating steps or fail if the retrieval/search is weak, which worsens reasoning.
2. When connected to real systems, letting an LLM act can pose safety/privacy risks unless actions and domains are tightly sandboxed.

### Idea for Our Project

Build a “Explain-and-Act Tutor Loop”: for each student question, the tutor writes a short plan (Thought), then acts by getting textbook passages, running a simple tool (definition lookup, calculator), and returns an answer with its steps shown; if uncertainty is high, it falls back to CoT-SC and flags “I’m not sure—here’s what I’d check next,” turning its reasoning + sources into teachable. 