import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, exile target creature card from a graveyard. You gain life equal to that card's toughness.";

export default defineCard({
  name: "Rotfeaster Maggot",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "gain-life", amount: { toughnessOf: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
