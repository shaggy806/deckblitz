import { defineCard } from "../define.js";

// The creatures bound are found while they're still attacking; the additional
// combat phase is queued in the same instruction as they're removed, so nothing
// happens between the two.
export default defineCard({
  name: "Illusionist's Gambit",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Cast this spell only during the declare blockers step on an opponent's turn.\n" +
    "Remove all attacking creatures from combat and untap them. After this phase, there is an additional combat phase. Each of those creatures attacks that combat if able. They can't attack you or planeswalkers you control that combat.",
  castOnlyIf: {
    kind: "all",
    of: [
      { kind: "turn-structure", steps: ["declare-blockers"] },
      { kind: "not", of: { kind: "your-turn" } },
    ],
  },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "additional-combat",
        afterThisPhase: true,
        forcedAttackers: { filter: { type: "creature", attacking: true }, cantAttackYou: true },
      },
      {
        kind: "for-each-permanent",
        filter: { type: "creature", attacking: true },
        as: 0,
        simultaneous: true,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "remove-from-combat", target: 0 },
            { kind: "untap", target: 0 },
          ],
        },
      },
    ],
  },
});
