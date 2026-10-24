import { defineCard } from "../define.js";

// EDHREC rank 20149.
// Makes Insect → use "Insect Token".

export default defineCard({
  name: "It of the Horrid Swarm",
  manaCost: "{8}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Insect"],
  power: 4,
  toughness: 4,
  emerge: { cost: "{6}{G}" },
  text: "Emerge {6}{G} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, create two 1/1 green Insect creature tokens.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: 2 },
      resolve: null,
      text: "When you cast this spell, create two 1/1 green Insect creature tokens.",
    },
  ],
});
