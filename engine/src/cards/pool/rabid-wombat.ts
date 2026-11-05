import { defineCard } from "../define.js";

// EDHREC rank 29448.

export default defineCard({
  name: "Rabid Wombat",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wombat"],
  power: 0,
  toughness: 1,
  keywords: ["vigilance"],
  text: "Vigilance\nThis creature gets +2/+2 for each Aura attached to it.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura", attachedTo: { isSource: true } }, pt: [2, 2] },
      text: "This creature gets +2/+2 for each Aura attached to it.",
    },
  ],
});
