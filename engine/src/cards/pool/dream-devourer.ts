import { defineCard } from "../define.js";

// EDHREC rank 4817. A card foretold through this keeps its foretell cost after
// this creature is gone.
export default defineCard({
  name: "Dream Devourer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Cleric"],
  power: 0,
  toughness: 3,
  text: "Each nonland card in your hand without foretell has foretell. Its foretell cost is equal to its mana cost reduced by {2}. (During your turn, you may pay {2} and exile it from your hand face down. Cast it on a later turn for its foretell cost.)\nWhenever you foretell a card, this creature gets +2/+0 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      grantsForetellInHand: { filter: { notTypes: ["land"] }, reducedBy: 2 },
      text: "Each nonland card in your hand without foretell has foretell. Its foretell cost is equal to its mana cost reduced by {2}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "foretells", who: "you" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you foretell a card, this creature gets +2/+0 until end of turn.",
    },
  ],
});
