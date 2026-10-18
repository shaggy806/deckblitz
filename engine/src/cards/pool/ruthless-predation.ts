import { defineCard } from "../define.js";

// EDHREC rank 19404.
//
// Bridgeworks Battle's shape with a required second target: "a creature you
// don't control" is the pool's `creature-an-opponent-controls` (every other
// player is an opponent).
export default defineCard({
  name: "Ruthless Predation",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control gets +1/+2 until end of turn. It fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
