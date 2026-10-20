import { defineCard } from "../define.js";

// Devotion is counted as the ability resolves, this creature included if
// it's still there (the rulings).
const TEXT =
  "When this creature enters, create a number of 1/1 green Squirrel creature tokens equal to your devotion to black.";

export default defineCard({
  name: "Underworld Hermit",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: { devotionTo: "B" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
