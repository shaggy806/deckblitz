import { defineCard } from "../define.js";

// EDHREC rank 32101.
//
// Rulings:
//   [2004-10-04] You choose the color (or artifacts) on resolution.

const TEXT = "Sacrifice two lands: This creature gains protection from artifacts or from the color of your choice until end of turn.";

export default defineCard({
  name: "Jeweled Spirit",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" }, count: 2 } },
      targets: [],
      effect: {
        kind: "grant-protection",
        target: "source",
        from: { choose: "color", or: [{ text: "artifacts", from: { types: ["artifact"] } }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
