import { defineCard } from "../define.js";

export default defineCard({
  name: "Aegis of Honor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{1}: The next time an instant or sorcery spell would deal damage to you this turn, that spell deals that damage to its controller instead.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "damage-rule",
        to: { players: "you" },
        by: { filter: { typesAnyOf: ["instant", "sorcery"] } },
        amount: "next-time",
        redirectTo: "source-controller",
      },
      resolve: null,
      text: "{1}: The next time an instant or sorcery spell would deal damage to you this turn, that spell deals that damage to its controller instead.",
    },
  ],
});
