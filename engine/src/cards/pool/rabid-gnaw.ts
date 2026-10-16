import { defineCard } from "../define.js";

// EDHREC rank 8248. Bloomburrow.
//
// Bionic Blow's shape with a fixed +1/+0: the pump, then a one-sided fight.
// The creature you don't control gone, the pump still happens; yours gone,
// nothing does (the ruling).
export default defineCard({
  name: "Rabid Gnaw",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 until end of turn. Then it deals damage equal to its power to target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
