import { defineCard } from "../define.js";

// EDHREC rank 28273. Coldsnap. Plaguebearer's shape: X read in the target's
// filter.

export default defineCard({
  name: "Deepfire Elemental",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: "{X}{X}{1}: Destroy target artifact or creature with mana value X.",
  activated: [
    {
      cost: { mana: "{X}{X}{1}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{X}{X}{1}: Destroy target artifact or creature with mana value X.",
    },
  ],
});
