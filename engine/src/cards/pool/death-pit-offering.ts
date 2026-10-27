import { defineCard } from "../define.js";

// EDHREC rank 23994.

const ENTERS = "When this enchantment enters, sacrifice all creatures you control.";
const ANTHEM = "Creatures you control get +2/+2.";

export default defineCard({
  name: "Death Pit Offering",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTERS}\n${ANTHEM}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-all", who: "you", filter: { type: "creature" } },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [2, 2], text: ANTHEM }],
});
