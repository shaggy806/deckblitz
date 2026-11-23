import { defineCard } from "../define.js";
import { entersTappedStatic } from "../helpers.js";

// Playtest card (Mystery Booster 2).

const THRESHOLD =
  "Threshold — Nim Mongoose gets +1/+0 for each artifact you control as long as seven or more cards are in your graveyard.";

export default defineCard({
  name: "Nim Mongoose",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Mongoose"],
  power: 2,
  toughness: 1,
  keywords: ["shroud"],
  text: `Shroud (This creature can't be the target of spells or abilities.)\nNim Mongoose enters the battlefield tapped.\n${THRESHOLD}`,
  static: [
    entersTappedStatic("Nim Mongoose"),
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: THRESHOLD,
    },
  ],
});
