import { defineCard } from "../define.js";

// EDHREC rank 10473.
//
// Rulings:
//   [2024-11-08] Use Fiendish Panda's power as it last existed on the battlefield to determine
//     which creature cards may be targeted with its last ability.

const GAIN_TEXT = "Whenever you gain life, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  "When this creature dies, return another target non-Bear creature card with mana value less than or equal to this creature's power from your graveyard to the battlefield.";

export default defineCard({
  name: "Fiendish Panda",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Bear", "Demon"],
  power: 3,
  toughness: 2,
  text: `${GAIN_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GAIN_TEXT,
    },
    {
      // "Another": the Panda is itself a Bear card, so non-Bear already
      // leaves it out. Its power is the power it died with (608.2h).
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            type: "creature",
            notSubtypes: ["Bear"],
            manaValue: { op: "lte", n: { amount: { powerOf: "trigger-object" } } },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
