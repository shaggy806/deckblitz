import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 29458.
//
// The damage goes to the destroyed land's controller, read from its last
// known information (Icequake's shape).

export default defineCard({
  name: "Poison the Well",
  manaCost: "{2}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Destroy target land. Poison the Well deals 2 damage to that land's controller.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
