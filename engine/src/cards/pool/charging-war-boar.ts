import { defineCard } from "../define.js";

const DOMRI_TEXT =
  "As long as you control a Domri planeswalker, this creature gets +1/+1 and has trample. (It can deal excess damage to the player or planeswalker it's attacking.)";

export default defineCard({
  name: "Charging War Boar",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste (This creature can attack and {T} as soon as it comes under your control.)\n${DOMRI_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Domri" }, atLeast: 1 },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: DOMRI_TEXT,
    },
  ],
});
