import { defineCard } from "../define.js";

// EDHREC rank 16398.

export default defineCard({
  name: "No Rest for the Wicked",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Sacrifice this enchantment: Return to your hand all creature cards in your graveyard that were put there from the battlefield this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        destination: "hand",
        count: "all",
      },
      resolve: null,
      text: "Sacrifice this enchantment: Return to your hand all creature cards in your graveyard that were put there from the battlefield this turn.",
    },
  ],
});
