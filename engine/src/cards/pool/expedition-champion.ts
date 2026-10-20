import { defineCard } from "../define.js";

// Rulings:
//   Expedition Champion gets just +2/+0, no matter how many other Warriors you control.
//
// "Another Warrior": a static's `controls` scan skips its own source.

export default defineCard({
  name: "Expedition Champion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 3,
  text: "This creature gets +2/+0 as long as you control another Warrior.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Warrior" }, atLeast: 1 },
      grantPt: [2, 0],
      text: "This creature gets +2/+0 as long as you control another Warrior.",
    },
  ],
});
