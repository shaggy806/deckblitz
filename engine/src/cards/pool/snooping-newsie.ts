import { defineCard } from "../define.js";

// EDHREC rank 25729.

export default defineCard({
  name: "Snooping Newsie",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, mill two cards. (Put the top two cards of your library into your graveyard.)\nAs long as there are five or more mana values among cards in your graveyard, this creature gets +1/+1 and has lifelink.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: "When this creature enters, mill two cards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: "As long as there are five or more mana values among cards in your graveyard, this creature gets +1/+1 and has lifelink.",
      condition: {
        kind: "aggregate",
        value: {
          aggregate: "distinct",
          of: "mana-value",
          filter: { ownedBy: "you" },
          in: "graveyards",
        },
        compare: { op: "gte", n: 5 },
      },
    },
  ],
});
