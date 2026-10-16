import { defineCard } from "../define.js";

// EDHREC rank 9904. Bite Down's wording: a one-sided fight.
export default defineCard({
  name: "Hard-Hitting Question",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control deals damage equal to its power to target creature or planeswalker you don't control.",
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
