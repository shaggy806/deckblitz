import { defineCard } from "../define.js";

// EDHREC rank 27081.

const TEXT =
  "{1}, {T}: Put a +1/+1 counter on each creature you control that entered this turn. If you put two or more +1/+1 counters on creatures this way, draw a card.";

// "Two or more +1/+1 counters" counts the counters placed, not the
// creatures (`"counters-placed"`): a doubler putting two on one creature
// draws the card.
export default defineCard({
  name: "Guinan, Ancient Advisor",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["El-Aurian", "Advisor"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you", enteredThisTurn: true },
            counter: "+1/+1",
            amount: 1,
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "counters-placed", atLeast: 2 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
