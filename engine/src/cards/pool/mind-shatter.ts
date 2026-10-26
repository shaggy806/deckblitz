import { defineCard } from "../define.js";

export default defineCard({
  name: "Mind Shatter",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards X cards at random.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: "x", random: true },
});
