import { defineCard } from "../define.js";

// Homelands. EDHREC rank 30676.
const TEXT = "{1}{B}{B}: Veldrane gets -3/-0 and gains forestwalk until end of turn. (It can't be blocked as long as defending player controls a Forest.)";

export default defineCard({
  name: "Veldrane of Sengir",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 5,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: -3, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "forestwalk", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
