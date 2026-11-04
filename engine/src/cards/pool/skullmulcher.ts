import { defineCard } from "../define.js";

const TEXT = "When this creature enters, draw a card for each creature it devoured.";

export default defineCard({
  name: "Skullmulcher",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  devour: { multiplier: 1, filter: { type: "creature" } },
  text: `Devour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { devoured: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
