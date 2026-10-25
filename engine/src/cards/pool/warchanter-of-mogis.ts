import { defineCard } from "../define.js";

// EDHREC rank 24488.
const TEXT =
  "Inspired — Whenever this creature becomes untapped, target creature you control gains intimidate until end of turn. (A creature with intimidate can't be blocked except by artifact creatures and/or creatures that share a color with it.)";

export default defineCard({
  name: "Warchanter of Mogis",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "intimidate", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
