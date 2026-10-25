import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 15914.
//
// The cards stay exiled once the turn ends; a land is played with a land
// drop and a spell with its normal timing (the rulings).

export default defineCard({
  name: "Act on Impulse",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile the top three cards of your library. Until end of turn, you may play those cards. (If you cast a spell this way, you still pay its costs. You can play a land this way only if you have an available land play remaining.)",
  targets: [],
  effect: { kind: "impulse-exile", amount: 3, duration: "end-of-turn" },
});
