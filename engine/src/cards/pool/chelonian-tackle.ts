import { defineCard } from "../define.js";

// EDHREC rank 18079.
//
// Bridgeworks Battle's shape: the fight is "up to one" target, so the
// pump still happens with no creature to fight.

export default defineCard({
  name: "Chelonian Tackle",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control gets +0/+10 until end of turn. Then it fights up to one target creature an opponent controls. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 0, toughness: 10, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
