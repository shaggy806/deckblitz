import { defineCard } from "../define.js";

export default defineCard({
  name: "Disciple of Malice",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  cycling: { cost: "{2}" },
  text: "Protection from white\nCycling {2} ({2}, Discard this card: Draw a card.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
