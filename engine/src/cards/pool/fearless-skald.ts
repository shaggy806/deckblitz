import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 21373.
//
// Backup grants only what's printed below it (double strike), fixed as it
// triggers; on the Skald itself it's just the counter (the rulings).

export default defineCard({
  name: "Fearless Skald",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Berserker"],
  power: 3,
  toughness: 2,
  keywords: ["double-strike"],
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nDouble strike",
  triggered: [backup(1, { keywords: ["double-strike"] })],
});
