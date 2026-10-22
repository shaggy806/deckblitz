import { defineCard } from "../define.js";

// Ice Age. Imp's Mischief without the life loss: a spell (not an ability)
// with a single target, its new target chosen as Deflection resolves; with no
// other legal target, the target stays (the rulings).

export default defineCard({
  name: "Deflection",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Change the target of target spell with a single target.",
  targets: [{ kind: "stack", spells: "any", abilities: false, singleTarget: true }],
  effect: { kind: "change-targets", target: 0, how: "change" },
});
