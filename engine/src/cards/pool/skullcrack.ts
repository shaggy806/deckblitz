import { defineCard } from "../define.js";

// EDHREC rank 10345. "Players can't gain life this turn" is a timed static:
// Everlasting Torment's `would-gain-life` replacement for this turn, so a
// replacement that would turn a gain into something else finds nothing to
// replace (the ruling). Both rules come before the damage, as written.
export default defineCard({
  name: "Skullcrack",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Players can't gain life this turn. Damage can't be prevented this turn. Skullcrack deals 3 damage to target player or planeswalker.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "timed-static",
        duration: "end-of-turn",
        static: [
          {
            affects: { scope: "self" },
            replacement: { event: "would-gain-life", who: "any-player", prevent: true },
            text: "Players can't gain life this turn.",
          },
        ],
        text: "Players can't gain life this turn.",
      },
      { kind: "damage-cant-be-prevented" },
      { kind: "damage", amount: 3, target: 0 },
    ],
  },
});
