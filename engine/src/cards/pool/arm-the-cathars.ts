import { defineCard } from "../define.js";

// EDHREC rank 22036. Three different creatures when three are chosen (the
// ruling): each later slot is "other" than the earlier ones (Mabel's Mettle's
// shape). "Those creatures" are the targets, each still legal as it resolves.
export default defineCard({
  name: "Arm the Cathars",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Until end of turn, target creature gets +3/+3, up to one other target creature gets +2/+2, and up to one other target creature gets +1/+1. Those creatures gain vigilance until end of turn.",
  targets: [
    "creature",
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 2, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 2, keyword: "vigilance", duration: "end-of-turn" },
    ],
  },
});
