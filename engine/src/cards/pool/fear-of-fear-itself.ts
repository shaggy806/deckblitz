import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2).

export default defineCard({
  name: "Fear of Fear Itself",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 4,
  text: "{2}: Target creature gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target creature gains fear until end of turn.",
    },
  ],
});
