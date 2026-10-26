import { defineCard } from "../define.js";

// Back face of Ravenous Demon // Archdemon of Greed. Rust Elemental's shape:
// the sacrifice is mandatory, and "if you can't" is that nothing was
// sacrificed. The 9 damage is dealt by the Archdemon itself.

const TEXT =
  "At the beginning of your upkeep, sacrifice a Human. If you can't, tap this creature and it deals 9 damage to you.";

export default defineCard({
  name: "Archdemon of Greed",
  art: "https://cards.scryfall.io/art_crop/back/6/a/6aef77b3-4b38-4902-9f7a-dc18b5bb9da9.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 9,
  toughness: 9,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { subtype: "Human" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                { kind: "damage", amount: 9, who: "you" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Ravenous Demon", "Archdemon of Greed"],
  transform: true,
});
