import { defineCard } from "../define.js";

// EDHREC rank 30537.

export default defineCard({
  name: "Marshdrinker Giant",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 3,
  text: "When this creature enters, destroy target Island or Swamp an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { subtypes: ["Island", "Swamp"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target Island or Swamp an opponent controls.",
    },
  ],
});
