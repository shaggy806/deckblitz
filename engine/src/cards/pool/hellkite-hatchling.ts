import { defineCard } from "../define.js";

const TEXT = "This creature has flying and trample if it devoured a creature.";

// Kept even if its counters are removed, and a copy asks of itself (the rulings).
export default defineCard({
  name: "Hellkite Hatchling",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 2,
  toughness: 2,
  devour: { multiplier: 1, filter: { type: "creature" } },
  text: `Devour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-devoured" },
      grantKeywords: ["flying", "trample"],
      text: TEXT,
    },
  ],
});
