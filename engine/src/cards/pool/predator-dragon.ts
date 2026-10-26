import { defineCard } from "../define.js";

export default defineCard({
  name: "Predator Dragon",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: "Flying, haste\nDevour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)",
});
