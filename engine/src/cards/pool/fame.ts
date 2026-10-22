import { defineCard } from "../define.js";

// The aftermath half of Claim // Fame: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Claim // Fame", "Claim", "Fame"];

export default defineCard({
  name: "Fame",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget creature gets +2/+0 and gains haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
