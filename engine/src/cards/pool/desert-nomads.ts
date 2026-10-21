import { defineCard } from "../define.js";

// EDHREC rank 29610.
//
// "Prevent all damage that would be dealt to this creature by Deserts": a
// self-protecting prevention replacement (Sevinne's shape) narrowed to
// damage whose source is a Desert.

const PREVENT_TEXT = "Prevent all damage that would be dealt to this creature by Deserts.";

export default defineCard({
  name: "Desert Nomads",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 2,
  toughness: 2,
  keywords: ["desertwalk"],
  text: `Desertwalk\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self", source: { subtype: "Desert" } },
      text: PREVENT_TEXT,
    },
  ],
});
