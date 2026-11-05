import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature dealt damage by Axelrod Gunnarson this turn dies, you gain 1 life and Axelrod Gunnarson deals 1 damage to target player or planeswalker.";

export default defineCard({
  name: "Axelrod Gunnarson",
  manaCost: "{4}{B}{B}{R}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "damage", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
