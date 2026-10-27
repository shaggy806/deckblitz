import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 24495. Saprazzan Legate's `freeCastIf`.

export default defineCard({
  name: "Deepwood Legate",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 1,
  toughness: 1,
  text: "If an opponent controls a Forest and you control a Swamp, you may cast this spell without paying its mana cost.\n{B}: This creature gets +1/+1 until end of turn.",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Forest" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
      ],
    },
  },
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gets +1/+1 until end of turn.",
    },
  ],
});
