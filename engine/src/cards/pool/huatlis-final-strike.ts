import { defineCard } from "../define.js";

// EDHREC rank 19518.

export default defineCard({
  name: "Huatli's Final Strike",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 until end of turn. It deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
