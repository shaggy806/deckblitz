import { defineCard } from "../define.js";

// Bite Down's shape: either target illegal, no damage (the ruling).

const FACES = ["Thrash // Threat", "Thrash", "Threat"];

export default defineCard({
  name: "Thrash",
  manaCost: "{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to target creature or planeswalker you don't control.",
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
  faces: FACES,
  split: true,
});
