import { defineCard } from "../define.js";

// EDHREC rank 9645. Growth Spiral's draw-then-land, with Arboreal Grazer's
// "tapped".
const ENTER_TEXT =
  "When this creature enters, draw a card, then you may put a land card from your hand onto the battlefield tapped.";

export default defineCard({
  name: "H.E.R.B.I.E. Scout Unit",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Scout"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
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
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
