# Bracket Logic Reference

## Overview

MyBracketly supports 7 tournament formats, ranging from simple single elimination to complex consolation (wrestling-style) brackets and hybrid round-robin-to-elimination formats. This document describes each format's rules, structure, and implementation details.

---

## Tournament Formats

### 1. Single Elimination

The simplest bracket format. One loss and you are out.

- **Seeding**: Standard tournament seeding pairs the strongest against the weakest (1 vs N, 2 vs N-1, etc.).
- **BYEs**: When the participant count is not a power of 2, remaining slots are filled with BYEs. BYE opponents auto-advance.
- **Round naming**: Round of X, Quarterfinals, Semifinals, Final.
- **Result**: Produces a champion and a runner-up.

### 2. Single Elimination + 3rd Place Match

Identical to single elimination with one addition:

- The two semifinal losers play a consolation match for 3rd and 4th place.
- This is the simplest option when you need champion, runner-up, and a 3rd-place finisher.
- No additional consolation rounds beyond that single match.

### 3. Consolation Bracket (Wrestling-Style)

This is the most complex format. It mirrors the structure used in folkstyle and freestyle wrestling tournaments.

#### Core Concept

- Losers from **every** winners bracket round drop into a parallel consolation bracket.
- This is **not** double elimination -- consolation participants do not play back into the main bracket.
- The goal is to determine fair placements from 3rd through 8th place.

#### The Key Principle

> "You should not be eliminated by someone who lost to a weaker opponent than yours."

This principle is why cross-bracketing exists. A participant who lost to the eventual champion deserves a fairer path through consolation than someone who lost to a first-round exit.

#### Consolation Round Structure

For a 16-participant bracket (4 winners rounds):

| Winners Round | What happens to losers |
|---|---|
| R1 (Round of 16) | Losers pair within their quadrant in Consolation R1 |
| QF (Quarterfinals) | Losers drop into Consolation R2, facing C-R1 winners |
| SF (Semifinals) | Losers drop into Consolation R4 (SF), facing C-R3 winners |
| Final | Loser = 2nd place |

Consolation rounds break down as follows:

- **C-R1 (Pairing)**: R1 losers play each other. Same-side pairing (adjacent matches).
- **C-R2 (Drop-in)**: QF losers face C-R1 winners. Cross-bracket may apply here.
- **C-R3 (Reduce)**: C-R2 winners play each other to reduce the field.
- **C-R4/SF (Drop-in)**: SF losers face C-R3 winners. Cross-bracket applies.
- **3rd Place Match**: C-R4 winners play for 3rd and 4th place.

#### Cross-Bracketing

Cross-bracketing controls where losers land when they drop from the winners bracket into the consolation bracket.

- **Without cross-bracket**: Losers drop into consolation on the **same side** they were on. Simple, but can cause early rematches between participants who already played each other.
- **With cross-bracket**: Losers cross to the **opposite side** of the consolation bracket.
  - Top-half losers face bottom-half consolation winners.
  - Bottom-half losers face top-half consolation winners.
  - Prevents rematches.
  - Ensures fairer placement paths.
  - Standard in wrestling (folkstyle, freestyle) tournaments.

Mapping illustration:

```
Without cross-bracket:         With cross-bracket:
Loser[0] -> Consolation[0]    Loser[0] -> Consolation[N-1]
Loser[1] -> Consolation[1]    Loser[1] -> Consolation[N-2]
Loser[2] -> Consolation[2]    Loser[2] -> Consolation[N-3]
```

#### Placement Matches

- **3rd/4th**: Always generated. This is the consolation bracket final.
- **5th/6th**: Available for 8+ participants. The losers of the consolation semifinals play each other.
- **7th/8th**: Available for 16+ participants. The losers from the round before the consolation semifinals play each other.
- The user selects placement depth at tournament creation: "Through 4th", "Through 6th", or "Through 8th".

#### Scaling

| Participants | Bracket Size | Winners Rounds | Consolation Rounds | Max Placements |
|---|---|---|---|---|
| 3-4 | 4 | 2 | 1 | 3rd/4th |
| 5-8 | 8 | 3 | 3 | 3rd-6th |
| 9-16 | 16 | 4 | 5 | 3rd-8th |
| 17-32 | 32 | 5 | 7 | 3rd-8th |
| 33-64 | 64 | 6 | 9 | 3rd-8th |

### 4. Double Elimination

Participants must lose **twice** to be eliminated.

- **Winners bracket**: Standard single-elimination bracket.
- **Losers bracket**: Participants who lose in the winners bracket drop here. Losers bracket rounds alternate between two types:
  - **Drop-in rounds**: Winners bracket losers enter the losers bracket.
  - **Reduce rounds**: Losers bracket participants play each other to reduce the field.
- **Grand Final**: The winners bracket champion faces the losers bracket champion.
- **Grand Final Reset**: If the winners bracket champion loses Grand Final 1, a reset match is played. The rationale is that the WB champion entered the grand final with 0 losses, and now both players are tied at 1 loss each, so a deciding match is required.

### 5. Round Robin

Every participant plays every other participant.

- **Scoring**:
  - Win = 3 points
  - Draw = 1 point
  - Loss = 0 points
- **Tiebreakers** (applied in order):
  1. Total points
  2. Point differential (points scored minus points conceded)
  3. Points for (total points scored)

### 6. Round Robin into Single Elimination

A two-phase format combining group play with a knockout bracket.

- **Group stage**: Full round robin among all participants.
- **Advancement**: The top N finishers advance to a single elimination playoff bracket.
- **Seeding**: Playoff seeding is determined by round robin standings.

### 7. Round Robin into Double Elimination

Same two-phase structure as above, but the playoff bracket uses double elimination rules.

- **Group stage**: Full round robin.
- **Advancement**: Top N finishers advance.
- **Playoff**: Double elimination bracket with losers bracket and grand final (including potential reset).

---

## Technical Reference

### Match Object Structure

```
{
  id: number,
  round: number,
  roundName: string,
  matchNum: number,
  bracket: 'winners' | 'consolation' | 'placement' | 'losers' | 'grand_final' | 'grand_final_reset',
  slot1: { name, seed, score },
  slot2: { name, seed, score },
  winner: string | null,
  nextMatchId: number | null,      // where the winner advances
  nextSlot: number | null,         // 1 or 2
  loserNextMatchId: number | null, // where the loser goes (consolation/losers bracket)
  isReset: boolean                 // true for grand final reset match only
}
```

### Seeding Algorithm

Standard tournament seeding ensures the strongest participants play the weakest in the first round, and that top seeds are placed on opposite sides of the bracket so they cannot meet until later rounds.

- **4-participant seed order**: `[1, 4, 2, 3]` producing matchups 1v4, 2v3
- **8-participant seed order**: `[1, 8, 4, 5, 2, 7, 3, 6]` producing matchups 1v8, 4v5, 2v7, 3v6
- **Pattern**: Recursive doubling. Each bracket size doubles the previous by interleaving mirrored seeds.

### BYE Handling

- When the participant count is not a power of 2, the remaining slots are filled with BYEs.
- BYEs auto-advance: the real participant wins the match automatically.
- BYE matches display "BYE" text and are skipped in the UI.
- In consolation brackets: BYE match losers do not generate real consolation entrants. A match where one side was a BYE does not produce a meaningful loser to feed into the consolation bracket.
