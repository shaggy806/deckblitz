import { defineCard } from "../define.js";

// EDHREC rank 18049.

export default defineCard({
  name: "Hyperion, Supreme Hero",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eternal", "Hero"],
  power: 7,
  toughness: 7,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nIf a source would deal damage to you or a Hero you control, prevent all but 1 of that damage.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "your-side", toFilter: { subtypes: ["Hero"] }, preventAllBut: 1 },
      text: "If a source would deal damage to you or a Hero you control, prevent all but 1 of that damage.",
    },
  ],
});
