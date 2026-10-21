import { defineCard } from "../define.js";

// EDHREC rank 12175.

export default defineCard({
  name: "Mind Twist",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards X cards at random.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: "x", random: true },
});
