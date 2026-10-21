import { defineCard } from "../define.js";

// "You may planeswalk" does nothing outside a Planechase game (the ruling).
export default defineCard({
  name: "Start the TARDIS",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{1}{U}", discard: 1, keyword: "jump-start" },
  text: "Surveil 2, then draw a card. You may planeswalk. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  effect: { kind: "surveil", amount: 2, then: { kind: "draw", amount: 1 } },
});
