import { defineCard } from "../define.js";

const FACES = ["Insult // Injury", "Insult", "Injury"];

export default defineCard({
  name: "Insult",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Damage can't be prevented this turn. If a source you control would deal damage this turn, it deals double that damage instead.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-cant-be-prevented" },
      {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: { event: "would-deal-damage", source: { controlledBy: "you" }, instead: { modify: { times: 2 } } },
      },
    ],
  },
  faces: FACES,
  split: true,
});
