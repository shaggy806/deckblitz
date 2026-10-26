import { defineCard } from "../define.js";

// EDHREC rank 17172.

export default defineCard({
  name: "Revenge of the Hunted",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Until end of turn, target creature gets +6/+6 and gains trample, and all creatures able to block it this turn do so.\nMiracle {G} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  miracle: { cost: "{G}" },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 6, toughness: 6, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
    ],
  },
});
