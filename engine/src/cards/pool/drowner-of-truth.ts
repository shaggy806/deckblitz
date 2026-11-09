import { defineCard } from "../define.js";

const TEXT = "When you cast this spell, if {C} was spent to cast it, create two 0/1 colorless Eldrazi Spawn creature tokens with \"Sacrifice this token: Add {C}.\"";

export default defineCard({
  name: "Drowner of Truth",
  manaCost: "{5}{G/U}{G/U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 7,
  toughness: 6,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "source", filter: { manaSpent: [{ type: "C", amount: { op: "gte", n: 1 } }] } },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Drowner of Truth", "Drowned Jungle"],
});
