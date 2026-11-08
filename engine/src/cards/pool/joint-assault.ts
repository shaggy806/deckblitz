import { defineCard } from "../define.js";

// EDHREC rank 30906.
//
// Rulings:
//   [2012-05-01] Joint Assault targets only one creature. If that creature is an illegal target
//     when Joint Assault tries to resolve, it won’t resolve and none of its effects will happen.
//     No creature will get +2/+2.
//   [2012-05-01] Joint Assault checks whether the target creature is paired only when it resolves.
//     If it becomes unpaired later in the turn, neither creature will lose the bonus. Similarly,
//     if it becomes paired later in the turn, the creature it’s paired with won’t gain the bonus.

export default defineCard({
  name: "Joint Assault",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If it's paired with a creature, that creature also gets +2/+2 until end of turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: { pairedWith: 0 }, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
  targets: ["creature"],
});
