import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 31942. A Spellshaper (Ridged Kusite's shape).

const TEXT = "{1}{R}, {T}, Discard a card: Target creature gets +1/-1 and gains haste until end of turn.";

export default defineCard({
  name: "Flowstone Channeler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: -1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
