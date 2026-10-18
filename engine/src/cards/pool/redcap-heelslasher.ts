import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 23453. March of the Machine.
//
// Backup grants only what's printed below it, fixed as it triggers; on the
// Heelslasher itself it's just the counter (the rulings).

export default defineCard({
  name: "Redcap Heelslasher",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nFirst strike",
  triggered: [backup(1, { keywords: ["first-strike"] })],
});
