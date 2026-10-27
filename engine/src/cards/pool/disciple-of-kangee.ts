import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 31676.

const TEXT = "{U}, {T}: Target creature gains flying and becomes blue until end of turn.";

export default defineCard({
  name: "Disciple of Kangee",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "become-color", target: 0, colors: ["U"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
