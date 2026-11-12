import { defineCard } from "../define.js";

// EDHREC rank 14014. Lunar Frenzy's text.

export default defineCard({
  name: "Frantic Confrontation",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control gets +X/+0 and gains first strike and trample until end of turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
