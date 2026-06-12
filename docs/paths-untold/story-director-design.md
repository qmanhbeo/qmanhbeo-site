# Paths Untold Story Director Design

## 1. Why one global tension number failed

A single campaign tension value makes every scene compete for the same dramatic
slot. It can raise urgency, but it cannot say which problem is getting worse,
which problem is quietly improving, or whether the player is finishing a local
thread while the larger threat remains alive.

That model also makes pacing brittle. If the global value is high, every scene
wants to escalate. If it is low, the story can lose all forward pressure. The
director prototype replaces that one number with per-thread pressure, progress,
scope, and beat selection.

## 2. Four separate ideas: scope, pressure, progress, beat

Scope is the maximum narrative scale of a thread. A personal secret, a village
fire, and a world-ending curse are not interchangeable, even if all three are
urgent.

Pressure is danger or urgency. It answers: how hot is this thread right now?

Progress is investigation, leverage, or completion. It answers: how close is the
player to resolving this thread?

Beat is the scene function. The current v1 beat set is `introduce`, `escalate`,
`hold`, `partial_release`, `resolve`, and `aftermath`.

Keeping these separate lets a scene reduce pressure while increasing progress,
or escalate pressure without prematurely resolving the problem.

## 3. Campaign design vs. runtime director

The top-level campaign fields define meaning and identity:

- campaign version
- premise, core question, and main objective
- optional campaign-wide forbidden reveals
- stakes ceiling
- main threat ID

Threads define campaign problems and objectives:

- thread hierarchy
- labels, scopes, objectives, and descriptive resolution conditions
- initial status, pressure, and progress

The runtime director is live pacing and focus state:

- current turn
- authoritative numeric RNG state
- active thread
- pending aftermath thread
- thread statuses, pressure, progress, and momentum
- recent beat history

The design is validated but not mutated. Planning reads the design and runtime
state, then produces a complete scene plan. Committing applies that plan.

The campaign-level `premise`, `coreQuestion`, and `mainObjective` fields are
static identity fields. They are not pressure or progress signals. They are
intended to eventually replace the campaign-identity portion of the older
blueprint data while leaving runtime pacing to the director.

## 4. Beat drawn before magnitude

The director first decides the kind of scene, then draws the amount of pressure
and progress movement. This matters because `escalate` and `partial_release`
have different pressure directions but both can move progress forward.

Planning stores every random transition value:

- focus thread
- beat
- modifier
- pressure delta
- progress delta
- next pressure
- next progress
- next status
- RNG state after planning

`commitScenePlan()` does not draw randomness. This preserves two invariants:

- same state plus same plan gives the same committed result
- failed generation plus uncommitted plan means no state change and no RNG
  advancement

## 5. Parent/child thread hierarchy -> nested waves

The main threat acts as an umbrella. It remains visible, but unresolved children
receive enough focus to form their own waves.

The v1 focus formula is intentionally simple:

- active thread base weight is `pressure * 0.5`
- current active thread continuity bonus is `+20`
- neglect bonus is `+5` per unfocused turn, capped at `+30`
- seeded child of an active parent gets a base introduction chance of `10`
- parent with unresolved children has direct weight multiplied by `0.45`
- active or seeded child of an active parent gets `+15`

The result should be:

- main threat remains alive in the background
- subthreads receive enough focus to develop
- resolved subthreads return attention to the parent or another child

## 6. Validation gates

Randomness can propose a `resolve` beat, but the deterministic gates decide
whether it is allowed.

The v1 machine-checkable gates are only:

- known thread ID
- correct status
- progress threshold
- required child IDs resolved
- main-threat threshold

Free-text `resolutionConditions` are descriptive authoring notes in v1. They are
not programmatically enforced until converted into structured gates later.

Optional direct child threads are not resolution gates. The main threat can
resolve while an optional direct child remains active, as long as the main threat
has reached its progress threshold and every `requiredChildId` is resolved.

If `resolve` is drawn but invalid:

- pressure `>= 30` downgrades to `partial_release`
- pressure `< 30` downgrades to `hold`

The plan records reason codes such as `resolution_progress_too_low`,
`unresolved_required_child`, and `main_threat_not_earned`.

Campaign completion is not "every thread resolved." In v1 the campaign is
complete when the main threat has resolved and its final aftermath has been
delivered. Optional side threads may remain unresolved after campaign
completion.

Resolving the main threat queues one final aftermath. A valid player override
may defer that final aftermath, but it cannot replace or clear it. V1 has only
one queued aftermath slot; while final aftermath is pending, side-thread
aftermaths may be dropped so the campaign epilogue remains sticky. Once the
final aftermath is committed, the next plan returns a completion result without
consuming RNG.

## 7. Beat weight profiles

The prototype keeps two named beat tables:

- `original`: the agreed starter table with stronger early escalation and lower
  low-pressure resolution chance
- `currentTuned`: the first implemented table, retained for comparison rather
  than silently replacing the starter table

Simulation accepts a `beatWeightProfile` option so the two profiles can be
compared across many seeds before choosing a production default.

## 8. LLM sees direction text, not raw numbers

The LLM should receive human-readable scene direction rather than raw pressure
and progress values.

The translation layer turns a plan into guidance such as:

```text
Focus this scene on Missing Children, a local problem within the larger Village Curse.

Escalate the pressure with a visible consequence or tightening constraint, without resolving it.

Stay within the campaign's community-scale stakes ceiling.
Keep Village Curse unresolved in the background.
```

Forbidden reveals are appended when present. The goal is to steer the scene
without exposing the director's internal counters as prose.

## 9. Future integration into Scene Direction slot

The prototype is not wired into the live prompt path yet. A future integration
can use this branch:

```js
if (gameMemory.storyDirector) {
  // derive scene direction from the director plan
} else {
  // derive scene direction from the existing blueprint
}
```

That keeps the current blueprint scene-wave behavior intact until saves and
prompt contracts are ready for migration.

## 10. Migration strategy

1. Land the isolated director prototype, tests, simulation, and design notes.
2. Add a save-compatible `gameMemory.storyDirector` field behind a feature flag.
3. Derive player target thread inference from choices, objectives, and current
   scene tags.
4. Insert translated direction text into the existing Scene Direction slot.
5. Validate LLM proposals against the committed plan before applying deltas.
6. Add developer UI to inspect current thread pressure, progress, and pending
   aftermath.
7. Retire or narrow the old global tension behavior after replay testing.

## 11. What remains unimplemented

- live integration with `buildUnifiedPrompt.js` or `sceneDirection.js`
- LLM proposal validation against director plans
- player-target inference beyond explicit override
- save format migration
- UI inspection
- visual charts
- structured resolution conditions

## 12. Phase 2 matrix validation

The isolated director now has a fixture matrix for non-live validation. The
matrix covers single-thread, linear required-child, deep hierarchy, branching
optional-thread, personal relationship, and village-curse campaigns. It is still
prototype-only and uses the same public director API as the focused simulation.

The matrix reports completion rate and turn statistics, first resolution timing,
resolution-eligible delay, beat frequencies, focus share, first-focus and
resolution rates by thread, required-thread neglect gap, deterministic replay,
and invariant counters. It is intended to answer whether one director rule set
generalizes across structures before any shadow-mode or live integration work.
