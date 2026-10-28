import { defineCard } from "../define.js";

// "Each of up to X targets": an any-number group bounded by the cast X (rule
// 601.2b–c), each dealt five times X.
export default defineCard({
  name: "Crackle with Power",
  manaCost: "{X}{X}{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Crackle with Power deals five times X damage to each of up to X targets.",
  targets: [{ kind: "any-number", of: "any-target", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "damage", amount: { product: [5, "x"] }, target: 0 },
  },
});
