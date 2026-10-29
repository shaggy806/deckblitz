import { defineCard } from "../define.js";

// EDHREC rank 1603.
// The process goes on until you decline to put a land onto the battlefield (the ruling): each pass
// that put one draws a card and goes again.

const PT_TEXT = "Cultivator Colossus's power and toughness are each equal to the number of lands you control.";
const ETB_TEXT =
  "When this creature enters, you may put a land card from your hand onto the battlefield tapped. If you do, draw a card and repeat this process.";

export default defineCard({
  name: "Cultivator Colossus",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Beast"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}\n${ETB_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "repeat",
        again: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "hand",
              min: 0,
              max: 1,
              destination: "battlefield",
              enterTapped: true,
              leftover: "stay",
              filter: { type: "land" },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
