---
title: "Shipped or hype? I built an AI news email that can't make up links"
description: "I wanted to know which AI podcast claims are real. I built a weekly email where the model never writes a link. How it works, what broke, what it costs."
date: "2026-10-27"
cluster: data-pipelines
stack: [Python, OpenRouter, Claude Sonnet 5.5, Postgres, systemd]
tldr: "I built a weekly AI news email that reads 12 feeds and checks podcast claims against real sources. The model only picks item numbers. Python adds every link, and a quote must really be in the transcript. One run costs $0.24."
hero:
  value: "$0.24"
  label: "per weekly run, measured"
  source: "https://github.com/lubobali/shipped-or-hype-ai#cost"
repo: "https://github.com/lubobali/shipped-or-hype-ai"
sources:
  - title: "OpenRouter: structured outputs (strict JSON schema)"
    url: "https://openrouter.ai/docs/features/structured-outputs"
  - title: "Claude Sonnet 5.5 on OpenRouter (pricing)"
    url: "https://openrouter.ai/anthropic/claude-sonnet-5.5"
  - title: "defusedxml: safe XML parsing in Python"
    url: "https://github.com/tiran/defusedxml"
  - title: "Simon Willison's weblog (one of the 12 feeds)"
    url: "https://simonwillison.net/"
  - title: "Moonshots with Peter Diamandis (the podcast it checks)"
    url: "https://www.diamandis.com/podcast"
---

```stats
- { value: "12", label: "feeds read" }
- { value: "80", label: "items this week" }
- { value: "4", label: "podcast claims checked" }
- { value: "83", label: "tests" }
```

## Why I built it

Every week I listen to the Moonshots podcast. Great show, but full of big claims: AGI is here, compute shortage in 3 years, agents switching off their own safety monitors.

I want to stay ahead in AI, and I build real things for clients. So I need to know: **what really shipped, and what is only talk?**

Asking an LLM to summarize the news is easy. But LLMs make up links and quotes, and one fake link kills the trust in everything else.

## How it works

```flow
- { label: "12 feeds", detail: "release notes, builders, papers, podcasts" }
- { label: "80 items", detail: "last 7 days, nothing already sent" }
- { label: "AI picks numbers", detail: "no URLs in, item numbers out" }
- { label: "Python adds links", detail: "an unknown number is dropped" }
- { label: "Sunday email", detail: "8 PM Chicago, only to me" }
```

```callout
{ title: "The one rule", text: "The model never writes a link or a quote. Python does." }
```

## How it stays honest

```cards
- { title: "Links", text: "The model sees numbered items with no URLs and answers in strict JSON with numbers only. Python attaches the real link. A URL the model writes anyway is deleted." }
- { title: "Quotes", text: "The model picks podcast claims with the exact words. If the quote is not really in the transcript, the claim is thrown away." }
- { title: "Labels", text: "Backed only when a real source confirms the names, numbers and dates. A podcast can never back another podcast." }
- { title: "Failure", text: "Model down or the key at its limit? I still get the email, with links only and the reason on top." }
```

## A real email

The transcripts come from my publisher app (this week: 117,700 and 142,617 characters). Two claims from one real run, word for word:

```claims
- label: "UNVERIFIED"
  claim: "Chamath says AGI has already been achieved, but it can't diffuse because infrastructure build-out, not technology, is the bottleneck."
  quote: "I do think that we have achieved AGI. It cannot diffuse. And the reason it cannot diffuse has nothing to do with the technology. It has everything to do with the build up."
  verdict: "No item tests the AGI or diffusion claim. Anthropic S-1 coverage shows fast revenue growth but says nothing about infrastructure as the bottleneck."
- label: "UNVERIFIED"
  claim: "OpenAI reported that its coding agents disabled safety monitors in two internal incidents and lied about it, with no satisfying explanation."
  quote: "This month, in two internal incidents, its coding agents switched off its monitors. I'll say it again, it switched off its monitors."
  verdict: "No item reports these incidents. OpenAI's post on securing its training environment covers stronger containment, but says nothing about agents switching off monitors."
```

## What broke

```timeline
- { time: "Bug 1", title: "BACKED was a lie", text: "Evidence against a claim got the label BACKED. Fix: the model must say backs, partly or contradicts." }
- { time: "Bug 2", title: "Half true is not true", text: "A Linux kernel claim was BACKED, but the sources showed only the trend. Fix: a new PARTLY BACKED label." }
```

The tests didn't catch either one. Reading the real email did. For LLM work you need both.

## What it costs

```bars
title: "One real run, measured"
unit: "$"
rows:
  - { label: "Podcast episode 1 → claims", value: 0.096 }
  - { label: "Podcast episode 2 → claims", value: 0.080 }
  - { label: "The email", value: 0.061 }
note: "Total $0.24 per run. 97,925 tokens in, 4,030 out. The key has a $3 monthly limit."
```

## What's next

```cards
- { title: "Next", text: "Add a model leaderboard source, so model moves compare price and quality with real numbers." }
- { title: "For a client", text: "The pattern, not the email: when an LLM summarizes business documents, the model points to sources and code attaches them." }
```

The code is open on GitHub, MIT license. Change the feeds and the profile, and it is your own radar.
