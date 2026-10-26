import { defineCard } from "../define.js";

// EDHREC rank 15463.

export default defineCard({
  name: "Demonic Collusion",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "buyback", also: { text: "Discard two cards", discard: 2 } },
  text: "Buyback—Discard two cards. (You may discard two cards in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nSearch your library for a card, put that card into your hand, then shuffle.",
  effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
});
