import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 25527.
//
// "One or more target creatures": an `any-number` group of at least one.

export default defineCard({
  name: "Sea Kings' Blessing",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "One or more target creatures become blue until end of turn.",
  targets: [{ kind: "any-number", of: "creature", min: 1 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "become-color", target: 0, colors: ["U"], duration: "end-of-turn" },
  },
});
