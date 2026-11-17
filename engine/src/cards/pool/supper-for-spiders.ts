import { defineCard } from "../define.js";

// EDHREC rank 13402.
//
// Rulings:
//   - The effect making the permanents Food artifacts lasts indefinitely. It doesn't expire during
//     the cleanup step.
//   - The returned cards lose any other subtypes and card types and will be only Food artifacts.
//     They retain their name, mana cost, mana value, and abilities. If any of them are legendary,
//     they remain legendary.
//
// Thrilling Encore's return, from opponents' graveyards only, each card entering as a Food
// artifact (rule 614.12 — `enterAs`, one lasting effect of the resolution, rule 611.2c): its card
// types replaced by artifact, which takes every subtype that went only with a lost type (205.1a —
// creature types, a land creature's land types), and its artifact subtypes replaced by Food;
// supertypes, name, mana cost and abilities kept (the ruling), the Food ability given beside them.

const FOOD_TEXT = "{2}, {T}, Sacrifice this artifact: You gain 3 life.";

export default defineCard({
  name: "Supper for Spiders",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Put onto the battlefield under your control all creature cards in your opponents' graveyards that were put there from the battlefield this turn. They are Food artifacts with "${FOOD_TEXT}" (They lose all other types and subtypes.)`,
  targets: [],
  effect: {
    kind: "return-from-graveyard",
    from: "all-graveyards",
    filter: { type: "creature", ownedBy: "opponent", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
    destination: "battlefield",
    count: "all",
    enterAs: {
      setTypes: ["artifact"],
      setSubtypes: ["Food"],
      activated: [
        {
          cost: { mana: "{2}", tap: true, sacrifice: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 3 },
          resolve: null,
          text: FOOD_TEXT,
        },
      ],
    },
  },
});
