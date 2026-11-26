import { defineCard } from "../define.js";

// EDHREC rank 24289. "With enchant creature" is the Aura's own enchant
// ability, exactly "Enchant creature" (`enchantAbility`), not a host.

const TEXT = "You may cast Aura spells with enchant creature as though they had flash.";

export default defineCard({
  name: "Rootwater Shaman",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { subtype: "Aura", enchantAbility: "creature" },
      text: TEXT,
    },
  ],
});
