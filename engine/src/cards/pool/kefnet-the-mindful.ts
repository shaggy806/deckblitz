import { defineCard } from "../define.js";

const RESTRICTION_TEXT = "Kefnet can't attack or block unless you have seven or more cards in hand.";
const DRAW_TEXT = "{3}{U}: Draw a card, then you may return a land you control to its owner's hand.";

export default defineCard({
  name: "Kefnet the Mindful",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "indestructible"],
  text: `Flying, indestructible\n${RESTRICTION_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "hand-size", atLeast: 7 } },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICTION_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      // The land is chosen as the ability resolves, after the draw (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "choose-permanents",
            filter: { type: "land", controlledBy: "you" },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "You may return a land you control to its owner's hand",
          },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
