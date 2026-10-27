import { defineCard } from "../define.js";

// EDHREC rank 25254.

const TEXT = "{B}, {T}, Discard a card: Target creature gets -1/-1 until end of turn.";

export default defineCard({
  name: "Plague Witch",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
