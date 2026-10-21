import { defineCard } from "../define.js";

// EDHREC rank 28203.
//
// Rulings:
//   [2004-10-04] Can't be used on mana abilities because they don't use the stack. They've
//     already resolved by the time you get priority.

export default defineCard({
  name: "Rust",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Counter target activated ability from an artifact source. (Mana abilities can't be targeted.)",
  targets: [{ kind: "ability", abilityKind: "activated", sourceTypes: ["artifact"] }],
  effect: { kind: "counter", target: 0 },
});
