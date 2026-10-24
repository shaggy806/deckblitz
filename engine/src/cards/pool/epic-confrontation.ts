import { defineCard } from "../define.js";

// EDHREC rank 16180. Ruthless Predation's shape.
export default defineCard({
  name: "Epic Confrontation",
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
