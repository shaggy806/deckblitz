import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 28445.

const TEXT = "{1}{B}, {T}, Discard a card: Target creature gets +1/+0 and gains first strike until end of turn.";

export default defineCard({
  name: "Ridged Kusite",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
