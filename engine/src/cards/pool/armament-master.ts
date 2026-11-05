import { defineCard } from "../define.js";

const TEXT = "Other Kor creatures you control get +2/+2 for each Equipment attached to this creature.";

export default defineCard({
  name: "Armament Master",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Kor" },
      grantPtPerCount: { filter: { subtype: "Equipment", attachedTo: { isSource: true } }, pt: [2, 2] },
      text: TEXT,
    },
  ],
});
