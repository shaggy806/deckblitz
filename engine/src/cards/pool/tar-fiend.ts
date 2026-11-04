import { defineCard } from "../define.js";

const TEXT = "When this creature enters, target player discards a card for each creature it devoured.";

export default defineCard({
  name: "Tar Fiend",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: `Devour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: { devoured: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
