---
title: "LLM Agents"
date: 2024-06-24T00:50:28+05:30
draft: false
description: Create automated autonomous action chains 🛠️ using Large Language Models 🤖 
images:
 - /images/llm-agent.webp
---

![LLM as an agent.](/images/llm-agent.webp)

# Introduction

The core idea of agents is to use a language model to choose a sequence of actions. In chains, a sequence of actions is hardcoded (in code). In agents, a language model is used as a reasoning engine to determine which actions to take and in which order. Agents are also interchangeably called tool use and function calling in various contexts.

When writing this article, closed source & commercial LLM offerings demonstrate better ability in function calling. Anthropic Claude, ChatGPT 4, and ChatGPT 4o are some of the best models for building LLM agents.

# Why Use Agents?

* **Achieve Complex Tasks** – A multi-step agent can help you execute tasks combined with the intelligence of an LLM acting as an orchestrator.

* **Domain Specific Use-Cases** - LLM's input can be augmented with domain-specific inputs in a self-iterative process to get the desired output with the latest information.

* **Fine-grained control on moving parts of LLM inputs** – Manual Validation and Safety Hatches in Agent execution steps enable better control over LLM output.

# Usecase

## Function Calling

Function calling is a powerful technique that allows you to extend the capabilities of a language model like ChatGPT or Llama 3 by integrating external functions or APIs. It enables the model to perform tasks or access information that it wouldn’t be able to do on its own.

## Demo: Mine Wikipedia

In the following demo, we use Wikipedia APIs to create tools that can search, retrieve, and parse. Information on how to use these functions will be provided to the LLM in the prompt. the prompt is as follows:

```
You are an AI with access to the latest information via tools. You have access to the following tools:
- wikipedia_summary
 - help: get a summary of various Wikipedia pages (top 3) based on the search term.
 - usage: wikipedia_summary('search term')
- wikipedia_page_sections
 - help: get all the sections on a Wikipedia page
 - usage: wikipedia_page('title of the page')
- wikipedia_section
 - help: get content of a specific section in a Wikipedia page. this will contain the content of the requested section and all subsections under it.
 - usage: wikipedia_section('title of the page', 'name of the section')

current system time (UTC): {datetime.datetime.now(datetime.UTC).now()}
based on the given question, call the appropriate tool with relevant arguments. The result will be provided back to you, You can call the tool multiple times until you have relevant information to form a final answer. Only answer the question from context.
use wikipedia_summary tool to get a summary of Wiki pages. of these, use wikipedia_page_sections tool to get page sections by providing the page title as arg. use wikipedia_section to extract content from the required section. 

Follow the guidelines carefully:
- Your output must always contain a function call unless it's your final answer.
- a call to a function must be enclosed within backticks.
- DO NOT search based on your own knowledge cutoff timeline. always assume tools will provide the latest information.
```

we then call the LLM iteratively to arrive at a final answer to present using the above-defined tools to call APIs. 

[Complete Jupyter Notebook](https://gist.github.com/jkotra/a249e04f8896badf8c53c2840527bc6b)

# Risks & Limitations: LLM Agents in Production 
 
* **Hallucination**: LLM is prone to hallucinations. In the context of agents, this could mean calling functions repeatedly or without correct arguments.  

* **Accuracy**: Responses from agents are considered better than zero-shot prompting responses. However, some responses cannot be automatically proven to be correct. Such responses, when provided as input to an intermediate step may result in inaccurate conclusions.  

**Finetune Tradeoff**: LLM's models which are finetuned for function calling lose capability in other skills. Orchestrating between two models is a suggested middle-ground approach to avoid loss of quality in inference. 
 
# Conclusion 
 
Agents can be thought of as a superpower to LLM allowing them to do actions that are otherwise not possible in a fundamental transformer architecture of token-in - token-out. While agents can help us automate many tasks which had earlier required human interaction or supervision it is important to note that LLMs are still prone to hallucination which can potentially derail the behavior of agents.