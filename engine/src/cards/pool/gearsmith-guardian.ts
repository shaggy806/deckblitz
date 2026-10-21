import { defineCard } from "../define.js";

const TEXT = "This creature gets +2/+0 as long as you control a blue creature.";

export default defineCard({
  name: "Gearsmith Guardian",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["U"] }, atLeast: 1, countsSelf: true },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
});
