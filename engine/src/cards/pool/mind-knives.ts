import { defineCard } from "../define.js";

// Portal. EDHREC rank 30561.
export default defineCard({
  name: "Mind Knives",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards a card at random.",
  targets: ["opponent"],
  effect: { kind: "discard", target: 0, amount: 1, random: true },
});
