import { defineCard } from "../define.js";

export default defineCard({
  name: "Mortal Combat",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, if twenty or more creature cards are in your graveyard, you win the game.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      // An intervening if (rule 603.4): checked as it triggers and again as it resolves.
      condition: { kind: "cards-in-graveyard", atLeast: 20, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: "At the beginning of your upkeep, if twenty or more creature cards are in your graveyard, you win the game.",
    },
  ],
});
