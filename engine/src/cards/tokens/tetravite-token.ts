import { defineCard } from "../define.js";

// A 1/1 colorless Tetravite artifact creature with flying and "This token
// can't be enchanted" — Tetravus's token (no token printing in the snapshot,
// so no art).
export default defineCard({
  name: "Tetravite Token",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Tetravite"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis token can't be enchanted.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-attached", attachment: "aura", object: { isSource: true } }],
      text: "This token can't be enchanted.",
    },
  ],
});
