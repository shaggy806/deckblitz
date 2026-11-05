import { defineCard } from "../define.js";

// The sorcery back face of Blex, Vexing Pest. Any number may go to hand whatever
// your life total (the ruling); the life is lost for what went.

export default defineCard({
  name: "Search for Blex",
  art: "https://cards.scryfall.io/art_crop/back/c/2/c204b7ca-0904-40fa-b20c-92400fae20b8.jpg",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card you put into your hand this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 5, min: 0, max: 5, destination: "hand", leftover: "graveyard" },
      { kind: "lose-life", amount: { product: [{ thisWay: "put-into-hand" }, 3] } },
    ],
  },
  faces: ["Blex, Vexing Pest", "Search for Blex"],
});
