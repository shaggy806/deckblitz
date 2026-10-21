import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 29650. Shroud while the enchanted creature is
// untapped — read off the creature's own tapped state (Giant's Amulet's
// shape). It doesn't remove Auras already on it (the ruling): shroud only
// stops targeting.

const STATIC_TEXT = "Enchanted creature has shroud as long as it's untapped.";

export default defineCard({
  name: "Spectral Cloak",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT} (It can't be the target of spells or abilities.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { tapped: false } } },
      grantKeywords: ["shroud"],
      text: STATIC_TEXT,
    },
  ],
});
