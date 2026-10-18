import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 27575. March of the Machine.
//
// Backup grants only what's printed below it, fixed as it triggers; on the
// Aeronaut itself it's just the counter (the rulings).

export default defineCard({
  name: "Golden-Scale Aeronaut",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Pilot"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nFlying",
  triggered: [backup(1, { keywords: ["flying"] })],
});
