import { defineCard } from "../define.js";

// "If you do or if you control another Dinosaur": one gain of 3, by either
// road. The reveal is offered whatever the board, and may be declined.
const TEXT =
  "When this creature enters, you may reveal a Dinosaur card from your hand. If you do or if you control another Dinosaur, you gain 3 life.";

export default defineCard({
  name: "Armored Kincaller",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            filter: { subtype: "Dinosaur" },
            destination: "reveal",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "revealed", atLeast: 1 },
            then: { kind: "gain-life", amount: 3 },
            else: {
              kind: "conditional",
              condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1, excludeSelf: true },
              then: { kind: "gain-life", amount: 3 },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
