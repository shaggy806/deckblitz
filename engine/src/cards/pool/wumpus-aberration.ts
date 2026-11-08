import { defineCard } from "../define.js";

const TEXT =
  "When you cast this spell, if {C} wasn't spent to cast it, target opponent may put a creature card from their hand onto the battlefield.";

// EDHREC rank 21216. Devoid: `colors: []`. Rule 106.1b: {C} is a type, so a
// clause counting none of it (`amount: { op: "eq", n: 0 }`). A free cast spent
// no {C} either.
export default defineCard({
  name: "Wumpus Aberration",
  manaCost: "{3}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Devoid (This card has no color.)\n${TEXT}\nTrample`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "source", filter: { manaSpent: [{ type: "C", amount: { op: "eq", n: 0 } }] } },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 0,
          max: 1,
          destination: "battlefield",
          leftover: "stay",
          filter: { type: "creature" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
