import { defineCard } from "../define.js";

const TEXT = "Any player may cast Sliver spells as though they had flash.";

// Every player's Sliver spells, not only its controller's (rule 601.3b);
// a changeling spell is a Sliver spell.
export default defineCard({
  name: "Quick Sliver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { subtype: "Sliver" },
      castAsThoughFlashAnyPlayer: true,
      text: TEXT,
    },
  ],
});
