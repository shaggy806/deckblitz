import { defineCard } from "../define.js";

// EDHREC rank 27920.
//
// Rulings:
//   [2004-10-04] Disharmony works even if the attacker was not tapped to attack.
//   [2004-10-04] The creature untaps (if it was tapped) before you get control of it.
//   [2008-10-01] Disharmony can target a creature you control.
//   [2008-10-01] The current wording explicitly removes the creature from combat. It is no longer
//     an attacking or blocking creature.
//   [2009-10-01] If you cast Disharmony during an opponent's turn, you may then block with the
//     creature you gain control of (assuming there's an attacking creature it can block).
//   [2013-09-20] If a turn has multiple combat phases, this spell can be cast during any of them
//     as long as it's before the beginning of that phase's Declare Blockers Step.
//
// "During combat before blockers are declared" is the beginning of combat
// and declare attackers steps (blockers are declared as the declare blockers
// step begins, rule 509.1, before anyone gets priority in it).
const TIMING_TEXT = "Cast this spell only during combat before blockers are declared.";
const EFFECT_TEXT =
  "Untap target attacking creature and remove it from combat. Gain control of that creature until end of turn.";

export default defineCard({
  name: "Disharmony",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TIMING_TEXT}\n${EFFECT_TEXT}`,
  castOnlyIf: { kind: "turn-structure", steps: ["begin-combat", "declare-attackers"] },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "remove-from-combat", target: 0 },
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
    ],
  },
});
