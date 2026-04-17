<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle 1 -> I. Decimal Precision For Money
- Template principle 2 -> II. Deterministic Financial Logic
- Template principle 3 -> III. Mobile-First Experience
- Template principle 4 -> IV. Stateless REST APIs
- Template principle 5 -> V. Mandatory Unit Test Coverage
Added sections:
- Performance Standards
- Delivery Workflow
Removed sections:
- None
Templates requiring updates:
- ✅ updated .specify/templates/constitution-template.md
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
- ✅ updated .opencode/command/speckit.plan.md
- ✅ updated .opencode/command/speckit.specify.md
- ✅ updated .opencode/command/speckit.tasks.md
Follow-up TODOs:
- TODO(RATIFICATION_DATE): original adoption date is unknown in repository history
-->

# El7esba Constitution

## Core Principles

### I. Decimal Precision For Money
All financial calculations MUST use high-precision decimal arithmetic and MUST
NOT use binary floating-point types for persisted, displayed, or compared
monetary values. Currency amounts, rates, fees, taxes, and derived totals MUST
preserve declared precision and rounding rules at every boundary.

Rationale: monetary drift from floating-point arithmetic is unacceptable and can
create user-visible defects, reconciliation failures, and audit risk.

### II. Deterministic Financial Logic
All monetary operations MUST be deterministic, side-effect controlled, and
directly testable in isolation. The same inputs, configuration, ordering rules,
and rounding policy MUST always produce the same outputs regardless of runtime,
timezone, locale, or request repetition.

Rationale: financial systems must be reproducible for debugging, auditability,
and reliable regression testing.

### III. Mobile-First Experience
Every user-facing workflow MUST be designed mobile-first before desktop
enhancement. Specifications, layouts, acceptance criteria, and implementation
plans MUST define the smallest supported viewport first, then scale upward
without hiding required functionality.

Rationale: mobile usage is a primary product path, and designing from the most
constrained surface prevents inaccessible or incomplete experiences.

### IV. Stateless REST APIs
All network APIs MUST be RESTful and stateless. Each request MUST contain all
context required for authorization and processing, resources MUST be modeled
explicitly, and server-side session affinity MUST NOT be required for correct
behavior.

Rationale: stateless REST interfaces simplify scaling, caching, testing, and
cross-client interoperability.

### V. Mandatory Unit Test Coverage
Every feature, rule, and bug fix MUST include unit tests that cover the normal
path, relevant edge cases, and failure scenarios. Work is not complete until the
tests pass and clearly exercise the behavior introduced or changed.

Rationale: mandatory unit coverage keeps financial logic safe to change and
makes deterministic behavior continuously enforceable.

## Performance Standards

Financial calculation paths MUST run in O(n log n) time or better with respect
to the number of input records they process. Any design that exceeds this bound
MUST be rejected unless the constitution is amended first. Plans and reviews
MUST call out the dominant operation, expected input size, and how the bound is
maintained.

## Delivery Workflow

Specifications MUST include explicit requirements for decimal arithmetic,
deterministic behavior, mobile-first UX, REST statelessness, unit test coverage,
and the O(n log n) performance ceiling when applicable. Implementation plans
MUST fail their Constitution Check if any of these constraints are missing or
contradicted. Task breakdowns MUST include the unit tests and validation work
needed to prove compliance.

## Governance

This constitution supersedes conflicting local conventions, examples, and
generated defaults. Every specification, plan, task list, implementation, and
review MUST verify compliance with all principles and sections in this document.

Amendments MUST be documented in this file, include a Sync Impact Report, and
apply semantic versioning to the constitution itself: MAJOR for incompatible
principle changes or removals, MINOR for new principles or materially expanded
governance, and PATCH for clarifications that do not change intent.

Compliance reviews MUST reject work that uses floating-point money logic, omits
unit tests, ships non-mobile-first UX, introduces non-RESTful or stateful APIs,
or lacks evidence that calculation performance stays within O(n log n).

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date is unknown in repository history | **Last Amended**: 2026-04-16
