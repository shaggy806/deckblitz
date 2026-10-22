import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 31560.
//
// Rulings:
//   Only gets the bonus once even if more than one opponent has an Island on the battlefield.

const TEXT = "This creature gets +0/+1 as long as an opponent controls an Island.";

export default defineCard({
  name: "Water Wurm",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { subtype: "Island" }, atLeast: 1 },
      grantPt: [0, 1],
      text: TEXT,
    },
  ],
});
