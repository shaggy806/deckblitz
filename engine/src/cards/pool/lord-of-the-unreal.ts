import { defineCard } from "../define.js";

// EDHREC rank 8658. Not "other": an Illusion Lord of the Unreal (made one by
// a type-changing effect) would get it too.

const TEXT =
  "Illusion creatures you control get +1/+1 and have hexproof. (They can't be the targets of spells or abilities your opponents control.)";

export default defineCard({
  name: "Lord of the Unreal",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Illusion" },
      grantPt: [1, 1],
      grantKeywords: ["hexproof"],
      text: TEXT,
    },
  ],
});
