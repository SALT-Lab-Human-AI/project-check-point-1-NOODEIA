<div align="center">

<a name="readme-top"></a>

<!-- Project banner -->
<img width = "220px" alt = "AI Tutor Logo" src = "./inProgress/logo.png">

# ✨ **NOODEIA**  

**N**ode
**O**ptimized
**O**rchestration
**D**esign for 
**E**ducational 
**I**ntelligence 
**A**rchitecture

*Making learning addictive in the best possible way*

[![License](https://img.shields.io/badge/license-Apache_2.0-red?style=for-the-badge)](#) 
[![Made with Love](https://img.shields.io/badge/Made%20with-💙_for%20students-ff69b4?style=for-the-badge)](#)
[![Neo4j](https://img.shields.io/badge/Neo4j-4479A1?logo=neo4j&logoColor=white&style=for-the-badge)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=for-the-badge)](#)

</div>

---

## 📑 Table of Contents
1. [Problem Statement and Why It Matters](#-problem-statement-and-why-it-matters)  
2. [Target Users and Core Tasks](#-target-users-and-core-tasks)  
3. [Competitive Landscape and AI Limitations](#-competitive-landscape-and-ai-limitations)
4. [Literature Review](#-literature-review)
5. [Initial Concept and Value Proposition](#-initial-concept-and-value-proposition)  
6. [Frontend Application](#-frontend-application)
7. [Contributions](#-contributions)
8. [Quick Start](#-quick-start)  
9. [Feedback Overview](#-feedback-overview)
10. [Inspiration and Disclosures](#-inspiration-and-disclosures)
11. [License](#-license)  

---

## 🆘 Problem Statement and Why It Matters

American education is in trouble. When [less than half of kids can read at grade level,](https://caaspp-elpac.ets.org/caaspp/DashViewReportSB?ps=true&lstTestYear=2024&lstTestType=B&lstGroup=1&lstSubGroup=1&lstSchoolType=A&lstGrade=13&lstCounty=00&lstDistrict=00000&lstSchool=0000000) and even fewer can handle basic math, we have a serious problem. It's not just about test scores either. As a nation, there are over 400,000 teaching positions [either unfulfilled or employing teachers without full certifications.](https://learningpolicyinstitute.org/product/state-teacher-shortages-vacancy-resource-tool-2024)

Although places like [Two By Two Learning Center](https://www.twobytwolearningcenters.com) are doing incredible work to support kids after school, [over 60%](https://nces.ed.gov/surveys/spp/results.asp) of public schools nationally offer academically focused after-school programming. Kids are falling further behind, tutors are burning out, and everyone is frustrated. We desperately need tools that can exemplify the impact of the educators and help kids learn.

---

## 🎯 Target Users and Core Tasks

Our tool needs to work for four very different stakeholders, each with their own challenges. 

* **Middle school students** are old enough to use technology but still need guidance. They're mainly looking for homework help and confidence boosters, which an AI tutor can provide. 

* **High school students** are generally more knowledgeable than their younger peers, being able to ask more complex questions. An AI tutor for this student group will need to be engaging, responsive, and comprehensive. 

**Parents** pay for their child's education, even though it's possible that their children are cheating with AI. Parents want to see real progress and results, understand what their kids are learning, and be shown how an AI tool is actually helping their kid, rather than doing the student's work for them. 

**After-school staff** have a lot on their plate. They need a tool that will help efficiency and simplify their jobs. An AI tutoring tool should help staff track individual student progress, communicate with parents, and give in-depth reports of what was learned each session. An AI may even be able to help create practice lessons and/or quizzes.

| 👥 **User** | 🏆 **Primary Goal** | 🔧 **What We Provide** |
|-------------|--------------------|------------------------|
| **Middle schoolers** | Homework help, improving confidence | Socratic hints and Streak bonuses |
| **High schoolers** | Engaging learning | Challenge modes with boss battles |
| **Parents** | Demonstrate real progress | Weekly achievement reports |
| **Afterschool staff** | Easier tutoring & tracking | Dashboards and auto-grading |

---

## 🏁 Competitive Landscape and AI Limitations

Khanmigo is a $4-per-month GPT-4 tutoring tool with content integrated from Khan Academy. While it fits in classroom settings, it has limited cross-platform usability and lacks long-term personalization. 

Meanwhile, general large language model chat tutors (ChatGPT, Gemini) can quickly and somewhat accurately explain answers, but struggle with step-by-step instructions. They fail to identify errors, provide follow-up guidance, and may even agree with students' incorrect answers.

Duolingo does a good job at motivating their users through fun games and a leveling system, but its core focus is on language learning, not math. Duolingo has not been adapted for math tutoring. It also lacks knowledge graphs and verification step-checking. 

Lastly, Perplexity is good at citing sources, but it's not a true tutor: it doesn't have a student model or provide step-by-step guidance.

## 📚 Literature Review Highlights

### Qiran Hu

[AI-Powered Math Tutoring Platform Research](https://arxiv.org/abs/2507.12484)

Chudziak, J. A., & Kostka, A. (2025). AI-Powered Math Tutoring: Platform for Personalized and Adaptive Education. arXiv [Cs.AI]. Retrieved from http://arxiv.org/abs/2507.12484

- This research addresses a critical gap in current AI tutoring systems where the AI systems tend to provide direct answers rather than showing step by step solutions. With dual memory architecture, this sophisticated approach provides both strategically informed guidance based on historical patterns and detailed responsive support based on context.

- By implementing a hybrid memory architecture, the knowledge graph could serve as the long term memory component where each concept node has specific attributes such as historical error patterns and identified misconceptions. Since graph relationships naturally represents prerequisite chains and conceptual dependencies, this enables sophisticated reasoning about learning paths.

### Tony Yu

[MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)

Packer, C., Wooders, S., Lin, K., Fang, V., Patil, S. G., Stoica, I., & Gonzalez, J. E. (2024). MemGPT: Towards LLMs as Operating Systems. arXiv [Cs.AI]. Retrieved from http://arxiv.org/abs/2310.08560

- The paper tackles LLMs’ short memory by adding an OS-style, tiered memory: a small main context (system rules, working pad, FIFO queue) plus external recall and archival stores, managed by a queue manager and function executor that move/condense information via function calls and summaries.

- Use Archival as a compact student profile while keeping full transcripts in Recall; have the tutor auto-summarize to Archival when memory pressure warnings appear and reload from these notes at the start of each session.


### Ryan Pearlman

[Generative AI Can Harm Learning](http://dx.doi.org/10.2139/ssrn.4895486)

Bastani, Hamsa and Bastani, Osbert and Sungu, Alp and Ge, Haosen and Kabakcı, Özge and Mariman, Rei, Generative AI Can Harm Learning (July 15, 2024). The Wharton School Research Paper. http://dx.doi.org/10.2139/ssrn.4895486 

- Researchers who put an AI, an AI tutor with special prompts, and no AIs into three math classrooms and compared test results to each other. 

- The results show students learned much better with a tutor who guides them instead of giving the answers, but students without a special AI tutor performed the same on standardized tests than ones with the specialized tutor. We will make sure that our AI tutor does not give answers away as that seems to make students use the AI as a crutch and perform worse overall.

### Rosie Xu

[Agentic Workflow for Education: Concepts and Applications](https://arxiv.org/abs/2509.01517)

Jiang, Y.-H., Lu, Y., Dai, L., Wang, J., Li, R., & Jiang, B. (2025). Agentic Workflow for Education: Concepts and Applications. arXiv [Cs.CY]. Retrieved from http://arxiv.org/abs/2509.01517

- The paper redefines agentic AI as something beyond simple Q&A interactions. It is a fundamental shift to a nonlinear cooperative systems where agents plan, use tools, and self-critique.

- By adopting this multi-agent with division of labor, we aim to implement a muti-agent system for problem solving, question writing, and explanation generation and we hope to achieve an increase in accuracy and explanation quality.

## 🚀 Initial Concept and Value Proposition

### Core Concept Overview

The personalized AI tutor represents a fundamental reimagining of educational technology through the integration of orchestrated multi-agent systems with memory-enhanced graph retrieval augmented generation . This system transcends traditional digital learning tools by creating an adaptive educational companion that maintains persistent awareness of individual learning patterns, dynamically adjusts teaching strategies based on accumulated experience, and delivers consistently high-quality educational support across diverse subject domains. The platform operates as an intelligent educational ecosystem rather than a static question-answering service, fundamentally transforming how students engage with complex learning materials.

### Primary Value Proposition

The primary value proposition emerges from the system's ability to provide genuinely personalized education at scale and maintaining the pedagogical sophistication typically associated with expert human tutors. Unlike conventional educational software that delivers uniform content regardless of individual needs, this system creates unique learning pathways for each student based on their specific knowledge gaps. Through its sophisticated memory architecture and continuous adaptation mechanisms, the platform delivers educational experiences that evolve with each student's progress, creating compound improvements in learning efficiency over time. This translates directly into reduced time-to-mastery for complex subjects and improved retention rates for learned material.

### Proposed Muti-Agent Workflow

This is our proposed muti-agent workflow 

<img width = "850px" alt = "Proposed workflow" src = "./InProgress/workflow.png">

#### Workflow Overview

This enhanced muti-agent workflow provides several advantages over simpler tutoring systems. The multi-agent approach allows for specialized agent to assist students with specific needs. The memory system enables personalized responses that fit into individual learning patterns. The comprehensive evaluation framework ensures high quality outputs, which significantly reduces the hallucinations. With the integration of structured knowledge graphs, this muti-agent workflow creates a personalized AI tutoring platform.

### Proposed MEGRAG Architecture

**M**emory
**E**nhanced
**G**raph
**R**etrieval
**A**ugmented
**G**eneration

This is our proposed MEGRAG architecture

$$\boxed{\mathrm{Score_{memory}} = S(1 - r_{\mathrm{semantic}})^{t_{\mathrm{semantic}}} + E(1 - r_{\mathrm{episodic}})^{t_{\mathrm{episodic}}} + P(1 - r_{\mathrm{procedural}})^{t_{\mathrm{procedural}}}}$$

where $S$ is the semantic memory, $r_{\text{semantic}}$ is the decay rate for semantic memory, $t_{\text{semantic}}$ is the hours passed since the semantic memory in the retriever was last accessed rather than created, $E$ is the episodic memory, $r_{\text{episodic}}$ is the decay rate for episodic memory, $t_{\text{episodic}}$ is the hours passed since the episodic memory in the retriever was last accessed rather than created, $P$ is procedural memory, $r_{\text{procedural}}$ is the decay rate for procedural memory, and $t_{\text{procedural}}$ is the hours passed since the procedural memory in the retriever was last accessed rather than created.

| Memory Type | What is Stored | Human Example              | Agent Example       |
| ----------- | -------------- | -------------------------- | ------------------- |
| Semantic    | Facts          | Things I learned in school | Facts about a user  |
| Episodic    | Experiences    | Things I did               | Past agent actions  |
| Procedural  | Instructions   | Instincts or motor skills  | Agent system prompt |

#### Architecture Overview

The proposed scoring function contains three types of memory, which are semantic, episodic, and procedural. Similar to human memory system, each memory has its own exponential time decay rate. By assigning a faster decay to episodic memory with slower decays to semantic and procedural memory prioritizes recent student struggles without rapidly discarding current knowledge, which creates more personalized RAG pipelines.

---

## 🤝 Team Contributions

### Qiran Hu

Completed the following tasks

- 4 research papers and reflections
- Github README page
- Open Issues for milestones; assign owners; use Projects/Boards 

Upcoming tasks

- Developing the new architecture for the AI tutor
- Designing the muti-agent workflow and developing graph-based structure for better retrieval system
- Maintaining the Github page and fixing minor issues

### Tony Yu

Completed the following tasks

- 2 research papers and reflections
- Your proposed approach and why it will improve on prior art
- Initial concept and value proposition

Upcoming tasks

- Creating a new memory framework for the AI tutor

### Ryan Pearlman

Completed the following tasks

- 2 research papers and reflections
- Problem statement and why it matters
- Target users and core tasks
- Initial risks & mitigation (privacy, bias, safety, reliability)

Upcoming tasks

- Enhancing the design and workflow of app in coming checkpoints

### Rosie Xu

Completed the following tasks

- 2 research papers and reflections
- Competitive landscape: existing systems/tools and their shortcomings
- Plan for Checkpoint 2 validation via prompting (see CP2)

Upcoming tasks

- Analyzing different existing tools and their limitations

---

### Quick Start

**📚 For detailed setup instructions, see [`setup/README.rst`](setup/README.rst)**

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Copy the example environment file and add your credentials:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual credentials:
```bash
# Supabase (Authentication)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Neo4j AuraDB (Database)
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password

# Google Gemini AI (Required for AI features)
GEMINI_API_KEY=your-gemini-api-key

# Pusher (Optional - for real-time features)
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

Get your Gemini API key from: https://aistudio.google.com/app/apikey

4. Initialize Neo4j database:
```bash
npm run setup-neo4j
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:3000`

### Tech Stack
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React version
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI components
- **Neo4j AuraDB** - Graph database for data storage
- **Supabase** - Authentication service
- **Lucide Icons** - Beautiful & consistent icons

### Troubleshooting

If you encounter dependency conflicts during installation:
- Use `npm install --legacy-peer-deps` to resolve React 19 compatibility issues
- Some packages may not officially support React 19 yet, but work fine in practice

### Project Structure
```
frontend/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   └── ...                # Feature components
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── styles/                # Global styles
└── public/                # Static assets
```

### 🚀 Vercel Deployment (Recommended)

The frontend is configured for deployment to Vercel with zero configuration.

#### Quick Setup:
1. **Import to Vercel:**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Import this repository
   - Set root directory to `frontend`

2. **Add Environment Variables:**
   - Add all 5 `NEXT_PUBLIC_*` variables from `.env.local`
   - Deploy!

3. **Your app will be live at:** `https://your-project.vercel.app`

**📚 Detailed Guide:** See [`setup/VERCEL_DEPLOYMENT.md`](setup/VERCEL_DEPLOYMENT.md) for complete instructions.

#### Automatic Deployments:
- **Every push to main** → Production deployment
- **Every push to branches** → Preview deployment
- **Every pull request** → Preview URL in PR comments

---

## Feedback Log

Check out [`feedback/README.rst`](feedback/README.rst) to see how we address each issue. Please provide us more feedback

---

## Inspiration and Disclosures

The logo image is inspired by [FREEP!K](https://www.freepik.com/premium-vector/tree-with-lines-dots-vector-design-ai-generate_328598955.htm) and referenced by similar generated images. 

We utilized Claude Code to temporalily log and document the set up steps during the developing phase and we will be modifying and editing them in the later phases.

We also incorporated AI generated images for demonstration purpose for our proposed features.


We draft task descriptions and example prompts for the three scenarios and ask AI to suggest a standardized protocol structure to ensure consistency across tools.  

All AI-generated content was **critically reviewed, edited, and adapted by human team members** before inclusion.  

## 📝 License

Distributed under the **Apache 2.0** License. 

<div align="right">

[⬆️ Back to top](#readme-top)

</div>
