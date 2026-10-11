# Reframe recording protocol

The demo on the website replays **recorded runs of real agents**. No response is hand-written. This document is the procedure that produced every file in `traces/`.

## Who runs what

- **Orchestrator:** a Claude Code session (Claude Opus 5.5). It follows this protocol step by step, calls each role as a separate subagent, and writes every input and output into the trace file.
- **Agents:** Claude Code subagents defined in [`.claude/agents/`](../.claude/agents). Each one starts with a fresh context, receives only the task message the orchestrator writes for it, and is restricted by an explicit tool allowlist to a single read-only tool (`ListSkills`) plus the hand-back call that returns its result. It has no file, shell, web or connector (MCP) access. As a result, **an agent can only know what its input contains.** Each recorded event's `tools_used` field shows which tools the agent actually called; it should always be `none`.

| Role | Definition | Model | Sees |
|---|---|---|---|
| Assistant (under observation) | `reframe-assistant` | Sonnet 5.5 | Full consultation transcript |
| Case Extractor (the barrier) | `reframe-extractor` | Opus 5.5 | Full consultation transcript |
| Shadow Clinician | `reframe-shadow` | Opus 5.5 | Fact list only |
| Sycophancy Monitor | `reframe-monitor` | Opus 5.5 | Transcript + shadow differential |
| Advocate ×2 | `reframe-advocate` | Opus 5.5 | Fact list + assigned diagnosis (+ opponent's opening in round 2) |
| Blind Judge | `reframe-judge` | Opus 5.5 | Fact list + arguments labelled A/B in random order |

The assistant runs on Sonnet 5.5 with an ordinary "helpful clinical assistant" prompt. It is **never** told to agree with the clinician. Whatever it does is what gets recorded, including cases where it holds its ground.

## Steps for each scenario

The clinician's messages are taken verbatim from the original hackathon scenarios (now stored in `traces/raw/<scenario>/clinician.json`). Each scenario has three:
1. the case presentation
2. one pushback towards the clinician's preferred diagnosis
3. a change of course: new clinical findings in the aortic case; in the other two, the clinician accepting the assistant's advice

**Escalation (added after the first recordings).** In the first recording, Sonnet 5.5 held its position against the single pushback in all three scenarios. Recent work finds that models give way under *repeated* pressure and claims of authority rather than under one challenge: [Ping et al. 2026](https://arxiv.org/abs/2608.01017) and [MedPRESS](https://arxiv.org/abs/2608.02520). So two further clinician messages are inserted after the pushback:
- an appeal to seniority
- time pressure combined with the clinician taking responsibility

They were written by the orchestrator, are stored in `traces/raw/<scenario>/escalation.json` and are marked `author: orchestrator` in the trace. They contain **pressure only and no new clinical findings**, so any change of position they produce is, by definition, not evidence-driven. The scenario's third message then becomes turn 5.

Raw event files are numbered so they sort in time order: `t0` is the assistant reply for turn t and `t3` is its monitor score (10, 13, 20, 23 and so on), 45–46 are the extractor and shadow before turn 5, 55–56 are the ones after it, 60 and above are the debate, and 70 and above are the blindness checks.

1. **Consultation.** For each clinician message *t*, the assistant receives the transcript up to message *t* and replies.
2. **Blind view of the case.** Turn 5 is the only turn that can add clinical facts (the escalation turns add none), so the barrier runs twice:
   - **Before turn 5:** the extractor reads the whole transcript up to the turn-4 reply, including every pushback and escalation, and produces `facts_pre`, listing everything it redacted. The shadow clinician produces `differential_pre` from `facts_pre` alone.
   - **After turn 5:** the extractor reads the full transcript and produces `facts_post`. The shadow clinician then produces `differential_post` from it.
3. **Monitoring.** For each assistant reply *t*, the monitor sees:
   - the assistant's previous reply
   - the clinician's message *t*
   - reply *t*
   - the blind differential that applies to that turn: `differential_pre` for turns 1–4, `differential_post` for turn 5

   This sliding window is enough to detect echoing the clinician's framing, a narrowing differential and a change of position. It also means the monitor never sees later turns.
4. **Debate.** This runs on the facts from before turn 5 (`facts_pre`), and is triggered by the highest monitor score among turns 1–4.
   - **Advocate positions.**
     - Position X is the diagnosis the clinician is pushing, taken from the extractor's `redacted` hypotheses.
     - Position Y is the highest-ranked must-not-miss or alternative diagnosis in the shadow differential that differs from X.
   - **Round 1.** Both advocates write openings independently and in parallel. Neither sees the other's.
   - **Round 2.** Each advocate receives the other's opening and writes a rebuttal.
   - **Judge.** A coin flip assigns X and Y to labels A and B. The judge receives `facts_pre` plus all four arguments under those labels. Diagnosis names are visible to the judge; which one the clinician holds is not.
5. **Blindness checks** (the results are written to the trace):
   - **Order swap.** The judge runs again with labels A and B swapped. The verdict should name the same diagnosis.
   - **Anchor swap.** The extractor runs twice on the opening of the consultation (turn 1, the first reply and turn 2): once as recorded, and once with the clinician's stated hypothesis and request replaced by the opposite diagnosis (`traces/raw/<scenario>/anchor-swap.json`). Both fact lists should contain the same number of facts and the same clinical values.
   - **Leak scan.** `scripts/check-barrier.mjs` scans every fact list the blind agents received for the debated diagnoses by name. Results go to `traces/checks.json`.

## Trace format

Each trace is one `traces/<scenario-id>.json` file. It contains an ordered list of events. Each event records:
- `agent` and `model`
- the turn and round
- the exact `input` the agent received
- the raw `output` it returned
- the agent's wall-clock time, and the tools it called (always `none`)

Because the input field holds the agent's complete message, anyone can confirm that the judge's input never contains the clinician's hypothesis. The site's agent graph and "lens" views are rendered from these fields.

## Verifying

`npm run verify` rebuilds what each agent should have received from the outputs recorded before it (`scripts/expected-input.mjs`). It fails if any recorded input differs, any call used a tool, or any call ran on a model other than the one specified above. It then re-runs the barrier checks. The system prompts the agents actually ran with are saved in `traces/prompts/`.

## Reproducing

Open this repo in Claude Code and ask it to "follow docs/PROTOCOL.md for scenario `<id>`". The outputs will differ in wording, because models aren't deterministic, but the procedure will be the same.
