import { defineCard } from "../define.js";

// EDHREC rank 15086. Winged Words's conditional self cost reduction.

export default defineCard({
  name: "Machine Over Matter",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "This spell costs {1} less to cast if you control an artifact creature.\n" +
    "Return target nonland permanent to its owner's hand.",
  selfCostReduction: {
    condition: {
      kind: "controls",
      filter: { types: ["artifact", "creature"] },
      atLeast: 1,
    },
    reduceGeneric: 1,
  },
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
});
