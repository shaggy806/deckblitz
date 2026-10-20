import { defineCard } from "../define.js";

export default defineCard({
  name: "Falkenrath Perforator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, it deals 1 damage to defending player.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: "Whenever this creature attacks, it deals 1 damage to defending player.",
    },
  ],
});
