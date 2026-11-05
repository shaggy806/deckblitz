import { defineCard } from "../define.js";

// EDHREC rank 10725.

export default defineCard({
  name: "Mana Breach",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever a player casts a spell, that player returns a land they control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "trigger-controller",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a land you control to its owner's hand",
      },
      resolve: null,
      text: "Whenever a player casts a spell, that player returns a land they control to its owner's hand.",
    },
  ],
});
