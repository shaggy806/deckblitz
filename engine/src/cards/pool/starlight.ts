import { defineCard } from "../define.js";

// EDHREC rank 30636. Kithkin Zealot's count from the target
// opponent's side, three life a creature.

export default defineCard({
  name: "Starlight",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 3 life for each black creature target opponent controls.",
  targets: ["opponent"],
  effect: {
    kind: "gain-life",
    amount: { countOf: { type: "creature", colors: ["B"], controlledBy: "you" }, forTarget: 0, times: 3 },
  },
});
