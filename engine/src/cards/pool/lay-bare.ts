import { defineCard } from "../define.js";

// Mercadian Masques. Dismal Failure's "its controller" after the counter
// (`{ controllerOf: 0 }`, the spell as it last existed on the stack, 608.2h),
// read by `look-at-hand`. With its target illegal Lay Bare doesn't resolve,
// so nobody's hand is looked at (608.2b, the ruling).

export default defineCard({
  name: "Lay Bare",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Look at its controller's hand.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "look-at-hand", target: { controllerOf: 0 } },
    ],
  },
});
