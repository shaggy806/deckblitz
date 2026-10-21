import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 27748. "Except by artifact creatures and/or
// white creatures": a blocker that is neither an artifact nor white can't
// block it (Invisibility's shape).

const STATIC_TEXT = "Enchanted creature can't be blocked except by artifact creatures and/or white creatures.";

export default defineCard({
  name: "Seeker",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      cantBeBlockedBy: { notTypes: ["artifact"], notColors: ["W"] },
      text: STATIC_TEXT,
    },
  ],
});
