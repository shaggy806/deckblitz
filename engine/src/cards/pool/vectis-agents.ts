import { defineCard } from "../define.js";

// EDHREC rank 31396.

const TEXT = "{U}{B}: This creature gets -2/-0 until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Vectis Agents",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: -2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
