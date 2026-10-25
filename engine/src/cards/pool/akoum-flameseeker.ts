import { defineCard } from "../define.js";

const TEXT = "Cohort — {T}, Tap an untapped Ally you control: Discard a card. If you do, draw a card.";

export default defineCard({
  name: "Akoum Flameseeker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Ally"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 1, filter: { subtype: "Ally", controlledBy: "you" } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
