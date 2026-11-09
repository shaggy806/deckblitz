import { defineCard } from "../define.js";

const TEXT =
  "When this creature is turned face up, you may put a creature card with a morph ability from your hand onto the battlefield face up. If you do, return this creature to its owner's hand.";

export default defineCard({
  name: "Dermoplasm",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{U}{U}" },
  text: `Flying\nMorph {2}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
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
            filter: { type: "creature", hasKeyword: "morph" },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
            then: { kind: "return-to-hand", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
