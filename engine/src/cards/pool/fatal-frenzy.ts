import { defineCard } from "../define.js";

// Planar Chaos (PLC). X is the creature's power as the spell resolves (Wine
// of Blood and Iron's `powerOf`). The delayed sacrifice is Angrath's
// `sacrifice-target`, which sacrifices it only while you still control it
// (the ruling).
const TEXT =
  "Until end of turn, target creature you control gains trample and gets +X/+0, where X is its power. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Fatal Frenzy",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: { powerOf: 0 }, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "sacrifice-target", target: 0 },
        text: "Sacrifice the creature Fatal Frenzy pumped.",
      },
    ],
  },
});
