import { defineCard } from "../define.js";

const PERMANENT_TYPES = ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] as const;

export default defineCard({
  name: "Brought Back",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose up to two target permanent cards in your graveyard that were put there from the battlefield this turn. Return them to the battlefield tapped.",
  targets: [
    {
      kind: "any-number",
      max: 2,
      of: {
        kind: "card-in-graveyard",
        whose: "you",
        filter: { typesAnyOf: PERMANENT_TYPES, putIntoGraveyardThisTurn: { from: ["battlefield"] } },
      },
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
  },
});
