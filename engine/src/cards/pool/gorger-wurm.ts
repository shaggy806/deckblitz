import { defineCard } from "../define.js";

// EDHREC rank 28085.

export default defineCard({
  name: "Gorger Wurm",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  devour: { multiplier: 1, filter: { type: "creature" } },
  text: "Devour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)",
});
