import { defineCard } from "../define.js";

// EDHREC rank 22636. Ravnica: City of Guilds.

export default defineCard({
  name: "Seed Spark",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target artifact or enchantment. If {G} was spent to cast this spell, create two 1/1 green Saproling creature tokens.",
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } },
        then: { kind: "create-token", token: "Saproling Token", count: 2 },
      },
    ],
  },
});
