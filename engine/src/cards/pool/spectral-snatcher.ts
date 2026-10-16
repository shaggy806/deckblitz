import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 14021.

export default defineCard({
  name: "Spectral Snatcher",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 6,
  toughness: 5,
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: "Ward—Discard a card. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player discards a card.)\nSwampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)",
  triggered: [ward({ discard: 1 })],
});
