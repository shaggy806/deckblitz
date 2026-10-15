import { defineCard } from "../define.js";

// Scathing Shadelock's prepare spell (rule 722): no card of its own.

export default defineCard({
  name: "Venomous Words",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target creature you control gets +2/+0 and gains deathtouch until end of turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
    ],
  },
  prepareSpellOnly: true,
});
