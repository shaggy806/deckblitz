import { defineCard } from "../define.js";

// EDHREC rank 12209.

// The creature is the source of the damage, dealt to itself (Soul's Fire's
// `from`), its power read as the spell resolves; with flying then, twice
// that much instead.
export default defineCard({
  name: "Cut Propulsion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature deals damage to itself equal to its power. If that creature has flying, it deals twice that much damage to itself instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { keyword: "flying" } },
    then: { kind: "damage", amount: { product: [{ powerOf: 0 }, 2] }, target: 0, from: { target: 0 } },
    else: { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
  },
});
