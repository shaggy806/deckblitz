import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 9294.
//
// Backup grants only what's printed below it, fixed as it triggers; on the
// Valkyrie itself it's just the counter (the rulings).

export default defineCard({
  name: "Boon-Bringer Valkyrie",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "first-strike", "lifelink"],
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following abilities until end of turn.)\nFlying, first strike, lifelink",
  triggered: [backup(1, { keywords: ["flying", "first-strike", "lifelink"] })],
});
