import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 14311. Deflection's shape: a spell (not an ability)
// with a single target, its new target chosen as Shunt resolves; with no other
// legal target, the target stays (the rulings).

export default defineCard({
  name: "Shunt",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Change the target of target spell with a single target.",
  targets: [{ kind: "stack", spells: "any", abilities: false, singleTarget: true }],
  effect: { kind: "change-targets", target: 0, how: "change" },
});
