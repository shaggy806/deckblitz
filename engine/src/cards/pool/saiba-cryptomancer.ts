import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 12224.
//
// Backup grants only what's printed below it (hexproof), fixed as it
// triggers; on the Cryptomancer itself it's just the counter (the rulings).

export default defineCard({
  name: "Saiba Cryptomancer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Ninja"],
  power: 0,
  toughness: 1,
  keywords: ["flash", "hexproof"],
  text: "Flash\nBackup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nHexproof",
  triggered: [backup(1, { keywords: ["hexproof"] })],
});
