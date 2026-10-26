import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 27300.
//
// Rulings:
//   [2004-10-04] The target loses just one of the listed abilities.
//
// Urborg's shape: a resolution-time `modal` (no `announced`) over the one
// target, so "your choice" is made as the ability resolves.

const TEXT = "{T}: Target creature loses your choice of flying, first strike, or trample until end of turn.";

export default defineCard({
  name: "Walking Sponge",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sponge"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Flying",
            effect: { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
          },
          {
            text: "First strike",
            effect: { kind: "lose-keywords", target: 0, keywords: ["first-strike"], duration: "end-of-turn" },
          },
          {
            text: "Trample",
            effect: { kind: "lose-keywords", target: 0, keywords: ["trample"], duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
