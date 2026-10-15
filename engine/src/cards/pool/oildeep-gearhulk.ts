import { defineCard } from "../define.js";

// EDHREC rank 10042.

export default defineCard({
  name: "Oildeep Gearhulk",
  manaCost: "{U}{U}{B}{B}",
  colors: ["U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: "Lifelink, ward {1}\nWhen this creature enters, look at target player's hand. You may choose a card from it. If you do, that player discards that card, then draws a card.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: "Ward {1}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      // "If you do": the draw only follows a card actually discarded.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-chosen", target: 0, lookOnly: true, optional: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", atLeast: 1 },
            then: { kind: "draw", amount: 1, target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, look at target player's hand. You may choose a card from it. If you do, that player discards that card, then draws a card.",
    },
  ],
});
