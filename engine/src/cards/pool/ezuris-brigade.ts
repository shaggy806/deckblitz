import { defineCard } from "../define.js";

// EDHREC rank 27363.

export default defineCard({
  name: "Ezuri's Brigade",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 4,
  text: "Metalcraft — As long as you control three or more artifacts, this creature gets +4/+4 and has trample.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      grantPt: [4, 4],
      grantKeywords: ["trample"],
      text: "Metalcraft — As long as you control three or more artifacts, this creature gets +4/+4 and has trample.",
    },
  ],
});
