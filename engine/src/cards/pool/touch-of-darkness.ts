import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 18069.
//
// "One or more target creatures": an `any-number` group of at least one.

export default defineCard({
  name: "Touch of Darkness",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "One or more target creatures become black until end of turn.",
  targets: [{ kind: "any-number", of: "creature", min: 1 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "become-color", target: 0, colors: ["B"], duration: "end-of-turn" },
  },
});
