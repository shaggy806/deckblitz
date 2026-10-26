import { defineCard } from "../define.js";

// Portal Three Kingdoms. EDHREC rank 31336. Water Wurm's shape.

export default defineCard({
  name: "Wu Admiral",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: "This creature gets +1/+1 as long as an opponent controls an Island.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { subtype: "Island" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as an opponent controls an Island.",
    },
  ],
});
