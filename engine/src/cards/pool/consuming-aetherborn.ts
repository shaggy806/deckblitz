import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 23882.

export default defineCard({
  name: "Consuming Aetherborn",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Vampire"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nLifelink",
  triggered: [backup(1, { keywords: ["lifelink"] })],
});
