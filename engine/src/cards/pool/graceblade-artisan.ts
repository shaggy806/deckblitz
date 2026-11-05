import { defineCard } from "../define.js";

// EDHREC rank 23959.

export default defineCard({
  name: "Graceblade Artisan",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 3,
  text: "This creature gets +2/+2 for each Aura attached to it.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura", attachedTo: { isSource: true } }, pt: [2, 2] },
      text: "This creature gets +2/+2 for each Aura attached to it.",
    },
  ],
});
