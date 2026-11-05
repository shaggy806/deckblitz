import { defineCard } from "../define.js";

// EDHREC rank 15444.

export default defineCard({
  name: "Salvager of Ruin",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  text: "Sacrifice this creature: Choose target permanent card in your graveyard that was put there from the battlefield this turn. Return it to your hand.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            notTypes: ["instant", "sorcery"],
            putIntoGraveyardThisTurn: { from: ["battlefield"] },
          },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "Sacrifice this creature: Choose target permanent card in your graveyard that was put there from the battlefield this turn. Return it to your hand.",
    },
  ],
});
