import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 15497.
const TEXT = "{T}: Target creature gets +1/+1 and gains flying, first strike, and trample until end of turn.";

export default defineCard({
  name: "Power Matrix",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
