import { defineCard } from "../define.js";

export default defineCard({
  name: "Thunder-Thrash Elder",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 1,
  toughness: 1,
  devour: { multiplier: 3, filter: { type: "creature" } },
  text: "Devour 3 (As this creature enters, you may sacrifice any number of creatures. It enters with three times that many +1/+1 counters on it.)",
});
