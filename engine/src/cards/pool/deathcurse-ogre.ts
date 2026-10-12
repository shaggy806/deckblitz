import { defineCard } from "../define.js";

export default defineCard({
  name: "Deathcurse Ogre",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  text: "When this creature dies, each player loses 3 life.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "each-player" },
      resolve: null,
      text: "When this creature dies, each player loses 3 life.",
    },
  ],
});
