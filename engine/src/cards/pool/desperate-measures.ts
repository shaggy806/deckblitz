import { defineCard } from "../define.js";

// EDHREC rank 11638.
//
// Rulings:
//   [2025-04-04] As long as you control it, you will get to draw two cards when the target
//     creature goes to the graveyard, regardless of whether it died due to having 0 toughness or
//     something else.
//   [2025-04-04] If the creature is no longer a creature at the time it goes to the graveyard, you
//     will still draw two cards if you controlled it at that time.

const DIES_TEXT = "When it dies under your control this turn, draw two cards.";

export default defineCard({
  name: "Desperate Measures",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Target creature gets +1/-1 until end of turn. ${DIES_TEXT}`,
  targets: ["creature"],
  // Scarblade's Malice's death watch on the target, this turn only. "Under
  // your control" is who controlled it as it died — the trigger object's
  // last-known information — so an opponent's creature dying under its own
  // controller draws nothing, and one you've taken does.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: -1, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: {
          kind: "conditional",
          condition: { kind: "trigger-object", filter: { controlledBy: "you" } },
          then: { kind: "draw", amount: 2 },
        },
        text: DIES_TEXT,
      },
    ],
  },
});
