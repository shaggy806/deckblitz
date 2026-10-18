import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 17833.
//
// Backup grants only what's printed below it (deathtouch), fixed as it
// triggers; on the Assailant itself it's just the counter (the rulings).

export default defineCard({
  name: "Serpent-Blade Assailant",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nDeathtouch",
  triggered: [backup(1, { keywords: ["deathtouch"] })],
});
