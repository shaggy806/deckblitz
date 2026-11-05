import { defineCard } from "../define.js";

// Mana Breach's shape: the player whose creature entered chooses which of
// their lands goes back.
export default defineCard({
  name: "Overburden",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever a player puts a nontoken creature onto the battlefield, that player returns a land they control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", token: false } },
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
      text: "Whenever a player puts a nontoken creature onto the battlefield, that player returns a land they control to its owner's hand.",
    },
  ],
});
