import { defineCard } from "../define.js";

// EDHREC rank 27831.

export default defineCard({
  name: "Ramroller",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 2,
  toughness: 3,
  text: "This creature attacks each combat if able.\nThis creature gets +2/+0 as long as you control another artifact.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [2, 0],
      text: "This creature gets +2/+0 as long as you control another artifact.",
    },
  ],
});
