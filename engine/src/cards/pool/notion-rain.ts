import { defineCard } from "../define.js";

// EDHREC rank 8754. Guilds of Ravnica.

export default defineCard({
  name: "Notion Rain",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Surveil 2, then draw two cards. Notion Rain deals 2 damage to you. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: 2 },
      { kind: "draw", amount: 2 },
      { kind: "damage", amount: 2, who: "you" },
    ],
  },
});
