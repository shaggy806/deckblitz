import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 17551.
//
// A spell that's both green and blue triggers both abilities.

export default defineCard({
  name: "Fable of Wolf and Owl",
  manaCost: "{3}{G/U}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  text: "Whenever you cast a green spell, you may create a 2/2 green Wolf creature token.\nWhenever you cast a blue spell, you may create a 1/1 blue Bird creature token with flying.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 2/2 green Wolf creature token?",
        effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      },
      resolve: null,
      text: "Whenever you cast a green spell, you may create a 2/2 green Wolf creature token.",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 blue Bird creature token with flying?",
        effect: { kind: "create-token", token: "1/1 Blue Bird Token", count: 1 },
      },
      resolve: null,
      text: "Whenever you cast a blue spell, you may create a 1/1 blue Bird creature token with flying.",
    },
  ],
});
