import { defineCard } from "../define.js";

// EDHREC rank 15303. Marvel Super Heroes. II is Avengers Quinjet's put from
// the hand, then Expand the Sphere's "if you don't" (`this-way` with
// `atMost: 0`): the draw happens only when no card was put onto the
// battlefield.

const I_TEXT = "I — Scry 2.";
const II_TEXT =
  "II — You may put a Hero creature card with mana value 3 or less from your hand onto the battlefield. If you don't, draw a card.";
const III_TEXT = "III — Put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Origin of the Avengers",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature", subtype: "Hero", manaValue: { op: "lte", n: 3 } },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atMost: 0 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
