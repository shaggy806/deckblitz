import { defineCard } from "../define.js";

// The exiled cards are linked to this artifact's time on the battlefield (rule
// 607.2a), so the third ability still reaches them though sacrificing it paid
// the cost. The number of cards is chosen up to the die's result, each going to
// its owner's hand.
const EXILE = "Whenever you sacrifice another nontoken artifact or creature, exile it.";
const DRAW = "{2}, {T}, Sacrifice another artifact or creature: Draw a card.";
const ROLL =
  "{3}, {T}, Sacrifice this artifact: Roll a d10. Return up to X cards from among cards exiled with this artifact to their owners' hands, where X is the result.";

export default defineCard({
  name: "Bag of Devouring",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${EXILE}\n${DRAW}\n${ROLL}`,
  triggered: [
    {
      trigger: {
        on: "sacrifice",
        who: "you",
        otherOnly: true,
        filter: { typesAnyOf: ["artifact", "creature"], token: false },
      },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", linked: true },
      resolve: null,
      text: EXILE,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } } },
      otherOnly: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 10,
        then: {
          kind: "look-and-choose",
          zone: "exiled-with-source",
          min: 0,
          max: { roll: "total" },
          destination: "hand",
          leftover: "stay",
        },
      },
      resolve: null,
      text: ROLL,
    },
  ],
});
