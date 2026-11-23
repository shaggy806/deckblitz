import { defineCard } from "../define.js";

// A playtest card (Mystery Booster). The discard trigger is Guerrilla
// Tactics's: it works from the graveyard the card was discarded to.

export default defineCard({
  name: "Gorilla Tactics",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create a 2/2 green Gorilla creature token.\nWhen a spell or ability an opponent controls causes you to discard Gorilla Tactics, create two 2/2 green Gorilla creature tokens.",
  effect: { kind: "create-token", token: "Gorilla Token", count: 1 },
  triggered: [
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: [],
      effect: { kind: "create-token", token: "Gorilla Token", count: 2 },
      resolve: null,
      text: "When a spell or ability an opponent controls causes you to discard Gorilla Tactics, create two 2/2 green Gorilla creature tokens.",
    },
  ],
});
