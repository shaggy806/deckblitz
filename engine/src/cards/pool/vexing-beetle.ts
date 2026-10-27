import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 31793.

const TEXT = "This creature gets +3/+3 as long as no opponent controls a creature.";

export default defineCard({
  name: "Vexing Beetle",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  cantBeCountered: true,
  text: `This spell can't be countered.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 },
      },
      grantPt: [3, 3],
      text: TEXT,
    },
  ],
});
