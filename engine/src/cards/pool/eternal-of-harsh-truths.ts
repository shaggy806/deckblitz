import { defineCard } from "../define.js";

// EDHREC rank 18065.

export default defineCard({
  name: "Eternal of Harsh Truths",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 1,
  toughness: 3,
  text: "Afflict 2 (Whenever this creature becomes blocked, defending player loses 2 life.)\nWhenever this creature attacks and isn't blocked, draw a card.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-player" },
      resolve: null,
      text: "Afflict 2",
    },
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks and isn't blocked, draw a card.",
    },
  ],
});
