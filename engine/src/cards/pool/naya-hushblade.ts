import { defineCard } from "../define.js";

export default defineCard({
  name: "Naya Hushblade",
  manaCost: "{R/W}{G}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 2,
  toughness: 1,
  text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has shroud. (It can't be the target of spells or abilities.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { multicolored: true }, atLeast: 1, excludeSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["shroud"],
      text: "As long as you control another multicolored permanent, this creature gets +1/+1 and has shroud.",
    },
  ],
});
