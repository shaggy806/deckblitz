import { defineCard } from "../define.js";

export default defineCard({
  name: "Thaumaton Torpedo",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{6}, {T}, Sacrifice this artifact: Destroy target nonland permanent. This ability costs {3} less to activate if you attacked with a Spacecraft this turn.",
  activated: [
    {
      cost: { mana: "{6}", tap: true, sacrifice: "self" },
      costReduction: {
        reduceGeneric: 3,
        condition: { kind: "turn-history", what: "attackers", filter: { subtype: "Spacecraft" } },
      },
      targets: ["nonland-permanent"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{6}, {T}, Sacrifice this artifact: Destroy target nonland permanent. This ability costs {3} less to activate if you attacked with a Spacecraft this turn.",
    },
  ],
});
