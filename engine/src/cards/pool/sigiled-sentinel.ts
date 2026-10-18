import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 24465.

export default defineCard({
  name: "Sigiled Sentinel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nVigilance",
  triggered: [backup(1, { keywords: ["vigilance"] })],
});
