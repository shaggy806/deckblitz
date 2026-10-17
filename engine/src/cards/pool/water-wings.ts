import { defineCard } from "../define.js";

// EDHREC rank 12789.
//
// Rulings:
//   [2023-09-01] Water Wings overwrites any previous effects that set the creature's power and/or
//     toughness to specific values. Effects that otherwise modify its power and toughness will
//     still apply no matter when they took effect. The same is true for +1/+1 counters.
//
// Quandrix Charm's base-P/T `animate` (layer 7b, so later modifications and
// counters still apply on top — the ruling), with its keyword grant.

export default defineCard({
  name: "Water Wings",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature you control has base power and toughness 4/4 and gains flying and hexproof. (It can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 4,
    addTypes: [],
    addSubtypes: [],
    keywords: ["flying", "hexproof"],
    duration: "end-of-turn",
  },
});
