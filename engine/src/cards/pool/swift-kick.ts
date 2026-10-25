import { defineCard } from "../define.js";

// EDHREC rank 25753. Epic Confrontation's shape.

export default defineCard({
  name: "Swift Kick",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 until end of turn. It fights target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
