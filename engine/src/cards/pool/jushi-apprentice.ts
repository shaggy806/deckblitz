import { defineCard } from "../define.js";

export default defineCard({
  name: "Jushi Apprentice",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{2}{U}, {T}: Draw a card. If you have nine or more cards in hand, flip this creature.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "conditional", condition: { kind: "hand-size", atLeast: 9 }, then: { kind: "flip", target: "source" } },
        ],
      },
      resolve: null,
      text: "{2}{U}, {T}: Draw a card. If you have nine or more cards in hand, flip this creature.",
    },
  ],
  faces: ["Jushi Apprentice", "Tomoya the Revealer"],
  flip: true,
});
