import { defineCard } from "../define.js";

const TEXT =
  "Strange new worlds — The Traveler's power is equal to the number of differently named lands you control.";

export default defineCard({
  name: "The Traveler",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Scout"],
  power: 0,
  toughness: 3,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: TEXT,
    },
  ],
});
