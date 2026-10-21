import { defineCard } from "../define.js";

export default defineCard({
  name: "Pyrophobia",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Pyrophobia deals 3 damage to target creature. Cowards can't block this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      // A rule for the rest of the turn, not a grant: a creature that enters or
      // becomes a Coward later can't block either (the ruling).
      { kind: "restrict", filter: { type: "creature", subtype: "Coward" }, restrictions: ["cant-block"] },
    ],
  },
});
