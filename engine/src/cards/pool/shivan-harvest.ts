import { defineCard } from "../define.js";

export default defineCard({
  name: "Shivan Harvest",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{1}{R}, Sacrifice a creature: Destroy target nonbasic land.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "creature-you-control" },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{1}{R}, Sacrifice a creature: Destroy target nonbasic land.",
    },
  ],
});
