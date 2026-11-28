import { defineCard } from "../define.js";

// Urza's Legacy. "Becomes an enchantment" replaces its card types (rule
// 205.1a), so it's no longer a creature; "until a player casts a creature
// spell" is the `{ untilSpellCast }` duration, ended as any player's creature
// spell becomes cast (601.2i).

const TEXT = "{1}{W}, {T}: Target creature becomes an enchantment and loses all abilities until a player casts a creature spell.";

export default defineCard({
  name: "Soul Sculptor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "become",
        target: 0,
        setTypes: ["enchantment"],
        loseAbilities: true,
        duration: { untilSpellCast: { type: "creature" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
