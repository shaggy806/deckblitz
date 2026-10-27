import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 22443.
//
// Rulings:
//   - Domain abilities count the number of basic land types among lands you control, not how many
//     lands you control or how many of any type.

export default defineCard({
  name: "Gaea's Might",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Domain — Target creature gets +1/+1 until end of turn for each basic land type among lands you control.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { basicLandTypes: "you" },
    toughness: { basicLandTypes: "you" },
    duration: "end-of-turn",
  },
});
