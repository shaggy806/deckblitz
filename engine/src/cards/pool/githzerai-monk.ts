import { defineCard } from "../define.js";

// EDHREC rank 9988.

export default defineCard({
  name: "Githzerai Monk",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gith", "Monk"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nPsychic Defense — When this creature enters, tap all creatures you don't control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
      resolve: null,
      text: "Psychic Defense — When this creature enters, tap all creatures you don't control.",
    },
  ],
});
