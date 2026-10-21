import { defineCard } from "../define.js";

const TEXT = "This creature gets +2/+2 as long as you control a Garruk planeswalker.";

export default defineCard({
  name: "Predatory Wurm",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Garruk" }, atLeast: 1 },
      grantPt: [2, 2],
      text: TEXT,
    },
  ],
});
