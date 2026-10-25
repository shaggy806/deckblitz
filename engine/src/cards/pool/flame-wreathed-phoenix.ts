import { defineCard } from "../define.js";

// EDHREC rank 19727.

export default defineCard({
  name: "Flame-Wreathed Phoenix",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  tribute: 2,
  text: "Flying\nTribute 2 (As this creature enters, an opponent of your choice may put two +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, it gains haste and \"When this creature dies, return it to its owner's hand.\"",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "permanent" },
          {
            kind: "grant-triggered",
            target: "source",
            duration: "permanent",
            ability: {
              trigger: { on: "dies", who: "self" },
              targets: [],
              effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
              resolve: null,
              text: "When this creature dies, return it to its owner's hand.",
            },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, it gains haste and \"When this creature dies, return it to its owner's hand.\"",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});
