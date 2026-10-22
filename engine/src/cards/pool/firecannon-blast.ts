import { defineCard } from "../define.js";

// EDHREC rank 23187. Raid is read as the spell resolves.

export default defineCard({
  name: "Firecannon Blast",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Firecannon Blast deals 3 damage to target creature.\nRaid — Firecannon Blast deals 6 damage instead if you attacked this turn.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { ifCondition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 }, then: 6, else: 3 },
  },
});
