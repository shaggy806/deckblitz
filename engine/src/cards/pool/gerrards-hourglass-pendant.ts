import { defineCard } from "../define.js";

export default defineCard({
  name: "Gerrard's Hourglass Pendant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  supertypes: ["legendary"],
  keywords: ["flash"],
  text:
    "Flash\n" +
    "If a player would begin an extra turn, that player skips that turn instead.\n" +
    "{4}, {T}, Exile Gerrard's Hourglass Pendant: Return to the battlefield tapped all artifact, creature, enchantment, and land cards in your graveyard that were put there from the battlefield this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-begin-turn", who: "any", extraOnly: true },
      text: "If a player would begin an extra turn, that player skips that turn instead.",
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true, exileSelf: true },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land"],
          putIntoGraveyardThisTurn: { from: ["battlefield"] },
        },
        destination: "battlefield",
        count: "all",
        enterTapped: true,
      },
      resolve: null,
      text: "{4}, {T}, Exile Gerrard's Hourglass Pendant: Return to the battlefield tapped all artifact, creature, enchantment, and land cards in your graveyard that were put there from the battlefield this turn.",
    },
  ],
});
