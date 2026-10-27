import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 19427.

const TEXT = "Prevent all damage that would be dealt to Cho-Manno.";

export default defineCard({
  name: "Cho-Manno, Revolutionary",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: TEXT,
    },
  ],
});
