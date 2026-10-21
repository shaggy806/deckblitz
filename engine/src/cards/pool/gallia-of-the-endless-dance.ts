import { defineCard } from "../define.js";

// EDHREC rank 17023. With no cards in hand the random discard discards
// nothing, so "if you do" draws nothing (the ruling).

export default defineCard({
  name: "Gallia of the Endless Dance",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Satyr"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nOther Satyrs you control get +1/+1 and have haste.\nWhenever you attack with three or more creatures, you may discard a card at random. If you do, draw two cards.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Satyr", excludeSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["haste"],
      text: "Other Satyrs you control get +1/+1 and have haste.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 3 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card at random to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1, random: true },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: "Whenever you attack with three or more creatures, you may discard a card at random. If you do, draw two cards.",
    },
  ],
});
