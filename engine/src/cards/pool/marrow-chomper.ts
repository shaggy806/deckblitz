import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you gain 2 life for each creature it devoured.";

export default defineCard({
  name: "Marrow Chomper",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Lizard"],
  power: 3,
  toughness: 3,
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: `Devour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [2, { devoured: "source" }] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
