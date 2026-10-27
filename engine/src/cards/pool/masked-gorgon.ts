import { defineCard } from "../define.js";

const GORGON_TEXT = "Green creatures and white creatures have protection from Gorgons.";
const THRESHOLD_TEXT =
  "Threshold — This creature has protection from green and from white as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Masked Gorgon",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 5,
  toughness: 5,
  text: `${GORGON_TEXT}\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] } },
      protection: { filter: { subtype: "Gorgon" } },
      text: GORGON_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      protection: { colors: ["G", "W"] },
      text: THRESHOLD_TEXT,
    },
  ],
});
