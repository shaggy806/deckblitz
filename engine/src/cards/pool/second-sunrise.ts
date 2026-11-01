import { defineCard } from "../define.js";

// Each player's own cards from their own graveyard, under its owner's control
// (`each-graveyard`), all at once. An artifact, creature, enchantment or land
// card as it is in the graveyard; a planeswalker card stays.

export default defineCard({
  name: "Second Sunrise",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Each player returns to the battlefield all artifact, creature, enchantment, and land cards in their graveyard that were put there from the battlefield this turn.",
  effect: {
    kind: "return-from-graveyard",
    from: "each-graveyard",
    filter: {
      typesAnyOf: ["artifact", "creature", "enchantment", "land"],
      putIntoGraveyardThisTurn: { from: ["battlefield"] },
    },
    destination: "battlefield",
    count: "all",
  },
});
